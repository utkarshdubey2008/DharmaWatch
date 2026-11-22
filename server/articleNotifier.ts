import { db } from './db.js';
import { generateToken } from './auth.js';

let articleNotifyHandler: ((data: { article: any; editUrl: string }) => Promise<void>) | null = null;

export function registerArticleNotifier(fn: (data: { article: any; editUrl: string }) => Promise<void>) {
  articleNotifyHandler = fn;
}

export async function triggerArticleNotification(article: any) {
  if (!article) return;
  try {
    const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' AND is_active = 1 LIMIT 1").get() as any;
    let token = '';
    if (adminUser) {
      token = generateToken({
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        full_name: adminUser.full_name,
      });
    }

    const PUBLIC_DOMAIN = (process.env.PUBLIC_DOMAIN || 'https://thedharmawatch.in').replace(/\/$/, '');
    const editUrl = `${PUBLIC_DOMAIN}/admin/articles/${article.id}/edit${token ? `?auth_token=${token}` : ''}`;

    if (articleNotifyHandler) {
      await articleNotifyHandler({ article, editUrl });
    }
  } catch (err: any) {
    console.error('[Article Notifier Error]:', err.message);
  }
}
