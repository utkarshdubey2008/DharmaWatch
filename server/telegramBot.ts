/**
 * DharmaWatch Broadsheet Newsroom Telegram Control Bot & Administrative Console
 * Bot Username: @Dwadmincontrolbot
 * Full control over news publishing, wire editorial, lead/breaking management,
 * judicial case files, whistleblower intake, correspondents bureau, circulation,
 * and system health metrics.
 */

import { db } from './db.js';
import { registerTipNotifier } from './routes/tips.routes.js';
import { decryptTipEnvelope } from './cryptoVault.js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const SITE_BASE_URL = process.env.SITE_URL || 'http://localhost:3006';
const PUBLIC_DOMAIN = (process.env.PUBLIC_DOMAIN || 'https://yourdomain.com').replace(/\/$/, '');
const DOCS_ROUTE = process.env.DOCS_ROUTE || '/wire-specs-7x9q2p';

function getTgButtonUrl(pathname = '') {
  const cleanPath = pathname ? (pathname.startsWith('/') ? pathname : `/${pathname}`) : '';
  return `${PUBLIC_DOMAIN.replace(/\/$/, '')}${cleanPath}`;
}

interface UserState {
  step:
    | 'IDLE'
    | 'WAIT_CATEGORY'
    | 'WAIT_HEADLINE'
    | 'WAIT_DECK'
    | 'WAIT_CONTENT'
    | 'WAIT_IMAGE'
    | 'WAIT_BREAKING_TEXT'
    | 'WAIT_SEARCH'
    | 'WAIT_EDIT_HEADLINE'
    | 'WAIT_EDIT_DECK'
    | 'WAIT_EDIT_CONTENT'
    | 'WAIT_ADD_CASE'
    | 'WAIT_ADD_AUTHOR'
    | 'CONFIRM_POST';
  draft: {
    categorySlug?: string;
    category?: string;
    title?: string;
    deck?: string;
    content?: string;
    heroImage?: string;
    imageCaption?: string;
    authorName?: string;
    authorRole?: string;
    isLead?: boolean;
    isBreaking?: boolean;
    isInvestigation?: boolean;
  };
  activeArticleId?: string;
  paginationPage?: number;
}

const userStates: Record<number, UserState> = {};

function getUserState(chatId: number): UserState {
  if (!userStates[chatId]) {
    userStates[chatId] = { step: 'IDLE', draft: {}, paginationPage: 1 };
  }
  return userStates[chatId];
}

function resetUserState(chatId: number) {
  userStates[chatId] = { step: 'IDLE', draft: {}, paginationPage: 1 };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCESS CONTROL & ADMIN AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────
const PRIMARY_ADMIN_IDS = new Set<number>();
const PRIMARY_ADMIN_USERNAMES = new Set<string>();

function isAuthorizedAdmin(chatId: number, username = ''): boolean {
  if (PRIMARY_ADMIN_IDS.has(chatId)) return true;
  if (username && PRIMARY_ADMIN_USERNAMES.has(username.toLowerCase().replace(/^@/, ''))) return true;

  // Check environment variables
  if (process.env.ADMIN_TELEGRAM_IDS) {
    const envIds = process.env.ADMIN_TELEGRAM_IDS.split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    if (envIds.includes(chatId)) return true;
  }
  if (process.env.ADMIN_TELEGRAM_USERNAMES && username) {
    const envUsers = process.env.ADMIN_TELEGRAM_USERNAMES.split(',').map((s) => s.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);
    if (envUsers.includes(username.toLowerCase().replace(/^@/, ''))) return true;
  }

  // Check database table
  try {
    const row = db.prepare('SELECT is_admin FROM bot_admin_chats WHERE chat_id = ?').get(chatId) as any;
    if (row && Number(row.is_admin) === 1) return true;
    if (username) {
      const uRow = db.prepare('SELECT is_admin FROM bot_admin_chats WHERE LOWER(username) = ?').get(username.toLowerCase().replace(/^@/, '')) as any;
      if (uRow && Number(uRow.is_admin) === 1) return true;
    }
  } catch (err: any) {
    console.error('[Admin Auth Check Error]:', err.message);
  }

  return false;
}

// Record active admin chat for instant whistleblower push alerts
function recordAdminChat(chatId: number, username = '', firstName = '') {
  try {
    const now = new Date().toISOString();
    const isAdmin = isAuthorizedAdmin(chatId, username) ? 1 : 0;
    db.prepare(`
      INSERT INTO bot_admin_chats (chat_id, username, first_name, last_seen, is_admin)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(chat_id) DO UPDATE SET username = excluded.username, first_name = excluded.first_name, last_seen = excluded.last_seen, is_admin = excluded.is_admin
    `).run(chatId, username, firstName, now, isAdmin);
  } catch (e: any) {
    console.error('[Record Admin Chat Error]:', e.message);
  }
}

// Broadcast message to all verified admin chats
async function broadcastToAdmins(text: string, replyMarkup?: any) {
  try {
    const rows = db.prepare('SELECT chat_id FROM bot_admin_chats WHERE is_admin = 1').all() as any[];
    const targetChatIds = new Set<number>([...PRIMARY_ADMIN_IDS, ...rows.map((r) => Number(r.chat_id))]);
    for (const cId of targetChatIds) {
      await sendMessage(cId, text, replyMarkup);
    }
  } catch (err: any) {
    console.error('[Admin Broadcast Error]:', err.message);
  }
}

// Register real-time push alert hook for incoming web whistleblower tips
registerTipNotifier(async (tip: any) => {
  const alertText =
    `🛡️ <b>NEW WHISTLEBLOWER TIP RECEIVED!</b>\n\n` +
    `<b>Receipt Token:</b> <code>${tip.receiptToken}</code>\n` +
    `<b>Department:</b> ${tip.department}\n` +
    `<b>Urgency:</b> <code>${tip.urgency.toUpperCase()}</code>\n` +
    (tip.subject ? `<b>Subject:</b> ${tip.subject}\n` : '') +
    `<b>Message Snippet:</b>\n<i>"${tip.message.substring(0, 150)}${tip.message.length > 150 ? '...' : ''}"</i>\n\n` +
    `<i>Access the admin ingest queue to review full testimony and evidence.</i>`;

  await broadcastToAdmins(alertText, {
    inline_keyboard: [
      [{ text: '🛡️ Open Whistleblower Queue', callback_data: 'menu_tips' }],
      [{ text: '🔙 Command Menu', callback_data: 'main_menu' }],
    ],
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TELEGRAM RAW API CLIENT WITH AUTO-RETRY & FALLBACK RECOVERY
// ─────────────────────────────────────────────────────────────────────────────
async function callTg(method: string, payload: Record<string, any> = {}, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) {
        console.error(`[TelegramBot Error] ${method}:`, json.description);
      }
      return json;
    } catch (err: any) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      console.error(`[TelegramBot Network Error] ${method}:`, err.message);
      return { ok: false, error: err.message };
    }
  }
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  let res = await callTg('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    reply_markup: replyMarkup,
  });

  // Fallback 1: If rejected because of markup/buttons, retry without markup
  if (!res.ok && replyMarkup) {
    console.warn(`[TelegramBot Fallback] sendMessage failed (${res.description || res.error}), retrying without reply_markup...`);
    res = await callTg('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });
  }

  // Fallback 2: If rejected because of HTML parsing, retry as plain text
  if (!res.ok) {
    console.warn(`[TelegramBot Fallback] sendMessage failed (${res.description || res.error}), retrying as plain text...`);
    const plainText = text.replace(/<[^>]+>/g, '');
    res = await callTg('sendMessage', {
      chat_id: chatId,
      text: plainText,
      disable_web_page_preview: false,
    });
  }

  return res;
}

async function editMessage(chatId: number, messageId: number, text: string, replyMarkup?: any) {
  let res = await callTg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: false,
    reply_markup: replyMarkup,
  });

  // Fallback 1: Retry without markup
  if (!res.ok && replyMarkup) {
    console.warn(`[TelegramBot Fallback] editMessageText failed (${res.description || res.error}), retrying without reply_markup...`);
    res = await callTg('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    });
  }

  // Fallback 2: Retry as plain text
  if (!res.ok) {
    console.warn(`[TelegramBot Fallback] editMessageText failed (${res.description || res.error}), retrying as plain text...`);
    const plainText = text.replace(/<[^>]+>/g, '');
    res = await callTg('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: plainText,
      disable_web_page_preview: false,
    });
  }

  return res;
}

