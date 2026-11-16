import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Save,
  Send,
  CheckCircle,
  Archive,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  Eye,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link2,
  Zap,
  Clock,
  ShieldAlert,
  Upload,
  Star,
} from 'lucide-react';
import { MediaRenderer } from '../../components/common/MediaRenderer';
import { parseVideoUrl } from '../../utils/mediaUtils';

interface ArticleSource {
  id?: string;
  title: string;
  source_type: string;
  url?: string;
  publisher?: string;
  published_date?: string;
  classification: string;
}

export const AdminArticleEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAdminAuth();

  const isEditing = Boolean(id);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categorySlug, setCategorySlug] = useState('india');
  const [articleType, setArticleType] = useState(
    searchParams.get('breaking') ? 'breaking' : 'news'
  );
  const [isBreaking, setIsBreaking] = useState(Boolean(searchParams.get('breaking')));
  const [isLead, setIsLead] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const mediaUploadRef = useRef<HTMLInputElement>(null);
  const [authorId, setAuthorId] = useState('');
  const [location, setLocation] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [status, setStatus] = useState('draft');
  const [tags, setTags] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [sources, setSources] = useState<ArticleSource[]>([]);

  // Aux state
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [mobileSection, setMobileSection] = useState<'content' | 'settings'>('content');
  const [showSourceModal, setShowSourceModal] = useState(false);

  // New source form state
  const [newSource, setNewSource] = useState<ArticleSource>({
    title: '',
    source_type: 'police_report',
    url: '',
    publisher: '',
    published_date: '',
    classification: 'primary',
  });

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(generateSlug(val));
    }
  };

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catsRes, authorsRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/authors'),
        ]);

        const authorsList = Array.isArray(authorsRes) ? authorsRes : (authorsRes.authors || []);
        setCategories(catsRes.categories || []);
        setAuthors(authorsList);

        if (authorsList.length > 0 && !authorId) {
          setAuthorId(authorsList[0].id);
        }

        if (isEditing && id) {
          const article = await api.get(`/api/articles/${id}`);
          setTitle(article.title || '');
          setSlug(article.slug || '');
          setSubtitle(article.subtitle || article.deck || '');
          setExcerpt(article.excerpt || '');
          setContent(Array.isArray(article.content) ? article.content.join('\n\n') : (article.content || ''));
          setCategorySlug(article.category_slug || article.categorySlug || 'india');
          setArticleType(article.article_type || article.articleType || 'news');
          setIsBreaking(Boolean(article.is_breaking !== undefined ? article.is_breaking : article.isBreaking));
          setIsLead(Boolean(article.is_lead !== undefined ? article.is_lead : article.isLead));
          setAuthorId(article.author_id || article.author?.id || '');
          const locStr = typeof article.location === 'object' && article.location !== null
            ? [article.location.city, article.location.state, article.location.country].filter(Boolean).join(', ')
            : (article.location || '');
          setLocation(locStr);
          setFeaturedImage(article.featured_image || article.heroImage || '');
          setImageCaption(article.image_caption || article.imageCaption || '');
          setStatus((article.rawStatus || article.status || 'draft').toLowerCase());
          setTags(Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''));
          setMetaTitle(article.meta_title || article.seoTitle || '');
          setMetaDescription(article.meta_description || article.seoMetaDescription || '');
          setSources(article.sources || []);
        }
      } catch (err) {
        console.error('Failed to load article editor data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  // Insert markdown helpers
  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('article-content-box') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';
    if (syntax === 'b') replacement = `**${selected || 'bold text'}**`;
    else if (syntax === 'i') replacement = `*${selected || 'italic text'}*`;
    else if (syntax === 'h2') replacement = `\n\n## ${selected || 'Subheading'}\n\n`;
    else if (syntax === 'h3') replacement = `\n\n### ${selected || 'Minor Heading'}\n\n`;
    else if (syntax === 'quote') replacement = `\n\n> "${selected || 'Key quote or testimony'}"\n\n`;
    else if (syntax === 'list') replacement = `\n\n- ${selected || 'Bullet item'}\n`;
    else if (syntax === 'link') replacement = `[${selected || 'Source link'}](https://example.com)`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
  };

  const handleDirectMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', title || file.name);
      formData.append('caption', imageCaption || '');

      const token = localStorage.getItem('dw_admin_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload media');
      setFeaturedImage(data.url);
      alert('Media file uploaded and attached as lead asset.');
    } catch (err: any) {
      alert(err.message || 'Failed to upload media');
    } finally {
      setIsUploadingMedia(false);
      if (mediaUploadRef.current) mediaUploadRef.current.value = '';
    }
  };

  const handleSave = async (targetStatus?: string) => {
    if (!title.trim()) {
      alert('Article title is required.');
      return;
    }

    setIsSaving(true);
    const finalStatus = targetStatus || status;

    const payload = {
      title,
      slug: slug || generateSlug(title),
      subtitle,
      excerpt: excerpt || subtitle || title.substring(0, 150),
      content,
      category_slug: categorySlug,
      article_type: articleType,
      is_breaking: isBreaking ? 1 : 0,
      is_lead: isLead ? 1 : 0,
      author_id: authorId || (authors[0]?.id ?? null),
      location,
      featured_image: featuredImage,
      image_caption: imageCaption,
      status: finalStatus,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      meta_title: metaTitle,
      meta_description: metaDescription,
      sources,
    };

    try {
      if (isEditing && id) {
        await api.put(`/api/articles/${id}`, payload);
        setStatus(finalStatus);
        alert('Article updated successfully.');
      } else {
        const created = await api.post('/api/articles', payload);
        alert('Article created successfully.');
        navigate(`/admin/articles/${created.id}/edit`, { replace: true });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSource = () => {
    if (!newSource.title) {
      alert('Source title / document name is required.');
      return;
    }
    setSources([...sources, { ...newSource, id: `src-${Date.now()}` }]);
    setNewSource({
      title: '',
      source_type: 'police_report',
      url: '',
      publisher: '',
      published_date: '',
      classification: 'primary',
    });
    setShowSourceModal(false);
  };

  const handleRemoveSource = (idx: number) => {
    setSources(sources.filter((_, i) => i !== idx));
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 font-mono">
        Loading Newsroom Editor...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28 sm:pb-32">
      {/* Top Bar with Navigation and Workflow Action Buttons */}
      <div className="bg-white border border-gray-200 p-3 sm:p-4 sticky top-14 z-20 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/admin/articles"
            className="p-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 shrink-0"
            title="Back to Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-800'
                    : status === 'review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status}
              </span>
              <span className="text-[11px] sm:text-xs font-mono text-gray-400 truncate">
                {wordCount} words • {readTime} min read
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-serif font-bold text-gray-900 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {isEditing ? `Editing: ${title || 'Untitled'}` : 'New Article Draft'}
            </h1>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick preview toggle */}
          <div className="flex border border-gray-300 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-2.5 sm:px-3 py-1.5 ${
                activeTab === 'edit'
                  ? 'bg-gray-900 text-white font-bold'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 sm:px-3 py-1.5 ${
                activeTab === 'preview'
                  ? 'bg-gray-900 text-white font-bold'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Desktop/Tablet Quick Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Save Draft */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('draft')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Draft</span>
            </button>

            {/* Submit for Review */}
            {status !== 'published' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave('review')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Submit for</span> Review
              </button>
            )}

            {/* Prominent Green Done Button in top bar */}
            {hasPermission(['admin', 'editor']) && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave('published')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{status === 'published' ? 'Done • Save' : 'Done • Publish'}</span>
              </button>
            )}
          </div>

          {/* View Live Article Link */}
          {isEditing && status === 'published' && slug && (
            <Link
              to={`/article/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-gray-300 hover:bg-gray-100 text-dw-red shrink-0"
              title="Open Live Public Article"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Tab Switcher (Visible on screens < 1024px) */}
      <div className="lg:hidden flex border border-gray-200 bg-white rounded-xs overflow-hidden shadow-xs divide-x divide-gray-200">
        <button
          type="button"
          onClick={() => setMobileSection('content')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5 ${
            mobileSection === 'content'
              ? 'bg-dw-red text-white'
              : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <span>1. Story & Sources</span>
          {sources.length > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                mobileSection === 'content' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {sources.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setMobileSection('settings')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1.5 ${
            mobileSection === 'settings'
              ? 'bg-dw-red text-white'
              : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <span>2. Media & Desk SEO</span>
          {featuredImage ? (
            <span
              className={`w-2 h-2 rounded-full ${
                mobileSection === 'settings' ? 'bg-white' : 'bg-emerald-500'
              }`}
            />
          ) : null}
        </button>
      </div>

      {/* Opinion Desk Banner Notice */}
      {articleType === 'opinion' && (
        <div className="bg-purple-50 border-l-4 border-purple-600 p-4 text-xs text-purple-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Opinions Desk Rule Enforced</p>
            <p className="mt-0.5">
              This article will carry prominent OPINION branding, the author's declared perspective, and standard independent commentary disclaimer across all readers.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column Editor, Right Column Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className={`lg:col-span-2 space-y-6 ${mobileSection === 'content' ? 'block' : 'hidden lg:block'}`}>
          {activeTab === 'edit' ? (
            <>
              {/* Title & Deck */}
              <div className="bg-white border border-gray-200 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Headline / Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter factual, precise headline..."
                    className="w-full text-lg font-serif font-bold p-2.5 border border-gray-300 focus:outline-none focus:border-dw-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Subtitle / Deck / Summary
                  </label>
                  <textarea
                    rows={2}
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Secondary headline or introductory deck summarizing core findings..."
                    className="w-full text-xs p-2.5 border border-gray-300 focus:outline-none focus:border-dw-red font-sans"
                  />
                </div>

                {/* Slug display */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-mono text-gray-500">
                  <span className="font-bold">URL:</span>
                  <span>/article/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 py-0.5 px-1.5 border border-gray-200 text-xs font-mono focus:outline-none focus:border-dw-red"
                  />
                </div>
              </div>

              {/* Body Content Editor with Toolbar */}
              <div className="bg-white border border-gray-200 p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2 gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Article Body (Markdown & Evidence Text)
                  </span>

                  {/* Formatting buttons: Horizontally scrollable on small screens */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                    <button
                      type="button"
                      onClick={() => insertMarkdown('b')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Bold (**text**)"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('i')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Italic (*text*)"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('h2')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Heading 2 (## Subheading)"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('h3')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Heading 3 (### Section)"
                    >
                      <Heading3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('quote')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Blockquote (> quote)"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('list')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Bullet List (- item)"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown('link')}
                      className="shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs border border-gray-200"
                      title="Link ([title](url))"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  id="article-content-box"
                  rows={20}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the article body here in clear, neutral, journalistic English. Cite official FIRs, victim accounts, statements, and verifiable findings..."
                  className="w-full text-sm font-sans leading-relaxed p-3 border border-gray-300 focus:outline-none focus:border-dw-red resize-y"
                />
              </div>

              {/* First-Class Primary Sources Manager */}
              <div className="bg-white border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Primary Sources & Documentation ({sources.length})
                    </h2>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Attach verified FIRs, police reports, court filings, or official releases
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSourceModal(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Source</span>
                  </button>
                </div>

                {sources.length === 0 ? (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-200 text-center text-xs text-gray-500">
                    No primary sources attached yet. DharmaWatch stories require at least one verified source before publication.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 border border-gray-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-mono font-bold uppercase">
                              {src.classification}
                            </span>
                            <span className="font-mono text-gray-500 text-[10px] uppercase">
                              {src.source_type}
                            </span>
                          </div>
                          <div className="font-bold text-gray-900 mt-1">{src.title}</div>
                          <div className="text-gray-500 text-[11px]">
                            {src.publisher} {src.published_date ? `• ${src.published_date}` : ''}
                          </div>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-dw-red hover:underline font-mono text-[10px] inline-flex items-center gap-1 mt-0.5"
                            >
                              <span>{src.url}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSource(idx)}
                          className="text-gray-400 hover:text-dw-red p-1"
                          title="Remove Source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Live Preview Mode */
            <div className="bg-white border border-gray-200 p-8 space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <span className="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-dw-red text-white">
                  {articleType}
                </span>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mt-3">
                  {title || 'Headline will appear here'}
                </h1>
                {subtitle && (
                  <p className="text-base text-gray-600 font-serif mt-2 italic">
                    {subtitle}
                  </p>
                )}
                <div className="text-xs text-gray-400 font-mono mt-3">
                  By {authors.find((a) => a.id === authorId)?.name || 'Staff Reporter'} •{' '}
                  {location || 'India'}
                </div>
              </div>

              {featuredImage && (
                <div className="my-4">
                  <MediaRenderer
                    url={featuredImage}
                    alt={title}
                    caption={imageCaption}
                    className="w-full max-h-96 object-cover border border-gray-200"
                  />
                </div>
              )}

              <div className="prose prose-sm max-w-none text-gray-800 font-sans leading-relaxed whitespace-pre-line space-y-4">
                {content
                  ? content.split('\n\n').map((paragraph, pIdx) => {
                      const vCheck = parseVideoUrl(paragraph.trim());
                      if (vCheck.isVideo) {
                        return (
                          <div key={pIdx} className="my-3">
                            <MediaRenderer url={paragraph.trim()} />
                          </div>
                        );
                      }
                      return <p key={pIdx}>{paragraph}</p>;
                    })
                  : 'Article text content preview...'}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Options Column */}
        <div className={`space-y-6 ${mobileSection === 'settings' ? 'block' : 'hidden lg:block'}`}>
          {/* Desk & Categorization */}
          <div className="bg-white border border-gray-200 p-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Desk & Classification
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Desk / Article Type
              </label>
              <select
                value={articleType}
                onChange={(e) => setArticleType(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none focus:border-dw-red"
              >
                <option value="news">News Report</option>
                <option value="breaking">Breaking News</option>
                <option value="opinion">Opinion & Commentary</option>
                <option value="investigation">Deep Investigation</option>
                <option value="analysis">Analysis & Context</option>
                <option value="case_update">Case File Update</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Primary Category
              </label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none focus:border-dw-red"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Breaking News Toggle */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="rounded-none text-dw-red focus:ring-dw-red"
                />
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-dw-red" />
                  <span>Flag as Breaking News Alert</span>
                </span>
              </label>

              {/* Lead Story Toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input
                  type="checkbox"
                  checked={isLead}
                  onChange={(e) => setIsLead(e.target.checked)}
                  className="rounded-none text-dw-red focus:ring-dw-red"
                />
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Pin as Main Lead Story on Front Page</span>
                </span>
              </label>
            </div>
          </div>

          {/* Author & Dateline */}
          <div className="bg-white border border-gray-200 p-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              Byline & Dateline
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Author / Byline
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none focus:border-dw-red"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Reporting Location / Dateline
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Gwalior, Madhya Pradesh"
                className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red font-mono"
              />
            </div>
          </div>

          {/* Lead Image */}
          <div className="bg-white border border-gray-200 p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2 flex items-center justify-between">
              <span>Lead Media (Image or Video)</span>
              <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Image or Video URL
              </label>
              <input
                type="text"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://... (JPG, PNG, WEBP or YouTube / Vimeo / MP4)"
                className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red font-mono"
              />

              {/* Direct Upload helper */}
              <input
                type="file"
                ref={mediaUploadRef}
                onChange={handleDirectMediaUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => mediaUploadRef.current?.click()}
                disabled={isUploadingMedia}
                className="mt-2 w-full py-1.5 px-3 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 text-gray-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-gray-500" />
                <span>{isUploadingMedia ? 'Uploading to Server...' : 'Upload Image / Video from Device'}</span>
              </button>

              <span className="text-[10px] text-gray-400 font-mono block mt-1">
                Supports image links or video embeds (YouTube watch/short, Vimeo, direct MP4)
              </span>
            </div>

            {featuredImage && (
              <div className="mt-2">
                <MediaRenderer
                  url={featuredImage}
                  alt="Preview"
                  className="w-full max-h-40 object-cover border border-gray-200"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Caption & Credit
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="e.g. Police vehicle outside district court (PTI/File)"
                className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
              />
            </div>
          </div>

          {/* SEO & Meta */}
          <div className="bg-white border border-gray-200 p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-100 pb-2">
              SEO & Social Meta
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Kanwar Yatra, Gwalior, Police FIR"
                className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Search Engine Meta Title
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={title || 'Custom SEO title'}
                className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="150 character search snippet..."
                className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar: Always visible on Mobile, Tablet & PC */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between gap-2">
        {/* Left: Quick Status / Mobile Tabs Indicator */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="lg:hidden flex items-center bg-gray-100 p-0.5 rounded text-xs font-medium">
            <button
              type="button"
              onClick={() => setMobileSection('content')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-bold uppercase tracking-wider ${
                mobileSection === 'content'
                  ? 'bg-white text-dw-red shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Story
            </button>
            <button
              type="button"
              onClick={() => setMobileSection('settings')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-bold uppercase tracking-wider ${
                mobileSection === 'settings'
                  ? 'bg-white text-dw-red shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Settings
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-gray-500">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                status === 'published'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'review'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {status}
            </span>
            <span>{wordCount} words</span>
            <span>•</span>
            <span className="truncate max-w-[220px] text-gray-700 font-serif font-bold">
              {title || 'Untitled'}
            </span>
          </div>
        </div>

        {/* Right: Actions with Prominent Green Done / Save button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-bold uppercase tracking-wider border border-gray-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Save as Draft"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span> Draft
          </button>

          {status !== 'published' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('review')}
              className="hidden sm:flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              title="Submit for Review"
            >
              <Send className="w-3 h-3" />
              <span>Review</span>
            </button>
          )}

          {hasPermission(['admin', 'editor']) && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave('published')}
              className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              title="Done - Save Changes and Publish Live"
            >
              <CheckCircle className="w-4 h-4 text-emerald-100 shrink-0" />
              <span className="font-bold">
                {isSaving
                  ? 'Saving...'
                  : status === 'published'
                  ? 'Done • Save Changes'
                  : 'Done • Publish Live'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Modal: Add Primary Source */}
      {showSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-4 border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif">
                Attach Verified Primary Source
              </h3>
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Document / Source Title *
                </label>
                <input
                  type="text"
                  value={newSource.title}
                  onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                  placeholder="e.g. Police FIR No. 248/2026, Station Hazira"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Source Type
                  </label>
                  <select
                    value={newSource.source_type}
                    onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 font-mono focus:outline-none focus:border-dw-red"
                  >
                    <option value="police_report">Police Report / FIR</option>
                    <option value="court_order">Court Order / Filing</option>
                    <option value="official_statement">Official Government Statement</option>
                    <option value="witness_testimony">Witness Testimony</option>
                    <option value="news_report">News Verification</option>
                    <option value="primary_document">Primary Archive Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Classification
                  </label>
                  <select
                    value={newSource.classification}
                    onChange={(e) => setNewSource({ ...newSource, classification: e.target.value })}
                    className="w-full text-xs p-2 border border-gray-300 font-mono focus:outline-none focus:border-dw-red"
                  >
                    <option value="primary">Primary Document</option>
                    <option value="official">Official Authority</option>
                    <option value="verified">Independently Verified</option>
                    <option value="secondary">Secondary Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Publisher / Issuing Authority
                </label>
                <input
                  type="text"
                  value={newSource.publisher}
                  onChange={(e) => setNewSource({ ...newSource, publisher: e.target.value })}
                  placeholder="e.g. Madhya Pradesh Police"
                  className="w-full text-xs p-2 border border-gray-300 focus:outline-none focus:border-dw-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Source Reference URL (optional)
                </label>
                <input
                  type="text"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-xs p-2 border border-gray-300 font-mono focus:outline-none focus:border-dw-red"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowSourceModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSource}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-dw-red text-white hover:bg-red-700"
              >
                Attach Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