async function answerCallbackQuery(callbackQueryId: string, text?: string, showAlert = false) {
  return callTg('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

// Register Telegram Bot Command Menu
async function registerCommands() {
  const commands = [
    { command: 'start', description: 'Editorial Command Dashboard & Overview' },
    { command: 'post', description: 'Interactive Step-by-Step Story Publisher' },
    { command: 'quickpost', description: 'One-Shot Wire Dispatch (cat | title | body)' },
    { command: 'search', description: 'Search articles by keyword or title' },
    { command: 'articles', description: 'Browse and edit published articles' },
    { command: 'lead', description: 'Set Front-Page #1 Lead Hero story' },
    { command: 'breaking', description: 'Control real-time breaking news banner' },
    { command: 'tips', description: 'Whistleblower intake queue & receipts' },
    { command: 'cases', description: 'Judicial case files & audit dossiers' },
    { command: 'addcase', description: 'Add new case file (title | type | status | summary)' },
    { command: 'authors', description: 'Newsroom bureau & registered correspondents' },
    { command: 'addauthor', description: 'Register author (name | role | email)' },
    { command: 'subscribers', description: 'Subscriber circulation & newsletter list' },
    { command: 'system', description: 'Server diagnostics, memory & DB vacuum' },
    { command: 'stats', description: 'Live newsroom & reader traffic metrics' },
    { command: 'docs', description: 'Confidential Syndication Feeds & API Docs' },
    { command: 'help', description: 'Full operational admin manual & cheat sheet' },
    { command: 'cancel', description: 'Cancel active draft or input session' },
  ];

  await callTg('setMyCommands', { commands });
}

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE HELPERS & PUBLISHING LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function getDatabaseStats() {
  const articlesCount = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as any)?.count || 0;
  const publishedCount = (db.prepare("SELECT COUNT(*) as count FROM articles WHERE status = 'published'").get() as any)?.count || 0;
  const caseFilesCount = (db.prepare('SELECT COUNT(*) as count FROM case_files').get() as any)?.count || 0;
  const authorsCount = (db.prepare('SELECT COUNT(*) as count FROM authors').get() as any)?.count || 0;
  const subscribersCount = (db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as any)?.count || 0;
  const unreadTipsCount = (db.prepare("SELECT COUNT(*) as count FROM whistleblower_tips WHERE status = 'unread'").get() as any)?.count || 0;
  const totalTipsCount = (db.prepare('SELECT COUNT(*) as count FROM whistleblower_tips').get() as any)?.count || 0;

  const currentLead = db.prepare(`
    SELECT a.title, a.slug, a.category_slug FROM homepage_slots s
    JOIN articles a ON s.reference_id = a.id
    WHERE s.slot_name = 'lead_story'
  `).get() as any;

  const currentBreaking = db.prepare(`
    SELECT a.title, a.slug, a.category_slug FROM homepage_slots s
    JOIN articles a ON s.reference_id = a.id
    WHERE s.slot_name = 'breaking'
  `).get() as any;

  return {
    articlesCount,
    publishedCount,
    caseFilesCount,
    authorsCount,
    subscribersCount,
    unreadTipsCount,
    totalTipsCount,
    currentLead: currentLead ? currentLead.title : 'None set',
    currentBreaking: currentBreaking ? currentBreaking.title : 'None set',
  };
}

function publishStory(draft: UserState['draft']) {
  const {
    title = '',
    deck = '',
    categorySlug = 'national',
    content = '',
    heroImage = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=1200',
    imageCaption = '',
    authorName = 'National Bureau',
    authorRole = 'Political & Governance Bureau',
    isLead = false,
    isBreaking = false,
    isInvestigation = false,
  } = draft;

  const now = new Date().toISOString();

  // Author resolution
  const authorSlug = authorName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
  const existingAuthor = db.prepare('SELECT id FROM authors WHERE id = ? OR slug = ?').get(authorSlug, authorSlug);
  if (!existingAuthor) {
    db.prepare(`
      INSERT INTO authors (id, name, slug, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, ?, ?)
    `).run(authorSlug, authorName, authorSlug, authorRole, now, now);
  }

  // Slug generation
  const baseSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const existingSlug = db.prepare('SELECT id FROM articles WHERE slug = ?').get(baseSlug);
  const slug = existingSlug ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}` : baseSlug;
  const uniqueId = `art-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  // Parse paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const wordCount = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const leadFlag = isLead ? 1 : 0;
  const breakingFlag = isBreaking ? 1 : 0;
  const investigationFlag = isInvestigation || categorySlug === 'investigations' ? 1 : 0;

  if (leadFlag === 1) {
    db.prepare('UPDATE articles SET is_lead = 0').run();
  }

  const categoryName = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  const stmt = db.prepare(`
    INSERT INTO articles (
      id, title, slug, deck, category, category_slug, subcategory, author_id,
      published_at, updated_at, scheduled_at, excerpt, hero_image, image_caption,
      content, pull_quotes, tags, status, article_type, location, is_investigation,
      is_lead, is_breaking, is_opinion, is_fact_check, read_time_minutes,
      evidence_summary, seo_title, seo_meta_description, canonical_url,
      views_count, created_by, published_by, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      0, ?, ?, ?
    )
  `);

  stmt.run(
    uniqueId,
    title.trim(),
    slug,
    deck.trim(),
    categoryName,
    categorySlug,
    null,
    authorSlug,
    now,
    null,
    null,
    deck ? deck.trim() : (paragraphs[0] ? paragraphs[0].substring(0, 180) + '...' : title),
    heroImage,
    imageCaption,
    JSON.stringify(paragraphs),
    JSON.stringify([]),
    JSON.stringify([categorySlug]),
    'published',
    isBreaking ? 'breaking' : (isInvestigation ? 'investigation' : 'news'),
    JSON.stringify({ city: 'New Delhi', country: 'India' }),
    investigationFlag,
    leadFlag,
    breakingFlag,
    categorySlug === 'opinions' ? 1 : 0,
    categorySlug === 'fact-check' ? 1 : 0,
    readTime,
    JSON.stringify({}),
    title.trim(),
    deck || (paragraphs[0] ? paragraphs[0].substring(0, 160) : title),
    `${PUBLIC_DOMAIN}/${categorySlug}/${slug}`,
    'telegram-bot',
    'telegram-bot',
    now
  );

  if (leadFlag === 1) {
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-lead_story', 'lead_story', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(uniqueId, now);
  }
  if (breakingFlag === 1) {
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-breaking', 'breaking', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(uniqueId, now);
  }

  return {
    id: uniqueId,
    slug,
    categorySlug,
    url: `/${categorySlug}/${slug}`,
    title,
    readTime,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC MENUS & KEYBOARD BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function buildMainMenuKeyboard(unreadTips = 0) {
  const tipsLabel = unreadTips > 0 ? `🛡️ Tips Queue (${unreadTips} NEW)` : '🛡️ Tips Intake';

  return {
    inline_keyboard: [
      [
        { text: '📰 Compose Story', callback_data: 'menu_post_story' },
        { text: '🔎 Search Articles', callback_data: 'prompt_search' },
      ],
      [
        { text: '⚡ Breaking Ticker', callback_data: 'menu_breaking' },
        { text: '⭐ Lead Story Hub', callback_data: 'menu_lead_story' },
      ],
      [
        { text: '📋 Recent Articles', callback_data: 'menu_articles_page_1' },
        { text: tipsLabel, callback_data: 'menu_tips' },
      ],
      [
        { text: '📁 Case Files', callback_data: 'menu_case_files' },
        { text: '✍️ Newsroom Authors', callback_data: 'menu_authors' },
      ],
      [
        { text: '👥 Subscribers', callback_data: 'menu_subscribers' },
        { text: '⚙️ System Health', callback_data: 'menu_system' },
      ],
      [
        { text: '📊 Traffic & Stats', callback_data: 'menu_stats' },
        { text: '❓ Operator Guide', callback_data: 'menu_help' },
      ],
      [
        { text: '🌐 Open Live Front Page', url: getTgButtonUrl() },
        { text: '📚 API & Wire Specs', callback_data: 'menu_docs' },
      ],
    ],
  };
}

function buildCategorySelectorKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🏛️ National', callback_data: 'cat_national' },
        { text: '📈 Economy & Markets', callback_data: 'cat_economy' },
      ],
      [
        { text: '🌍 World', callback_data: 'cat_world' },
        { text: '✍️ Opinion & Editorial', callback_data: 'cat_opinions' },
      ],
      [
        { text: '🔍 Investigations', callback_data: 'cat_investigations' },
        { text: '⚖️ Society & Culture', callback_data: 'cat_society-culture' },
      ],
      [
        { text: '✅ Fact Check', callback_data: 'cat_fact-check' },
        { text: '🚨 Public Safety', callback_data: 'cat_violence' },
      ],
      [
        { text: '❌ Cancel Story', callback_data: 'cancel_post' },
      ],
    ],
  };
}

function buildConfirmPostKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🚀 Publish Live Story', callback_data: 'confirm_publish_standard' },
      ],
      [
        { text: '⭐ Publish as #1 Front Lead', callback_data: 'confirm_publish_lead' },
        { text: '⚡ Publish as Breaking Alert', callback_data: 'confirm_publish_breaking' },
      ],
      [
        { text: '✏️ Edit Headline', callback_data: 'edit_draft_headline' },
        { text: '✏️ Edit Content', callback_data: 'edit_draft_content' },
      ],
      [
        { text: '❌ Discard Draft', callback_data: 'cancel_post' },
      ],
    ],
  };
}

function buildArticleDetailKeyboard(artId: string, isLead: boolean, isBreaking: boolean, categorySlug: string, slug: string) {
  return {
    inline_keyboard: [
      [
        isLead
          ? { text: '⭐ Lead Story (Active)', callback_data: `already_lead` }
          : { text: '⭐ Promote to Lead Story', callback_data: `set_lead_${artId}` },
        isBreaking
          ? { text: '⚡ Clear Breaking Alert', callback_data: `clear_breaking` }
          : { text: '⚡ Set as Breaking News', callback_data: `set_break_${artId}` },
      ],
      [
        { text: '✏️ Edit Headline', callback_data: `edit_art_head_${artId}` },
        { text: '✏️ Edit Deck', callback_data: `edit_art_deck_${artId}` },
      ],
      [
        { text: '✏️ Edit Body Copy', callback_data: `edit_art_body_${artId}` },
        { text: '🔄 Toggle Publish/Draft', callback_data: `toggle_status_${artId}` },
      ],
      [
        { text: '🔗 View on Web', url: getTgButtonUrl(`/${categorySlug}/${slug}`) },
        { text: '🗑️ Delete Story', callback_data: `confirm_del_${artId}` },
      ],
      [
        { text: '📋 Back to Articles List', callback_data: 'menu_articles_page_1' },
        { text: '🔙 Main Menu', callback_data: 'main_menu' },
      ],
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CALLBACK QUERY DISPATCHER (INLINE BUTTONS)
// ─────────────────────────────────────────────────────────────────────────────
async function handleCallbackQuery(cq: any) {
  const data = cq.data;
  const chatId = cq.message?.chat?.id;
  const messageId = cq.message?.message_id;

  if (!chatId || !messageId) return;

  const username = cq.from?.username || '';
  console.log(`[Telegram Bot Callback] Chat=${chatId} User=${username || cq.from?.id} Data=${data}`);

  if (!isAuthorizedAdmin(chatId, username)) {
    console.warn(`[Telegram Security Alert] Unauthorized callback query from Chat=${chatId} User=@${username}`);
    await answerCallbackQuery(cq.id, '⛔ Access Denied: Unauthorized newsroom terminal', true);
    return;
  }

  const state = getUserState(chatId);

  // 1. MAIN MENU
  if (data === 'main_menu') {
    resetUserState(chatId);
    const stats = getDatabaseStats();
    const text = `<b>🏛️ DHARMAWATCH EDITORIAL COMMAND CONSOLE</b>\n\n` +
      `<i>National Broadsheet & Investigative Journal of Record</i>\n\n` +
      `<b>📊 Newsroom Overview:</b>\n` +
      `• Total Articles: <b>${stats.articlesCount}</b> (${stats.publishedCount} Published)\n` +
      `• Whistleblower Tips: <b>${stats.totalTipsCount}</b> (${stats.unreadTipsCount} Unread)\n` +
      `• Case Dossiers: <b>${stats.caseFilesCount}</b> | Authors: <b>${stats.authorsCount}</b>\n` +
      `• Circulation Subscribers: <b>${stats.subscribersCount}</b>\n` +
      `• Front-Page Lead: <i>${stats.currentLead}</i>\n` +
      `• Breaking Banner: <i>${stats.currentBreaking}</i>\n\n` +
      `Select an operational action below:`;
    await editMessage(chatId, messageId, text, buildMainMenuKeyboard(stats.unreadTipsCount));
    await answerCallbackQuery(cq.id);
    return;
  }

  // 2. QUICK POST STORY FLOW
  if (data === 'menu_post_story') {
    state.step = 'WAIT_CATEGORY';
    state.draft = {};
    const text = `<b>📰 COMPOSE NEW STORY — [Step 1 of 5]</b>\n\n` +
      `Select the target reporting desk / broadsheet section:`;
    await editMessage(chatId, messageId, text, buildCategorySelectorKeyboard());
    await answerCallbackQuery(cq.id, 'Step 1: Choose Section');
    return;
  }

  // PROMPT SEARCH
  if (data === 'prompt_search') {
    state.step = 'WAIT_SEARCH';
    await editMessage(chatId, messageId, `<b>🔎 SEARCH ARTICLES ARCHIVE:</b>\n\nSend your search keywords, title, or topic in the chat:`, {
      inline_keyboard: [[{ text: '❌ Cancel Search', callback_data: 'main_menu' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // CATEGORY PICKED
  if (data.startsWith('cat_')) {
    const catSlug = data.replace('cat_', '');
    state.draft.categorySlug = catSlug;
    state.step = 'WAIT_HEADLINE';
    const text = `<b>📰 SECTION SELECTED:</b> <code>${catSlug.toUpperCase()}</code>\n\n` +
      `<b>[Step 2 of 5]:</b> Please send the <b>Headline / Title</b> for this story.\n\n` +
      `<i>(Type the headline directly in the chat)</i>`;
    await editMessage(chatId, messageId, text, {
      inline_keyboard: [[{ text: '❌ Cancel Story', callback_data: 'cancel_post' }]],
    });
    await answerCallbackQuery(cq.id, `Selected: ${catSlug}`);
    return;
  }

  // SKIP SUBTITLE / DECK
  if (data === 'skip_deck') {
    state.step = 'WAIT_CONTENT';
    const text = `<b>⏩ Subtitle skipped.</b>\n\n` +
      `<b>[Step 4 of 5]:</b> Please send the <b>Story Body Content</b>.\n\n` +
      `<i>Formatting Tips:</i>\n` +
      `• Separate paragraphs with blank lines.\n` +
      `• Use <code>## Subheading</code> for intermediate titles.`;
    await editMessage(chatId, messageId, text, {
      inline_keyboard: [[{ text: '❌ Cancel Story', callback_data: 'cancel_post' }]],
    });
    await answerCallbackQuery(cq.id, 'Subtitle skipped');
    return;
  }

  // SKIP PHOTO
  if (data === 'skip_photo') {
    state.step = 'CONFIRM_POST';
    state.draft.heroImage = 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=1200';
    state.draft.imageCaption = 'DharmaWatch National Newsroom Archive photo.';

    const wordCount = (state.draft.content || '').split(/\s+/).filter(Boolean).length;
    const estTime = Math.max(1, Math.ceil(wordCount / 200));

    const previewMsg = `<b>📋 CONFIRM STORY DISPATCH:</b>\n\n` +
      `<b>Section:</b> <code>${(state.draft.categorySlug || 'NATIONAL').toUpperCase()}</code>\n` +
      `<b>Headline:</b> ${state.draft.title}\n` +
      (state.draft.deck ? `<b>Standfirst:</b> <i>${state.draft.deck}</i>\n` : '') +
      `<b>Word Count:</b> ${wordCount} words (~${estTime} min read)\n` +
      `<b>Photo:</b> Standard Editorial Broadsheet Asset\n\n` +
      `Choose publishing option below:`;

    await editMessage(chatId, messageId, previewMsg, buildConfirmPostKeyboard());
    await answerCallbackQuery(cq.id, 'Using default editorial photo');
    return;
  }

  // EDIT DRAFT ITEMS
  if (data === 'edit_draft_headline') {
    state.step = 'WAIT_HEADLINE';
    await editMessage(chatId, messageId, `<b>✏️ Please send the updated Headline / Title:</b>`, {
      inline_keyboard: [[{ text: '❌ Discard Draft', callback_data: 'cancel_post' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'edit_draft_content') {
    state.step = 'WAIT_CONTENT';
    await editMessage(chatId, messageId, `<b>✏️ Please send the updated Story Body Content:</b>`, {
      inline_keyboard: [[{ text: '❌ Discard Draft', callback_data: 'cancel_post' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // CANCEL POST
  if (data === 'cancel_post') {
    resetUserState(chatId);
    await editMessage(chatId, messageId, `❌ <i>Story posting draft was cancelled.</i>`, {
      inline_keyboard: [[{ text: '🔙 Back to Command Menu', callback_data: 'main_menu' }]],
    });
    await answerCallbackQuery(cq.id, 'Draft discarded');
    return;
  }

  // CONFIRM PUBLISH (STANDARD, LEAD, BREAKING)
  if (data.startsWith('confirm_publish_')) {
    const mode = data.replace('confirm_publish_', '');
    if (mode === 'lead') state.draft.isLead = true;
    if (mode === 'breaking') state.draft.isBreaking = true;

    try {
      const published = publishStory(state.draft);
      resetUserState(chatId);

      const successText = `<b>🚀 STORY PUBLISHED TO LIVE WIRE!</b>\n\n` +
        `<b>Headline:</b> ${published.title}\n` +
        `<b>Section:</b> <code>${published.categorySlug.toUpperCase()}</code>\n` +
        `<b>Read Time:</b> ${published.readTime} min read\n` +
        `<b>Placement:</b> ${mode === 'lead' ? '⭐ Front-Page Lead Story' : (mode === 'breaking' ? '⚡ Breaking News Banner' : 'Standard Broadsheet Wire')}\n\n` +
        `<b>🔗 Canonical URL:</b>\n<code>${SITE_BASE_URL}${published.url}</code>`;

      await editMessage(chatId, messageId, successText, {
        inline_keyboard: [
          [{ text: '🌐 View Live Story on Web', url: getTgButtonUrl(published.url) }],
          [{ text: '📰 Compose Another Story', callback_data: 'menu_post_story' }],
          [{ text: '🔙 Back to Command Menu', callback_data: 'main_menu' }],
        ],
      });
      await answerCallbackQuery(cq.id, 'Story published successfully!', true);
    } catch (e: any) {
      await sendMessage(chatId, `❌ Failed to publish story: ${e.message}`);
    }
    return;
  }

  // 3. STATS
  if (data === 'menu_stats') {
    const stats = getDatabaseStats();
    const rows = db.prepare('SELECT title, views_count FROM articles ORDER BY views_count DESC LIMIT 5').all() as any[];
    let topArticles = rows.map((r, i) => `${i + 1}. ${r.title.substring(0, 45)}... (<b>${r.views_count}</b> views)`).join('\n');
    if (!topArticles) topArticles = 'No reader analytics recorded yet.';

    const text = `<b>📊 NEWSROOM ARCHIVAL & TRAFFIC METRICS</b>\n\n` +
      `• Total Articles: <b>${stats.articlesCount}</b>\n` +
      `• Published Stories: <b>${stats.publishedCount}</b>\n` +
      `• Investigative Dossiers: <b>${stats.caseFilesCount}</b>\n` +
      `• Whistleblower Ingests: <b>${stats.totalTipsCount}</b> (${stats.unreadTipsCount} unread)\n` +
      `• Registered Subscribers: <b>${stats.subscribersCount}</b>\n` +
      `• Correspondents Catalog: <b>${stats.authorsCount}</b>\n\n` +
      `<b>📈 Most Read Articles:</b>\n${topArticles}`;

    await editMessage(chatId, messageId, text, {
      inline_keyboard: [
        [{ text: '🔄 Refresh Metrics', callback_data: 'menu_stats' }],
        [{ text: '🔙 Back to Command Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // 4. ARTICLES LIST WITH PAGINATION
  if (data.startsWith('menu_articles_page_')) {
    const page = Math.max(1, parseInt(data.replace('menu_articles_page_', ''), 10) || 1);
    state.paginationPage = page;
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const totalCount = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as any)?.count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const recents = db.prepare(`
      SELECT id, title, slug, category_slug, is_lead, is_breaking, status, published_at
      FROM articles
      ORDER BY published_at DESC
      LIMIT ? OFFSET ?
    `).all(pageSize, offset) as any[];

    if (recents.length === 0) {
      await editMessage(chatId, messageId, `<i>No articles found on page ${page}.</i>`, {
        inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]],
      });
      await answerCallbackQuery(cq.id);
      return;
    }

    let text = `<b>📋 PUBLISHED ARTICLES — PAGE ${page} OF ${totalPages}</b>\n` +
      `<i>Tap any article below to inspect, edit, or change placement:</i>\n\n`;

    const buttons: any[] = [];

    recents.forEach((art, idx) => {
      const num = offset + idx + 1;
      const leadBadge = art.is_lead ? '⭐ [LEAD]' : '';
      const breakBadge = art.is_breaking ? '⚡ [BREAKING]' : '';
      const draftBadge = art.status === 'draft' ? '📝 [DRAFT]' : '';
      const badges = [leadBadge, breakBadge, draftBadge].filter(Boolean).join(' ');

      text += `<b>${num}. ${art.title}</b> ${badges}\n` +
        `<i>${art.category_slug.toUpperCase()} • ID: ${art.id}</i>\n\n`;

      buttons.push([
        { text: `🔎 #${num}: ${art.title.substring(0, 32)}...`, callback_data: `view_art_${art.id}` },
      ]);
    });

    const navRow: any[] = [];
    if (page > 1) {
      navRow.push({ text: '⬅️ Prev Page', callback_data: `menu_articles_page_${page - 1}` });
    }
    navRow.push({ text: `Page ${page}/${totalPages}`, callback_data: `menu_articles_page_${page}` });
    if (page < totalPages) {
      navRow.push({ text: 'Next Page ➡️', callback_data: `menu_articles_page_${page + 1}` });
    }
    buttons.push(navRow);
    buttons.push([{ text: '🔙 Back to Command Menu', callback_data: 'main_menu' }]);

    await editMessage(chatId, messageId, text, { inline_keyboard: buttons });
    await answerCallbackQuery(cq.id);
    return;
  }

  // VIEW SINGLE ARTICLE DETAIL
  if (data.startsWith('view_art_')) {
    const artId = data.replace('view_art_', '');
    const art = db.prepare('SELECT * FROM articles WHERE id = ?').get(artId) as any;

    if (!art) {
      await answerCallbackQuery(cq.id, 'Article not found', true);
      return;
    }

    const detailText = `<b>📄 ARTICLE RECORD: ${art.id}</b>\n\n` +
      `<b>Title:</b> ${art.title}\n` +
      (art.deck ? `<b>Standfirst:</b> <i>${art.deck}</i>\n` : '') +
      `<b>Section:</b> <code>${art.category_slug.toUpperCase()}</code>\n` +
      `<b>Byline:</b> ${art.author_id}\n` +
      `<b>Published:</b> ${art.published_at}\n` +
      `<b>Status:</b> ${art.status.toUpperCase()}\n` +
      `<b>Front-Page Lead:</b> ${art.is_lead ? '⭐ YES' : 'No'}\n` +
      `<b>Breaking Banner:</b> ${art.is_breaking ? '⚡ YES' : 'No'}\n` +
      `<b>Views:</b> ${art.views_count}\n\n` +
      `Manage placement flags, edit content, or open on web below:`;

    await editMessage(
      chatId,
      messageId,
      detailText,
      buildArticleDetailKeyboard(art.id, Boolean(art.is_lead), Boolean(art.is_breaking), art.category_slug, art.slug)
    );
    await answerCallbackQuery(cq.id);
    return;
  }

  // EDIT ARTICLE HEADLINE
  if (data.startsWith('edit_art_head_')) {
    const artId = data.replace('edit_art_head_', '');
    state.activeArticleId = artId;
    state.step = 'WAIT_EDIT_HEADLINE';
    await editMessage(chatId, messageId, `<b>✏️ EDIT HEADLINE FOR ARTICLE <code>${artId}</code>:</b>\n\nPlease send the new Headline text:`, {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: `view_art_${artId}` }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // EDIT ARTICLE DECK
  if (data.startsWith('edit_art_deck_')) {
    const artId = data.replace('edit_art_deck_', '');
    state.activeArticleId = artId;
    state.step = 'WAIT_EDIT_DECK';
    await editMessage(chatId, messageId, `<b>✏️ EDIT DECK / SUBTITLE FOR <code>${artId}</code>:</b>\n\nPlease send the new Deck summary:`, {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: `view_art_${artId}` }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // EDIT ARTICLE BODY COPY
  if (data.startsWith('edit_art_body_')) {
    const artId = data.replace('edit_art_body_', '');
    state.activeArticleId = artId;
    state.step = 'WAIT_EDIT_CONTENT';
    await editMessage(chatId, messageId, `<b>✏️ EDIT BODY COPY FOR <code>${artId}</code>:</b>\n\nPlease send the complete updated story content (paragraphs separated by blank lines):`, {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: `view_art_${artId}` }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // TOGGLE STATUS (DRAFT <-> PUBLISHED)
  if (data.startsWith('toggle_status_')) {
    const artId = data.replace('toggle_status_', '');
    const art = db.prepare('SELECT status FROM articles WHERE id = ?').get(artId) as any;
    if (art) {
      const nextStatus = art.status === 'published' ? 'draft' : 'published';
      db.prepare('UPDATE articles SET status = ?, updated_at = ? WHERE id = ?').run(nextStatus, new Date().toISOString(), artId);
      await answerCallbackQuery(cq.id, `Status set to ${nextStatus.toUpperCase()}`, true);

      // Refresh view
      const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(artId) as any;
      await editMessage(
        chatId,
        messageId,
        `✅ <b>Status updated to: ${nextStatus.toUpperCase()}</b>\n\n<b>Title:</b> ${updated.title}`,
        buildArticleDetailKeyboard(updated.id, Boolean(updated.is_lead), Boolean(updated.is_breaking), updated.category_slug, updated.slug)
      );
    }
    return;
  }

  // SET LEAD ACTION
  if (data.startsWith('set_lead_')) {
    const artId = data.replace('set_lead_', '');
    db.prepare('UPDATE articles SET is_lead = 0').run();
    db.prepare('UPDATE articles SET is_lead = 1 WHERE id = ?').run(artId);
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-lead_story', 'lead_story', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(artId, new Date().toISOString());

    await answerCallbackQuery(cq.id, 'Promoted to Front-Page Lead!', true);
    const art = db.prepare('SELECT * FROM articles WHERE id = ?').get(artId) as any;
    if (art) {
      await editMessage(
        chatId,
        messageId,
        `✅ <b>Promoted to #1 Front-Page Lead Story!</b>\n\n<b>Title:</b> ${art.title}`,
        buildArticleDetailKeyboard(art.id, true, Boolean(art.is_breaking), art.category_slug, art.slug)
      );
    }
    return;
  }

  // SET BREAKING ACTION
  if (data.startsWith('set_break_')) {
    const artId = data.replace('set_break_', '');
    db.prepare('UPDATE articles SET is_breaking = 1 WHERE id = ?').run(artId);
    db.prepare(`
      INSERT INTO homepage_slots (id, slot_name, reference_id, reference_type, updated_at)
      VALUES ('slot-breaking', 'breaking', ?, 'article', ?)
      ON CONFLICT(slot_name) DO UPDATE SET reference_id = excluded.reference_id, updated_at = excluded.updated_at
    `).run(artId, new Date().toISOString());

    await answerCallbackQuery(cq.id, 'Flashed on Breaking Banner!', true);
    const art = db.prepare('SELECT * FROM articles WHERE id = ?').get(artId) as any;
    if (art) {
      await editMessage(
        chatId,
        messageId,
        `⚡ <b>Flashed on Live Breaking News Ticker!</b>\n\n<b>Title:</b> ${art.title}`,
        buildArticleDetailKeyboard(art.id, Boolean(art.is_lead), true, art.category_slug, art.slug)
      );
    }
    return;
  }

  // DELETE ARTICLE CONFIRMATION
  if (data.startsWith('confirm_del_')) {
    const artId = data.replace('confirm_del_', '');
    await editMessage(
      chatId,
      messageId,
      `⚠️ <b>CONFIRM DELETION</b>\n\nAre you sure you want to permanently delete article <code>${artId}</code>? This cannot be undone.`,
      {
        inline_keyboard: [
          [{ text: '🔴 Yes, Delete Permanently', callback_data: `exec_del_${artId}` }],
          [{ text: '❌ No, Cancel', callback_data: `view_art_${artId}` }],
        ],
      }
    );
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data.startsWith('exec_del_')) {
    const artId = data.replace('exec_del_', '');
    db.prepare('DELETE FROM homepage_slots WHERE reference_id = ?').run(artId);
    db.prepare('DELETE FROM article_sources WHERE article_id = ?').run(artId);
    db.prepare('DELETE FROM articles WHERE id = ?').run(artId);

    await answerCallbackQuery(cq.id, 'Story deleted from database', true);
    await editMessage(chatId, messageId, `🗑️ <b>Article ${artId} deleted from the wire.</b>`, {
      inline_keyboard: [
        [{ text: '📋 Back to Articles List', callback_data: 'menu_articles_page_1' }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // 5. BREAKING NEWS HUB
  if (data === 'menu_breaking') {
    const cur = db.prepare(`
      SELECT a.id, a.title, a.slug, a.category_slug FROM homepage_slots s
      JOIN articles a ON s.reference_id = a.id
      WHERE s.slot_name = 'breaking'
    `).get() as any;

    const text = `<b>⚡ LIVE BREAKING NEWS TICKER CONTROL</b>\n\n` +
      `<b>Current Active Breaking Banner:</b>\n${cur ? `<i>${cur.title}</i>` : '<i>[No active breaking ticker]</i>'}\n\n` +
      `Choose an action:`;

    await editMessage(chatId, messageId, text, {
      inline_keyboard: [
        [{ text: '✏️ Set Custom Ticker Alert', callback_data: 'prompt_custom_breaking' }],
        [{ text: '❌ Disable Breaking Alert', callback_data: 'clear_breaking' }],
        [{ text: '📋 Pick from Recent Articles', callback_data: 'menu_articles_page_1' }],
        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'prompt_custom_breaking') {
    state.step = 'WAIT_BREAKING_TEXT';
    await editMessage(chatId, messageId, `<b>⚡ Please send the text for the Breaking News Ticker:</b>\n\n<i>(Type the alert text directly in the chat)</i>`, {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'menu_breaking' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'clear_breaking') {
    db.prepare("DELETE FROM homepage_slots WHERE slot_name = 'breaking'").run();
    db.prepare("UPDATE articles SET is_breaking = 0 WHERE is_breaking = 1").run();
    await answerCallbackQuery(cq.id, 'Breaking ticker disabled', true);
    await editMessage(chatId, messageId, `✅ <b>Breaking news banner disabled.</b>`, {
      inline_keyboard: [[{ text: '🔙 Main Menu', callback_data: 'main_menu' }]],
    });
    return;
  }

  // 6. LEAD STORY HUB
  if (data === 'menu_lead_story') {
    const cur = db.prepare(`
      SELECT a.id, a.title, a.slug, a.category_slug FROM homepage_slots s
      JOIN articles a ON s.reference_id = a.id
      WHERE s.slot_name = 'lead_story'
    `).get() as any;

    const text = `<b>⭐ FRONT-PAGE LEAD STORY HUB</b>\n\n` +
      `<b>Current #1 Hero Splash:</b>\n${cur ? `<i>${cur.title}</i>` : '<i>[None set]</i>'}\n\n` +
      `To switch the lead story, select an article from the wire:`;

    await editMessage(chatId, messageId, text, {
      inline_keyboard: [
        [{ text: '📋 Browse & Pick Lead Story', callback_data: 'menu_articles_page_1' }],
        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // 7. CASE FILES
  if (data === 'menu_case_files') {
    const cases = db.prepare('SELECT id, title, status, incident_type FROM case_files ORDER BY created_at DESC LIMIT 6').all() as any[];
    let text = `<b>📁 ACTIVE JUDICIAL CASE FILES & AUDIT DOSSIERS:</b>\n\n`;
    const buttons: any[] = [];

    cases.forEach((c, idx) => {
      text += `<b>${idx + 1}. ${c.title}</b>\n` +
        `<i>Status: ${c.status} • Category: ${c.incident_type}</i>\n\n`;
      buttons.push([{ text: `🔎 Dossier #${idx + 1}: ${c.title.substring(0, 30)}...`, callback_data: `view_case_${c.id}` }]);
    });

    buttons.push([
      { text: '➕ Add New Case File', callback_data: 'prompt_add_case' },
    ]);
    buttons.push([{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]);

    await editMessage(chatId, messageId, text, { inline_keyboard: buttons });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data.startsWith('view_case_')) {
    const caseId = data.replace('view_case_', '');
    const c = db.prepare('SELECT * FROM case_files WHERE id = ?').get(caseId) as any;
    if (!c) {
      await answerCallbackQuery(cq.id, 'Case file not found', true);
      return;
    }

    const caseText = `<b>📁 DOSSIER RECORD: ${c.id}</b>\n\n` +
      `<b>Title:</b> ${c.title}\n` +
      `<b>Type:</b> ${c.incident_type}\n` +
      `<b>Status:</b> ${c.status}\n` +
      `<b>Summary:</b> ${c.summary || 'No summary registered.'}\n\n` +
      `<b>Created:</b> ${c.created_at}`;

    await editMessage(chatId, messageId, caseText, {
      inline_keyboard: [
        [{ text: '📁 Back to Dossiers', callback_data: 'menu_case_files' }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'prompt_add_case') {
    state.step = 'WAIT_ADD_CASE';
    await editMessage(chatId, messageId, `<b>➕ ADD NEW CASE DOSSIER:</b>\n\nSend case details in format:\n<code>Title | Incident Type | Status | Summary</code>\n\n<i>Example:</i>\n<code>Delhi Excise Policy Trial | Corruption & Bribery | Trial Ongoing | Special CBI Court proceedings on liquor policy formulation...</code>`, {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'menu_case_files' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'menu_docs') {
    const docUrl = `${PUBLIC_DOMAIN}${DOCS_ROUTE}`;
    const docText = `<b>📚 CONFIDENTIAL SYNDICATION & API SPECIFICATIONS</b>\n\n` +
      `<b>Private Newsroom Docs Portal:</b>\n<code>${docUrl}</code>\n\n` +
      `<i>Contains full expected response schemas, field breakdowns, cURL tests, and copy-paste automation scripts for:</i>\n` +
      `• Master RSS 2.0 (<code>/rss.xml</code>)\n` +
      `• Category Beaten Wires (<code>/rss/:category.xml</code>)\n` +
      `• Google News XML Protocol (<code>/news-sitemap.xml</code>)\n` +
      `• Master Sitemap (<code>/sitemap.xml</code>)\n` +
      `• JSON Feed v1.1 (<code>/feed.json</code>)\n` +
      `• Programmatic Cross-Posting API (<code>/api/feed/latest</code>)\n` +
      `• Public REST Articles & Case Files APIs\n` +
      `• Ready-to-run Python Telegram forwarder script\n\n` +
      `<i>Note: This path is disallowed in robots.txt and strictly private.</i>`;

    await editMessage(chatId, messageId, docText, {
      inline_keyboard: [
        [{ text: '📖 Open Secret Docs Page', url: docUrl }],
        [{ text: '🔙 Back to Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // 8. TIPS QUEUE
  if (data === 'menu_tips') {
    const tips = db.prepare('SELECT id, receipt_token, department, urgency, subject, status, created_at FROM whistleblower_tips ORDER BY created_at DESC LIMIT 6').all() as any[];
    const unreadCount = (db.prepare("SELECT COUNT(*) as count FROM whistleblower_tips WHERE status = 'unread'").get() as any)?.count || 0;

    let text = `<b>🛡️ CONFIDENTIAL WHISTLEBLOWER INTAKE QUEUE</b>\n\n` +
      `<b>Total Intake:</b> ${tips.length} submissions (${unreadCount} UNREAD)\n` +
      `<b>Encryption:</b> Zero-Log Ingest via Web, PGP & Signal\n\n`;

    const buttons: any[] = [];
    if (tips.length === 0) {
      text += `<i>No tips submitted in the intake queue yet.</i>`;
    } else {
      tips.forEach((t, idx) => {
        const badge = t.status === 'unread' ? '🔴 [NEW]' : `[${t.status.toUpperCase()}]`;
        text += `<b>${idx + 1}. ${t.receipt_token}</b> ${badge}\n` +
          `<i>Desk: ${t.department} • Urgency: ${t.urgency}</i>\n` +
          (t.subject ? `Subject: ${t.subject}\n` : '') + `\n`;

        buttons.push([{ text: `🔎 Inspect Tip #${idx + 1} (${t.receipt_token})`, callback_data: `view_tip_${t.id}` }]);
      });
    }

    buttons.push([{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]);

    await editMessage(chatId, messageId, text, { inline_keyboard: buttons });
    await answerCallbackQuery(cq.id);
    return;
  }

  // VIEW SINGLE TIP
  if (data.startsWith('view_tip_')) {
    const tipId = data.replace('view_tip_', '');
    const tip = db.prepare('SELECT * FROM whistleblower_tips WHERE id = ?').get(tipId) as any;
    if (!tip) {
      await answerCallbackQuery(cq.id, 'Tip not found', true);
      return;
    }

    // Auto mark as investigating if unread
    if (tip.status === 'unread') {
      db.prepare("UPDATE whistleblower_tips SET status = 'investigating', updated_at = ? WHERE id = ?").run(new Date().toISOString(), tipId);
    }

    let testimonyText = tip.message;
    const isE2EE = Boolean(tip.encrypted_envelope);
    let contactInfo = '';
    let filesList: string[] = [];

    if (tip.encrypted_envelope) {
      const dec = decryptTipEnvelope(tip.encrypted_envelope);
      if (dec.isDecrypted) {
        testimonyText = dec.message;
        if (dec.contactHandle) contactInfo = dec.contactHandle;
        if (dec.files && dec.files.length > 0) filesList = dec.files;
      }
    }

    const tipDetail = `<b>🛡️ WHISTLEBLOWER TESTIMONY: ${tip.receipt_token}</b>\n\n` +
      `<b>Encryption:</b> 🔒 ${isE2EE ? 'Verified E2EE (RSA-OAEP-256 + AES-GCM)' : 'Standard Encrypted-at-Rest'}\n` +
      `<b>Key Fingerprint:</b> <code>${tip.fingerprint || '4F82:B931:0A7E:98C2'}</code>\n` +
      `<b>Department:</b> ${tip.department}\n` +
      `<b>Urgency:</b> <code>${tip.urgency.toUpperCase()}</code>\n` +
      `<b>Current Status:</b> <code>${tip.status.toUpperCase()}</code>\n` +
      `<b>Timestamp:</b> ${tip.created_at}\n` +
      (tip.subject ? `<b>Subject:</b> ${tip.subject}\n` : '') +
      (contactInfo ? `<b>Secure Handle:</b> <code>${contactInfo}</code>\n` : '') +
      (filesList.length > 0 ? `<b>Scrubbed Attachments:</b> ${filesList.join(', ')}\n` : '') +
      `\n<b>Decrypted Testimony Content:</b>\n<i>"${testimonyText}"</i>\n\n` +
      `Update investigative status below:`;

    await editMessage(chatId, messageId, tipDetail, {
      inline_keyboard: [
        [
          { text: '🔍 Investigating', callback_data: `tip_status_${tip.id}_investigating` },
          { text: '✅ Mark Verified', callback_data: `tip_status_${tip.id}_verified` },
        ],
        [
          { text: '📁 Archive Tip', callback_data: `tip_status_${tip.id}_archived` },
          { text: '📋 Back to Tips Queue', callback_data: 'menu_tips' },
        ],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data.startsWith('tip_status_')) {
    const parts = data.replace('tip_status_', '').split('_');
    const tipId = parts[0];
    const newStatus = parts[1];
    db.prepare('UPDATE whistleblower_tips SET status = ?, updated_at = ? WHERE id = ?').run(newStatus, new Date().toISOString(), tipId);
    await answerCallbackQuery(cq.id, `Status updated to ${newStatus}`, true);

    // Refresh view
    const tip = db.prepare('SELECT * FROM whistleblower_tips WHERE id = ?').get(tipId) as any;
    if (tip) {
      await editMessage(
        chatId,
        messageId,
        `✅ <b>Status updated to: ${newStatus.toUpperCase()}</b>\n\n<b>Receipt:</b> <code>${tip.receipt_token}</code>`,
        {
          inline_keyboard: [
            [{ text: '📋 Back to Tips Queue', callback_data: 'menu_tips' }],
            [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
          ],
        }
      );
    }
    return;
  }

  // 9. AUTHORS BUREAU
  if (data === 'menu_authors') {
    const authors = db.prepare(`
      SELECT a.id, a.name, a.role, COUNT(art.id) as art_count
      FROM authors a
      LEFT JOIN articles art ON art.author_id = a.id OR art.author_id = a.slug
      GROUP BY a.id
      ORDER BY art_count DESC
      LIMIT 8
    `).all() as any[];

    let text = `<b>✍️ NEWSROOM BUREAUS & CORRESPONDENTS</b>\n\n`;
    authors.forEach((a, i) => {
      text += `<b>${i + 1}. ${a.name}</b> (${a.art_count} stories)\n` +
        `<i>${a.role} • ID: ${a.id}</i>\n\n`;
    });

    await editMessage(chatId, messageId, text, {
      inline_keyboard: [
        [{ text: '➕ Register New Author', callback_data: 'prompt_add_author' }],
        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'prompt_add_author') {
    state.step = 'WAIT_ADD_AUTHOR';
    await editMessage(chatId, messageId, `<b>➕ REGISTER NEW AUTHOR:</b>\n\nSend author details in format:\n<code>Name | Role | Email</code>\n\n<i>Example:</i>\n<code>Sanjay Verma | Senior Legal Correspondent | newsroom@thedharmawatch.in</code>`, {
      inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'menu_authors' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // 10. SUBSCRIBERS CIRCULATION
  if (data === 'menu_subscribers') {
    const count = (db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as any)?.count || 0;
    const subs = db.prepare('SELECT email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 6').all() as any[];

    let text = `<b>👥 CIRCULATION & NEWSLETTER SUBSCRIBERS</b>\n\n` +
      `<b>Total Verified Subscribers:</b> ${count}\n\n` +
      `<b>Recent Readers:</b>\n`;

    if (subs.length === 0) {
      text += `<i>No subscriber records registered yet.</i>`;
    } else {
      subs.forEach((s, idx) => {
        text += `• ${s.email} (<i>${new Date(s.created_at).toLocaleDateString()}</i>)\n`;
      });
    }

    await editMessage(chatId, messageId, text, {
      inline_keyboard: [[{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  // 11. SYSTEM HEALTH & DIAGNOSTICS
  if (data === 'menu_system') {
    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());
    const uptimeH = Math.floor(uptimeSec / 3600);
    const uptimeM = Math.floor((uptimeSec % 3600) / 60);

    const text = `<b>⚙️ SERVER HEALTH & SYSTEM DIAGNOSTICS</b>\n\n` +
      `• Process Uptime: <b>${uptimeH}h ${uptimeM}m</b>\n` +
      `• RSS Memory: <b>${(mem.rss / 1024 / 1024).toFixed(1)} MB</b>\n` +
      `• Heap Used: <b>${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB</b>\n` +
      `• Node.js Engine: <b>${process.version}</b>\n` +
      `• Platform: <b>${process.platform} (${process.arch})</b>\n` +
      `• Bot Engine: <b>@Dwadmincontrolbot</b> (Active Polling)\n` +
      `• Auto-Host Daemon: <b>systemd dharmawatch.service</b>\n` +
      `• SQLite Journal: <b>WAL Mode</b>\n\n` +
      `Select maintenance operation below:`;

    await editMessage(chatId, messageId, text, {
      inline_keyboard: [
        [{ text: '🧹 Optimize Database & Flush WAL', callback_data: 'exec_vacuum' }],
        [{ text: '🔄 Refresh System Stats', callback_data: 'menu_system' }],
        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }],
      ],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  if (data === 'exec_vacuum') {
    try {
      db.exec('PRAGMA optimize;');
      db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
      await answerCallbackQuery(cq.id, 'Database optimized and WAL flushed!', true);
    } catch (e: any) {
      await answerCallbackQuery(cq.id, `Error: ${e.message}`, true);
    }
    return;
  }

  // 12. OPERATOR GUIDE / HELP
  if (data === 'menu_help') {
    const helpText = `<b>🤖 DHARMAWATCH TELEGRAM BOT OPERATOR GUIDE</b>\n\n` +
      `<b>Editorial Publishing Commands:</b>\n` +
      `• <code>/start</code> - Editorial command console & overview\n` +
      `• <code>/post</code> - Step-by-step interactive article publisher\n` +
      `• <code>/quickpost &lt;cat&gt; | &lt;title&gt; | &lt;body&gt;</code> - Fast one-shot wire dispatch\n` +
      `• <code>/search &lt;query&gt;</code> - Search articles archive by keyword\n` +
      `• <code>/articles</code> - Browse wire articles with page navigation & edit buttons\n` +
      `• <code>/lead</code> - View and assign the #1 homepage lead hero splash\n` +
      `• <code>/breaking &lt;text&gt;</code> - Flash custom text on the breaking ticker\n\n` +
      `<b>Newsroom Governance Commands:</b>\n` +
      `• <code>/tips</code> - Whistleblower intake queue & cryptographic receipts\n` +
      `• <code>/cases</code> - Judicial case files & investigative dossiers\n` +
      `• <code>/addcase &lt;title&gt; | &lt;type&gt; | &lt;status&gt; | &lt;summary&gt;</code>\n` +
      `• <code>/authors</code> - Newsroom correspondents catalog\n` +
      `• <code>/addauthor &lt;name&gt; | &lt;role&gt; | &lt;email&gt;</code>\n` +
      `• <code>/subscribers</code> - Reader newsletter subscriptions\n` +
      `• <code>/system</code> - Server metrics, memory usage, and DB maintenance\n` +
      `• <code>/cancel</code> - Abort current drafting session`;

    await editMessage(chatId, messageId, helpText, {
      inline_keyboard: [[{ text: '🔙 Back to Command Menu', callback_data: 'main_menu' }]],
    });
    await answerCallbackQuery(cq.id);
    return;
  }

  await answerCallbackQuery(cq.id);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT MESSAGE HANDLER (TEXT & MEDIA)
// ─────────────────────────────────────────────────────────────────────────────
async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  const username = msg.from?.username || '';
  const text = msg.text?.trim() || '';

  if (!chatId) return;

  console.log(`[Telegram Bot Message] Chat=${chatId} User=${username || msg.from?.id} Text="${text}"`);

  // STRICT ACCESS CONTROL: Only authorized newsroom administrators are allowed
  if (!isAuthorizedAdmin(chatId, username)) {
    console.warn(`[Telegram Security Alert] Unauthorized access attempt by Chat=${chatId} User=@${username}`);
    await sendMessage(
      chatId,
      `⛔ <b>ACCESS RESTRICTED: DHARMAWATCH EDITORIAL TERMINAL</b>\n\n` +
      `This administrative bot is private and strictly restricted to accredited newsroom editors and authorized system administrators.\n\n` +
      `Your account (<code>${username ? '@' + username : chatId}</code>) is not authorized. All connection requests are logged.`
    );
    return;
  }

  // Record admin chat ID for real-time whistleblower tip notifications
  recordAdminChat(chatId, username, msg.chat?.first_name || '');

  // Admin Management Commands (Only primary admins or authorized editors)
  if (text.startsWith('/addadmin')) {
    const target = text.replace('/addadmin', '').trim();
    if (!target) {
      await sendMessage(chatId, `<b>Usage:</b> <code>/addadmin &lt;chat_id_or_username&gt;</code>`);
      return;
    }
    const targetId = parseInt(target, 10);
    const targetUser = target.replace(/^@/, '');
    const now = new Date().toISOString();

    if (!isNaN(targetId)) {
      db.prepare(`
        INSERT INTO bot_admin_chats (chat_id, username, first_name, last_seen, is_admin)
        VALUES (?, '', 'Admin Grant', ?, 1)
        ON CONFLICT(chat_id) DO UPDATE SET is_admin = 1, last_seen = excluded.last_seen
      `).run(targetId, now);
      await sendMessage(chatId, `✅ <b>Admin privileges granted to Chat ID:</b> <code>${targetId}</code>`);
    } else {
      db.prepare(`
        INSERT INTO bot_admin_chats (chat_id, username, first_name, last_seen, is_admin)
        VALUES (?, ?, 'Admin Grant', ?, 1)
        ON CONFLICT(chat_id) DO UPDATE SET is_admin = 1, last_seen = excluded.last_seen
      `).run(Date.now(), targetUser, now);
      await sendMessage(chatId, `✅ <b>Admin privileges granted to @${targetUser}</b>`);
    }
    return;
  }

  if (text.startsWith('/removeadmin')) {
    const target = text.replace('/removeadmin', '').trim();
    const targetId = parseInt(target, 10);
    const targetUser = target.replace(/^@/, '').toLowerCase();

    if (!isNaN(targetId) && !PRIMARY_ADMIN_IDS.has(targetId)) {
      db.prepare('UPDATE bot_admin_chats SET is_admin = 0 WHERE chat_id = ?').run(targetId);
      await sendMessage(chatId, `✅ <b>Admin privileges revoked for ID:</b> <code>${targetId}</code>`);
    } else if (targetUser && !PRIMARY_ADMIN_USERNAMES.has(targetUser)) {
      db.prepare('UPDATE bot_admin_chats SET is_admin = 0 WHERE LOWER(username) = ?').run(targetUser);
      await sendMessage(chatId, `✅ <b>Admin privileges revoked for @${targetUser}</b>`);
    } else {
      await sendMessage(chatId, `❌ Cannot revoke primary system administrator.`);
    }
    return;
  }

  if (text === '/listadmins') {
    const rows = db.prepare('SELECT chat_id, username, first_name, is_admin FROM bot_admin_chats WHERE is_admin = 1').all() as any[];
    let aText = `<b>🛡️ AUTHORIZED NEWSROOM ADMINISTRATORS:</b>\n\n`;
    if (rows.length === 0) {
      aText += `<i>No additional administrators registered yet. Configure via ADMIN_TELEGRAM_IDS in .env</i>\n`;
    } else {
      rows.forEach((r) => {
        aText += `• ${r.username ? '@' + r.username : 'ID: ' + r.chat_id} (${r.first_name || 'Admin'})\n`;
      });
    }
    await sendMessage(chatId, aText);
    return;
  }

  const state = getUserState(chatId);

  // Global /start or /menu command
  if (text === '/start' || text === '/menu') {
    resetUserState(chatId);
    const stats = getDatabaseStats();
    const welcome = `<b>🏛️ DHARMAWATCH EDITORIAL COMMAND CONSOLE</b>\n\n` +
      `<i>National Broadsheet & Investigative Journal of Record</i>\n\n` +
      `<b>📊 Live Overview:</b>\n` +
      `• Total Articles: <b>${stats.articlesCount}</b> (${stats.publishedCount} Published)\n` +
      `• Whistleblower Tips: <b>${stats.totalTipsCount}</b> (${stats.unreadTipsCount} Unread)\n` +
      `• Case Dossiers: <b>${stats.caseFilesCount}</b> | Authors: <b>${stats.authorsCount}</b>\n` +
      `• Circulation Subscribers: <b>${stats.subscribersCount}</b>\n` +
      `• Front-Page Lead: <i>${stats.currentLead}</i>\n` +
      `• Breaking Banner: <i>${stats.currentBreaking}</i>\n\n` +
      `Select an operational action below:`;
    await sendMessage(chatId, welcome, buildMainMenuKeyboard(stats.unreadTipsCount));
    return;
  }

  // Global /docs or /specs command
  if (text === '/docs' || text === '/specs' || text === '/api') {
    const docUrl = `${PUBLIC_DOMAIN}${DOCS_ROUTE}`;
    const docText = `<b>📚 CONFIDENTIAL SYNDICATION & API SPECIFICATIONS</b>\n\n` +
      `<b>Private Newsroom Docs Portal:</b>\n<code>${docUrl}</code>\n\n` +
      `<i>Contains full expected response schemas, field breakdowns, cURL tests, and copy-paste automation scripts for:</i>\n` +
      `• Master RSS 2.0 (<code>/rss.xml</code>)\n` +
      `• Category Beaten Wires (<code>/rss/:category.xml</code>)\n` +
      `• Google News XML Protocol (<code>/news-sitemap.xml</code>)\n` +
      `• Master Sitemap (<code>/sitemap.xml</code>)\n` +
      `• JSON Feed v1.1 (<code>/feed.json</code>)\n` +
      `• Programmatic Cross-Posting API (<code>/api/feed/latest</code>)\n` +
      `• Public REST Articles & Case Files APIs\n` +
      `• Ready-to-run Python Telegram forwarder script\n\n` +
      `<i>Note: This path is disallowed in robots.txt and strictly private.</i>`;

    await sendMessage(chatId, docText, {
      inline_keyboard: [
        [{ text: '📖 Open Secret Docs Page', url: docUrl }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // Global /post command
  if (text === '/post') {
    state.step = 'WAIT_CATEGORY';
    state.draft = {};
    await sendMessage(
      chatId,
      `<b>📰 COMPOSE NEW STORY — [Step 1 of 5]</b>\n\nSelect the reporting desk / broadsheet section:`,
      buildCategorySelectorKeyboard()
    );
    return;
  }

  // Global /search command
  if (text.startsWith('/search')) {
    const query = text.replace('/search', '').trim();
    if (!query) {
      state.step = 'WAIT_SEARCH';
      await sendMessage(chatId, `<b>🔎 Please send the keyword or title to search:</b>`, {
        inline_keyboard: [[{ text: '❌ Cancel', callback_data: 'main_menu' }]],
      });
      return;
    }

    const results = db.prepare(`
      SELECT id, title, slug, category_slug, is_lead, is_breaking
      FROM articles
      WHERE title LIKE ? OR excerpt LIKE ? OR content LIKE ?
      ORDER BY published_at DESC
      LIMIT 6
    `).all(`%${query}%`, `%${query}%`, `%${query}%`) as any[];

    if (results.length === 0) {
      await sendMessage(chatId, `<i>No articles found matching "${query}".</i>`, {
        inline_keyboard: [
          [{ text: '🔎 Search Again', callback_data: 'prompt_search' }],
          [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
        ],
      });
      return;
    }

    let searchMsg = `<b>🔎 SEARCH RESULTS FOR "${query}" (${results.length} found):</b>\n\n`;
    const buttons: any[] = [];
    results.forEach((art, idx) => {
      searchMsg += `<b>${idx + 1}. ${art.title}</b>\n` +
        `<i>${art.category_slug.toUpperCase()} • ID: ${art.id}</i>\n\n`;
      buttons.push([{ text: `🔎 View #${idx + 1}: ${art.title.substring(0, 32)}...`, callback_data: `view_art_${art.id}` }]);
    });
    buttons.push([{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]);

    await sendMessage(chatId, searchMsg, { inline_keyboard: buttons });
    return;
  }

  // Global /articles command
  if (text === '/articles') {
    resetUserState(chatId);
    const totalCount = (db.prepare('SELECT COUNT(*) as count FROM articles').get() as any)?.count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / 5));
    const recents = db.prepare('SELECT id, title, slug, category_slug, is_lead, is_breaking FROM articles ORDER BY published_at DESC LIMIT 5').all() as any[];

    let listText = `<b>📋 PUBLISHED ARTICLES — PAGE 1 OF ${totalPages}</b>\n` +
      `<i>Tap any article below to inspect, edit, or change placement:</i>\n\n`;

    const buttons: any[] = [];
    recents.forEach((art, idx) => {
      const badge = art.is_lead ? '⭐ [LEAD]' : (art.is_breaking ? '⚡ [BREAKING]' : '');
      listText += `<b>${idx + 1}. ${art.title}</b> ${badge}\n` +
        `<i>${art.category_slug.toUpperCase()} • ID: ${art.id}</i>\n\n`;

      buttons.push([
        { text: `🔎 View #${idx + 1}: ${art.title.substring(0, 30)}...`, callback_data: `view_art_${art.id}` },
      ]);
    });

    if (totalPages > 1) {
      buttons.push([
        { text: `Page 1/${totalPages}`, callback_data: `menu_articles_page_1` },
        { text: 'Next Page ➡️', callback_data: `menu_articles_page_2` },
      ]);
    }
    buttons.push([{ text: '🔙 Back to Command Menu', callback_data: 'main_menu' }]);

    await sendMessage(chatId, listText, { inline_keyboard: buttons });
    return;
  }

  // Global /lead command
  if (text === '/lead') {
    resetUserState(chatId);
    const cur = db.prepare(`
      SELECT a.id, a.title, a.slug, a.category_slug FROM homepage_slots s
      JOIN articles a ON s.reference_id = a.id
      WHERE s.slot_name = 'lead_story'
    `).get() as any;

    const leadMsg = `<b>⭐ FRONT-PAGE LEAD STORY HUB</b>\n\n` +
      `<b>Current #1 Hero Story:</b>\n${cur ? `<i>${cur.title}</i>` : '<i>[None set]</i>'}\n\n` +
      `To switch the lead story, select an article from the wire:`;

    await sendMessage(chatId, leadMsg, {
      inline_keyboard: [
        [{ text: '📋 Pick from Recent Stories', callback_data: 'menu_articles_page_1' }],
        [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // Global /breaking command
  if (text.startsWith('/breaking')) {
    const customText = text.replace('/breaking', '').trim();
    if (!customText) {
      const cur = db.prepare(`
        SELECT a.id, a.title, a.slug, a.category_slug FROM homepage_slots s
        JOIN articles a ON s.reference_id = a.id
        WHERE s.slot_name = 'breaking'
      `).get() as any;

      await sendMessage(
        chatId,
        `<b>⚡ LIVE BREAKING NEWS TICKER CONTROL</b>\n\n` +
        `<b>Current Active Breaking Banner:</b>\n${cur ? `<i>${cur.title}</i>` : '<i>[None set]</i>'}\n\n` +
        `To set custom breaking text directly, send:\n<code>/breaking Headline text here</code>`,
        {
          inline_keyboard: [
            [{ text: '❌ Disable Breaking Alert', callback_data: 'clear_breaking' }],
            [{ text: '📋 Pick from Recent Articles', callback_data: 'menu_articles_page_1' }],
            [{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }],
          ],
        }
      );
      return;
    }

    if (customText.toLowerCase() === 'off' || customText.toLowerCase() === 'clear') {
      db.prepare("DELETE FROM homepage_slots WHERE slot_name = 'breaking'").run();
      db.prepare("UPDATE articles SET is_breaking = 0 WHERE is_breaking = 1").run();
      await sendMessage(chatId, `✅ <b>Breaking news ticker disabled.</b>`, {
        inline_keyboard: [[{ text: '🔙 Main Menu', callback_data: 'main_menu' }]],
      });
      return;
    }

    // Publish breaking alert article
    try {
      const pub = publishStory({
        title: customText,
        categorySlug: 'national',
        content: customText,
        isBreaking: true,
      });

      await sendMessage(
        chatId,
        `⚡ <b>LIVE BREAKING ALERT FLASHED!</b>\n\n` +
        `<b>Headline:</b> ${pub.title}\n` +
        `<b>Link:</b> <code>${SITE_BASE_URL}${pub.url}</code>`,
        {
          inline_keyboard: [
            [{ text: '🌐 View on Web', url: getTgButtonUrl(pub.url) }],
            [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
          ],
        }
      );
    } catch (e: any) {
      await sendMessage(chatId, `❌ Failed to flash breaking news: ${e.message}`);
    }
    return;
  }

  // Global /cases command
  if (text === '/cases') {
    const cases = db.prepare('SELECT id, title, status, incident_type FROM case_files ORDER BY created_at DESC LIMIT 6').all() as any[];
    let casesText = `<b>📁 ACTIVE JUDICIAL CASE FILES & AUDIT DOSSIERS:</b>\n\n`;
    const buttons: any[] = [];
    cases.forEach((c, idx) => {
      casesText += `<b>${idx + 1}. ${c.title}</b>\n` +
        `<i>Status: ${c.status} • Category: ${c.incident_type}</i>\n\n`;
      buttons.push([{ text: `🔎 Dossier #${idx + 1}`, callback_data: `view_case_${c.id}` }]);
    });
    buttons.push([{ text: '➕ Add Case File', callback_data: 'prompt_add_case' }]);
    buttons.push([{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]);

    await sendMessage(chatId, casesText, { inline_keyboard: buttons });
    return;
  }

  // /addcase <title> | <type> | <status> | <summary>
  if (text.startsWith('/addcase')) {
    const raw = text.replace('/addcase', '').trim();
    const parts = raw.split('|').map((p) => p.trim());
    if (parts.length < 4) {
      await sendMessage(chatId, `<b>Syntax:</b> <code>/addcase Title | Type | Status | Summary</code>\n\n<i>Example:</i>\n<code>/addcase Adani-Hindenburg Probe | Securities Fraud | Active Investigation | SEBI investigation into overseas funds...</code>`);
      return;
    }

    const [cTitle, cType, cStatus, cSummary] = parts;
    const now = new Date().toISOString();
    const slug = cTitle.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const caseId = `case-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      db.prepare(`
        INSERT INTO case_files (
          id, title, slug, incident_type, status, summary, verified_source_count,
          total_timeline_events, views_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0, ?, ?)
      `).run(caseId, cTitle, slug, cType, cStatus, cSummary, now, now);

      await sendMessage(chatId, `✅ <b>Case Dossier Created Successfully!</b>\n\n<b>Title:</b> ${cTitle}\n<b>Status:</b> ${cStatus}\n<b>ID:</b> <code>${caseId}</code>`, {
        inline_keyboard: [
          [{ text: '📁 View Dossiers', callback_data: 'menu_case_files' }],
          [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
        ],
      });
    } catch (e: any) {
      await sendMessage(chatId, `❌ Failed to create case: ${e.message}`);
    }
    return;
  }

  // Global /authors command
  if (text === '/authors') {
    const authors = db.prepare('SELECT name, role, email FROM authors LIMIT 8').all() as any[];
    let aText = `<b>✍️ NEWSROOM BUREAUS & CORRESPONDENTS:</b>\n\n`;
    authors.forEach((a, i) => {
      aText += `<b>${i + 1}. ${a.name}</b>\n` +
        `<i>${a.role}</i> • <code>${a.email || 'newsroom@thedharmawatch.in'}</code>\n\n`;
    });
    await sendMessage(chatId, aText, {
      inline_keyboard: [
        [{ text: '➕ Register New Author', callback_data: 'prompt_add_author' }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // /addauthor <name> | <role> | <email>
  if (text.startsWith('/addauthor')) {
    const raw = text.replace('/addauthor', '').trim();
    const parts = raw.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      await sendMessage(chatId, `<b>Syntax:</b> <code>/addauthor Name | Role | Email</code>\n\n<i>Example:</i>\n<code>/addauthor Rajiv Menon | Chief Economic Correspondent | newsroom@thedharmawatch.in</code>`);
      return;
    }

    const [aName, aRole, aEmail] = parts;
    const now = new Date().toISOString();
    const aSlug = aName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const aId = `auth-${Date.now().toString(36)}`;

    try {
      db.prepare(`
        INSERT INTO authors (id, name, slug, role, email, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `).run(aId, aName, aSlug, aRole, aEmail, now, now);

      await sendMessage(chatId, `✅ <b>Author Registered to Newsroom Bureau!</b>\n\n<b>Name:</b> ${aName}\n<b>Role:</b> ${aRole}\n<b>Email:</b> ${aEmail}`, {
        inline_keyboard: [
          [{ text: '✍️ View Authors', callback_data: 'menu_authors' }],
          [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
        ],
      });
    } catch (e: any) {
      await sendMessage(chatId, `❌ Failed to add author: ${e.message}`);
    }
    return;
  }

  // Global /subscribers command
  if (text === '/subscribers') {
    const count = (db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as any)?.count || 0;
    const subs = db.prepare('SELECT email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 8').all() as any[];

    let sText = `<b>👥 SUBSCRIBER CIRCULATION:</b>\n\n` +
      `<b>Total Verified Subscribers:</b> ${count}\n\n`;
    subs.forEach((s) => {
      sText += `• ${s.email} (<i>${new Date(s.created_at).toLocaleDateString()}</i>)\n`;
    });

    await sendMessage(chatId, sText, {
      inline_keyboard: [[{ text: '🔙 Main Menu', callback_data: 'main_menu' }]],
    });
    return;
  }

  // Global /system command
  if (text === '/system') {
    const mem = process.memoryUsage();
    const uptimeSec = Math.floor(process.uptime());
    const uptimeH = Math.floor(uptimeSec / 3600);
    const uptimeM = Math.floor((uptimeSec % 3600) / 60);

    const sText = `<b>⚙️ SERVER HEALTH & SYSTEM DIAGNOSTICS</b>\n\n` +
      `• Process Uptime: <b>${uptimeH}h ${uptimeM}m</b>\n` +
      `• RSS Memory: <b>${(mem.rss / 1024 / 1024).toFixed(1)} MB</b>\n` +
      `• Heap Used: <b>${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB</b>\n` +
      `• Node.js Engine: <b>${process.version}</b>\n` +
      `• Platform: <b>${process.platform} (${process.arch})</b>\n` +
      `• Bot Daemon: <b>@Dwadmincontrolbot</b> (Active Polling)\n` +
      `• Auto-Host Daemon: <b>systemd dharmawatch.service</b>\n` +
      `• SQLite Journal: <b>WAL Mode Enabled</b>`;

    await sendMessage(chatId, sText, {
      inline_keyboard: [
        [{ text: '🧹 Optimize Database & Flush WAL', callback_data: 'exec_vacuum' }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // Global /tips command
  if (text === '/tips') {
    const tips = db.prepare('SELECT id, receipt_token, department, urgency, subject, status FROM whistleblower_tips ORDER BY created_at DESC LIMIT 6').all() as any[];
    const unreadCount = (db.prepare("SELECT COUNT(*) as count FROM whistleblower_tips WHERE status = 'unread'").get() as any)?.count || 0;

    let tipsText = `<b>🛡️ CONFIDENTIAL WHISTLEBLOWER INTAKE QUEUE</b>\n\n` +
      `<b>Total Intake:</b> ${tips.length} submissions (${unreadCount} UNREAD)\n` +
      `• Web Intake: <code>${PUBLIC_DOMAIN}/tips</code>\n` +
      `• Dedicated Signal: <code>@dharmawatch.01</code>\n` +
      `• Newsroom PGP: <code>leak@thedharmawatch.in</code>\n\n`;

    const buttons: any[] = [];
    tips.forEach((t, idx) => {
      const badge = t.status === 'unread' ? '🔴 [NEW]' : `[${t.status.toUpperCase()}]`;
      tipsText += `<b>${idx + 1}. ${t.receipt_token}</b> ${badge}\n` +
        `<i>Desk: ${t.department} • Urgency: ${t.urgency}</i>\n` +
        (t.subject ? `Subject: ${t.subject}\n` : '') + `\n`;

      buttons.push([{ text: `🔎 Inspect #${idx + 1} (${t.receipt_token})`, callback_data: `view_tip_${t.id}` }]);
    });

    buttons.push([{ text: '🔙 Back to Main Menu', callback_data: 'main_menu' }]);

    await sendMessage(chatId, tipsText, { inline_keyboard: buttons });
    return;
  }

  // Stats command
  if (text === '/stats') {
    const stats = getDatabaseStats();
    await sendMessage(
      chatId,
      `<b>📊 NEWSROOM ARCHIVAL & TRAFFIC METRICS</b>\n\n` +
      `• Total Articles: <b>${stats.articlesCount}</b>\n` +
      `• Published Wire: <b>${stats.publishedCount}</b>\n` +
      `• Active Dossiers: <b>${stats.caseFilesCount}</b>\n` +
      `• Whistleblower Intake: <b>${stats.totalTipsCount}</b> (${stats.unreadTipsCount} unread)\n` +
      `• Registered Authors: <b>${stats.authorsCount}</b>\n` +
      `• Circulation Subscribers: <b>${stats.subscribersCount}</b>\n` +
      `• Lead Story: <i>${stats.currentLead}</i>\n` +
      `• Breaking Banner: <i>${stats.currentBreaking}</i>`,
      { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]] }
    );
    return;
  }

  // One-shot quick post command: /quickpost <category> | <headline> | <content>
  if (text.startsWith('/quickpost')) {
    const raw = text.replace('/quickpost', '').trim();
    const parts = raw.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      await sendMessage(
        chatId,
        `<b>Syntax Error:</b> Use format:\n<code>/quickpost category | Headline | Story content</code>\n\n` +
        `<i>Example:</i>\n<code>/quickpost economy | Sensex Rallies 400 Pts | Strong corporate earnings and institutional inflows...</code>`
      );
      return;
    }

    const [categorySlug, title, content] = parts;
    try {
      const pub = publishStory({
        categorySlug: categorySlug.toLowerCase(),
        title,
        content,
      });

      await sendMessage(
        chatId,
        `<b>🚀 FAST-POST PUBLISHED LIVE!</b>\n\n` +
        `<b>Headline:</b> ${pub.title}\n` +
        `<b>Section:</b> <code>${pub.categorySlug.toUpperCase()}</code>\n` +
        `<b>Link:</b> <code>${SITE_BASE_URL}${pub.url}</code>`,
        {
          inline_keyboard: [
            [{ text: '🌐 View on Web', url: getTgButtonUrl(pub.url) }],
            [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
          ],
        }
      );
    } catch (e: any) {
      await sendMessage(chatId, `❌ Error publishing story: ${e.message}`);
    }
    return;
  }

  // Help command
  if (text === '/help') {
    const helpText = `<b>🤖 DHARMAWATCH TELEGRAM BOT OPERATOR GUIDE</b>\n\n` +
      `<b>Editorial Publishing Commands:</b>\n` +
      `• <code>/start</code> - Open main command dashboard with dynamic buttons\n` +
      `• <code>/post</code> - Launch interactive step-by-step story publishing wizard\n` +
      `• <code>/quickpost &lt;cat&gt; | &lt;title&gt; | &lt;body&gt;</code> - Fast one-shot wire dispatch\n` +
      `• <code>/search &lt;query&gt;</code> - Search articles archive by keyword\n` +
      `• <code>/articles</code> - Browse wire articles with page navigation & edit controls\n` +
      `• <code>/lead</code> - View and assign the #1 homepage lead hero story\n` +
      `• <code>/breaking &lt;text&gt;</code> - Flash custom text on the breaking ticker\n\n` +
      `<b>Newsroom Management Commands:</b>\n` +
      `• <code>/tips</code> - Whistleblower intake queue & cryptographic receipts\n` +
      `• <code>/cases</code> - Judicial case files & investigative dossiers\n` +
      `• <code>/addcase &lt;title&gt; | &lt;type&gt; | &lt;status&gt; | &lt;summary&gt;</code>\n` +
      `• <code>/authors</code> - Newsroom correspondents catalog\n` +
      `• <code>/addauthor &lt;name&gt; | &lt;role&gt; | &lt;email&gt;</code>\n` +
      `• <code>/subscribers</code> - Reader newsletter subscriptions\n` +
      `• <code>/system</code> - Server metrics, memory usage, and DB maintenance\n` +
      `• <code>/cancel</code> - Cancel any active drafting session`;

    await sendMessage(chatId, helpText, {
      inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]],
    });
    return;
  }

  if (text === '/cancel') {
    resetUserState(chatId);
    await sendMessage(chatId, `<i>Operation cancelled. Returned to command menu.</i>`, {
      inline_keyboard: [[{ text: '🔙 Main Menu', callback_data: 'main_menu' }]],
    });
    return;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE MACHINE STEP HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  // STEP: WAIT SEARCH
  if (state.step === 'WAIT_SEARCH') {
    state.step = 'IDLE';
    const query = text;
    const results = db.prepare(`
      SELECT id, title, slug, category_slug, is_lead, is_breaking
      FROM articles
      WHERE title LIKE ? OR excerpt LIKE ? OR content LIKE ?
      ORDER BY published_at DESC
      LIMIT 6
    `).all(`%${query}%`, `%${query}%`, `%${query}%`) as any[];

    if (results.length === 0) {
      await sendMessage(chatId, `<i>No articles found matching "${query}".</i>`, {
        inline_keyboard: [
          [{ text: '🔎 Search Again', callback_data: 'prompt_search' }],
          [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
        ],
      });
      return;
    }

    let searchMsg = `<b>🔎 SEARCH RESULTS FOR "${query}" (${results.length} found):</b>\n\n`;
    const buttons: any[] = [];
    results.forEach((art, idx) => {
      searchMsg += `<b>${idx + 1}. ${art.title}</b>\n` +
        `<i>${art.category_slug.toUpperCase()} • ID: ${art.id}</i>\n\n`;
      buttons.push([{ text: `🔎 View #${idx + 1}: ${art.title.substring(0, 32)}...`, callback_data: `view_art_${art.id}` }]);
    });
    buttons.push([{ text: '🔙 Back to Menu', callback_data: 'main_menu' }]);

    await sendMessage(chatId, searchMsg, { inline_keyboard: buttons });
    return;
  }

  // STEP: WAIT EDIT HEADLINE
  if (state.step === 'WAIT_EDIT_HEADLINE' && state.activeArticleId) {
    const artId = state.activeArticleId;
    state.step = 'IDLE';
    state.activeArticleId = undefined;

    db.prepare('UPDATE articles SET title = ?, updated_at = ? WHERE id = ?').run(text, new Date().toISOString(), artId);
    await sendMessage(chatId, `✅ <b>Headline updated for article <code>${artId}</code>!</b>\n\nNew Title: "${text}"`, {
      inline_keyboard: [
        [{ text: '📄 View Article Record', callback_data: `view_art_${artId}` }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // STEP: WAIT EDIT DECK
  if (state.step === 'WAIT_EDIT_DECK' && state.activeArticleId) {
    const artId = state.activeArticleId;
    state.step = 'IDLE';
    state.activeArticleId = undefined;

    db.prepare('UPDATE articles SET deck = ?, excerpt = ?, updated_at = ? WHERE id = ?').run(text, text, new Date().toISOString(), artId);
    await sendMessage(chatId, `✅ <b>Standfirst / Deck updated for <code>${artId}</code>!</b>\n\nNew Deck: "${text}"`, {
      inline_keyboard: [
        [{ text: '📄 View Article Record', callback_data: `view_art_${artId}` }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // STEP: WAIT EDIT BODY CONTENT
  if (state.step === 'WAIT_EDIT_CONTENT' && state.activeArticleId) {
    const artId = state.activeArticleId;
    state.step = 'IDLE';
    state.activeArticleId = undefined;

    const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const wordCount = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    db.prepare(`
      UPDATE articles
      SET content = ?, read_time_minutes = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(paragraphs), readTime, new Date().toISOString(), artId);

    await sendMessage(chatId, `✅ <b>Body copy updated for <code>${artId}</code>!</b>\n\nWord count: ${wordCount} words (~${readTime} min read)`, {
      inline_keyboard: [
        [{ text: '📄 View Article Record', callback_data: `view_art_${artId}` }],
        [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
      ],
    });
    return;
  }

  // STEP: WAIT ADD CASE
  if (state.step === 'WAIT_ADD_CASE') {
    state.step = 'IDLE';
    const parts = text.split('|').map((p) => p.trim());
    if (parts.length < 4) {
      await sendMessage(chatId, `❌ Invalid format. Please use:\n<code>Title | Incident Type | Status | Summary</code>`, {
        inline_keyboard: [[{ text: '🔙 Dossiers Hub', callback_data: 'menu_case_files' }]],
      });
      return;
    }

    const [cTitle, cType, cStatus, cSummary] = parts;
    const now = new Date().toISOString();
    const slug = cTitle.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const caseId = `case-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      db.prepare(`
        INSERT INTO case_files (
          id, title, slug, incident_type, status, summary, verified_source_count,
          total_timeline_events, views_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, 0, ?, ?)
      `).run(caseId, cTitle, slug, cType, cStatus, cSummary, now, now);

      await sendMessage(chatId, `✅ <b>Case Dossier Created Successfully!</b>\n\n<b>Title:</b> ${cTitle}\n<b>Status:</b> ${cStatus}\n<b>ID:</b> <code>${caseId}</code>`, {
        inline_keyboard: [
          [{ text: '📁 View Dossiers', callback_data: 'menu_case_files' }],
          [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
        ],
      });
    } catch (e: any) {
      await sendMessage(chatId, `❌ Failed to create case: ${e.message}`);
    }
    return;
  }

  // STEP: WAIT ADD AUTHOR
  if (state.step === 'WAIT_ADD_AUTHOR') {
    state.step = 'IDLE';
    const parts = text.split('|').map((p) => p.trim());
    if (parts.length < 3) {
      await sendMessage(chatId, `❌ Invalid format. Please use:\n<code>Name | Role | Email</code>`, {
        inline_keyboard: [[{ text: '🔙 Authors Hub', callback_data: 'menu_authors' }]],
      });
      return;
    }

    const [aName, aRole, aEmail] = parts;
    const now = new Date().toISOString();
    const aSlug = aName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    const aId = `auth-${Date.now().toString(36)}`;

    try {
      db.prepare(`
        INSERT INTO authors (id, name, slug, role, email, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?)
      `).run(aId, aName, aSlug, aRole, aEmail, now, now);

      await sendMessage(chatId, `✅ <b>Author Registered to Newsroom Bureau!</b>\n\n<b>Name:</b> ${aName}\n<b>Role:</b> ${aRole}\n<b>Email:</b> ${aEmail}`, {
        inline_keyboard: [
          [{ text: '✍️ View Authors', callback_data: 'menu_authors' }],
          [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
        ],
      });
    } catch (e: any) {
      await sendMessage(chatId, `❌ Failed to add author: ${e.message}`);
    }
    return;
  }

  // STEP: WAIT BREAKING TEXT
  if (state.step === 'WAIT_BREAKING_TEXT') {
    state.step = 'IDLE';
    try {
      const pub = publishStory({
        title: text,
        categorySlug: 'national',
        content: text,
        isBreaking: true,
      });

      await sendMessage(
        chatId,
        `⚡ <b>BREAKING NEWS ALERT ACTIVE!</b>\n\n` +
        `<b>Headline:</b> ${pub.title}\n` +
        `<b>Live URL:</b> <code>${SITE_BASE_URL}${pub.url}</code>`,
        {
          inline_keyboard: [
            [{ text: '🌐 View on Web', url: getTgButtonUrl(pub.url) }],
            [{ text: '🔙 Main Menu', callback_data: 'main_menu' }],
          ],
        }
      );
    } catch (e: any) {
      await sendMessage(chatId, `❌ Error setting breaking news: ${e.message}`);
    }
    return;
  }

  // STEP 2: HEADLINE RECEIVED
  if (state.step === 'WAIT_HEADLINE') {
    state.draft.title = text;
    state.step = 'WAIT_DECK';
    await sendMessage(
      chatId,
      `<b>📰 Headline Saved:</b>\n<i>"${text}"</i>\n\n` +
      `<b>[Step 3 of 5]:</b> Send the <b>Standfirst / Subtitle Deck</b>:\n\n` +
      `<i>(Or tap below to skip subtitle)</i>`,
      {
        inline_keyboard: [
          [{ text: '⏩ Skip Subtitle', callback_data: 'skip_deck' }],
          [{ text: '❌ Cancel Story', callback_data: 'cancel_post' }],
        ],
      }
    );
    return;
  }

  // STEP 3: DECK RECEIVED
  if (state.step === 'WAIT_DECK') {
    if (text.toLowerCase() !== 'skip') {
      state.draft.deck = text;
    }
    state.step = 'WAIT_CONTENT';
    await sendMessage(
      chatId,
      `<b>[Step 4 of 5]:</b> Send the <b>Story Body Content</b> (full article text with paragraphs):\n\n` +
      `<i>(Tip: Separate paragraphs with blank lines)</i>`,
      {
        inline_keyboard: [[{ text: '❌ Cancel Story', callback_data: 'cancel_post' }]],
      }
    );
    return;
  }

  // STEP 4: BODY CONTENT RECEIVED
  if (state.step === 'WAIT_CONTENT') {
    state.draft.content = text;
    state.step = 'WAIT_IMAGE';

    await sendMessage(
      chatId,
      `<b>[Step 5 of 5]:</b> Send a <b>Photo</b> for the lead image asset, or send an image URL, or tap below to use broadsheet default:`,
      {
        inline_keyboard: [
          [{ text: '⏩ Use Default Editorial Photo', callback_data: 'skip_photo' }],
          [{ text: '❌ Cancel Story', callback_data: 'cancel_post' }],
        ],
      }
    );
    return;
  }

  // STEP 5: IMAGE URL OR PHOTO
  if (state.step === 'WAIT_IMAGE') {
    if (text.toLowerCase() !== 'skip') {
      if (text.startsWith('http://') || text.startsWith('https://')) {
        state.draft.heroImage = text;
      }
    }
    state.step = 'CONFIRM_POST';

    const wordCount = (state.draft.content || '').split(/\s+/).filter(Boolean).length;
    const estTime = Math.max(1, Math.ceil(wordCount / 200));

    const previewMsg = `<b>📋 CONFIRM STORY DISPATCH:</b>\n\n` +
      `<b>Section:</b> <code>${(state.draft.categorySlug || 'NATIONAL').toUpperCase()}</code>\n` +
      `<b>Headline:</b> ${state.draft.title}\n` +
      (state.draft.deck ? `<b>Standfirst:</b> <i>${state.draft.deck}</i>\n` : '') +
      `<b>Word Count:</b> ${wordCount} words (~${estTime} min read)\n` +
      `<b>Photo:</b> ${state.draft.heroImage ? 'Attached' : 'Default'}\n\n` +
      `Choose publishing option below:`;

    await sendMessage(chatId, previewMsg, buildConfirmPostKeyboard());
    return;
  }

  // Default fallback if text doesn't match
  await sendMessage(chatId, `<i>Command not recognized. Type /start to open the newsroom control menu.</i>`, {
    inline_keyboard: [[{ text: '🔙 Open Command Menu', callback_data: 'main_menu' }]],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO UPLOAD HANDLER
// ─────────────────────────────────────────────────────────────────────────────
async function handlePhoto(msg: any) {
  const chatId = msg.chat?.id;
  const username = msg.from?.username || '';
  if (!chatId) return;

  if (!isAuthorizedAdmin(chatId, username)) {
    return;
  }

  const state = getUserState(chatId);
  const photos = msg.photo;
  if (!photos || photos.length === 0) return;

  const largestPhoto = photos[photos.length - 1];
  const fileId = largestPhoto.file_id;

  try {
    const fileInfo = await callTg('getFile', { file_id: fileId });
    if (fileInfo.ok && fileInfo.result?.file_path) {
      const filePath = fileInfo.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

      if (state.step === 'WAIT_IMAGE') {
        state.draft.heroImage = downloadUrl;
        state.draft.imageCaption = msg.caption || 'DharmaWatch Wire Photo.';
        state.step = 'CONFIRM_POST';

        const wordCount = (state.draft.content || '').split(/\s+/).filter(Boolean).length;
        const estTime = Math.max(1, Math.ceil(wordCount / 200));

        const previewMsg = `<b>📋 CONFIRM STORY DISPATCH:</b>\n\n` +
          `<b>Section:</b> <code>${(state.draft.categorySlug || 'NATIONAL').toUpperCase()}</code>\n` +
          `<b>Headline:</b> ${state.draft.title}\n` +
          (state.draft.deck ? `<b>Standfirst:</b> <i>${state.draft.deck}</i>\n` : '') +
          `<b>Word Count:</b> ${wordCount} words (~${estTime} min read)\n` +
          `<b>Photo:</b> Custom photo attached via Telegram.\n\n` +
          `Choose publishing option below:`;

        await sendMessage(chatId, previewMsg, buildConfirmPostKeyboard());
        return;
      }
    }
  } catch (err: any) {
    console.error('[Photo Download Error]:', err.message);
  }

  await sendMessage(chatId, `<i>Photo received. Tap /post if you want to start a new story draft.</i>`, {
    inline_keyboard: [[{ text: '🔙 Command Menu', callback_data: 'main_menu' }]],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// LONG POLLING LOOP WITH AUTO-RETRY
// ─────────────────────────────────────────────────────────────────────────────
let isPolling = false;
let lastUpdateId = 0;

export async function startTelegramBot() {
  if (isPolling) return;
  isPolling = true;

  console.log('[Telegram Bot] Starting @Dwadmincontrolbot polling engine...');

  // Verify connection with resilient retry loop
  let me: any = null;
  let attempts = 0;
  while (isPolling && !me?.ok) {
    attempts++;
    me = await callTg('getMe');
    if (me.ok && me.result) {
      console.log(`[Telegram Bot] Connected successfully as @${me.result.username} (${me.result.first_name})`);
      try {
        await registerCommands();
        console.log('[Telegram Bot] Native command menu registered with Telegram.');
      } catch (e: any) {
        console.error('[Telegram Bot] Failed to register commands:', e.message);
      }
      break;
    } else {
      console.warn(`[Telegram Bot] Connection attempt ${attempts} failed (${me?.error || me?.description || 'unknown error'}), retrying in 3s...`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (!isPolling) return;

  // Polling loop
  (async function poll() {
    while (isPolling) {
      try {
        const res = await callTg('getUpdates', {
          offset: lastUpdateId + 1,
          timeout: 25,
        });

        if (res.ok && Array.isArray(res.result)) {
          for (const update of res.result) {
            lastUpdateId = update.update_id;

            if (update.callback_query) {
              await handleCallbackQuery(update.callback_query);
            } else if (update.message) {
              if (update.message.photo) {
                await handlePhoto(update.message);
              } else if (update.message.text) {
                await handleMessage(update.message);
              }
            }
          }
        } else if (!res.ok) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch (err: any) {
        console.error('[Telegram Bot Polling Error]:', err.message);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  })();
}

export function stopTelegramBot() {
  isPolling = false;
  console.log('[Telegram Bot] Polling engine stopped.');
}
