import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const { hasPermission } = useAdminAuth();
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [credit, setCredit] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      params.set('limit', '40');

      const res = await api.get(`/api/media?${params.toString()}`);
      setMediaItems(res.data || res.media || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadMedia();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('alt_text', altText || selectedFile.name);
      formData.append('caption', caption);
      formData.append('credit', credit);

      const token = localStorage.getItem('dw_admin_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload media');
      }

      // Reset form
      setSelectedFile(null);
      setAltText('');
      setCaption('');
      setCredit('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      loadMedia();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete media asset "${name}"?`)) return;

    try {
      await api.delete(`/api/media/${id}`);
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err: any) {
      alert(err.message || 'Failed to delete asset');
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Asset Storage
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Media & Evidence Library
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Photographs, evidence scans, documents, and archival records ({total} items)
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-dw-red" />
          <span>Upload New Media or Evidence Document</span>
        </h2>

        {uploadError && (
          <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 bg-gray-50 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
              id="media-upload-input"
            />
            <label
              htmlFor="media-upload-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-xs text-gray-700 font-medium">
                {selectedFile ? (
                  <span className="font-bold text-dw-red font-mono">{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
                ) : (
                  <span>Click to browse files or drag and drop</span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                JPEG, PNG, WEBP, SVG or PDF (Max 15MB)
              </span>
            </label>
          </div>

          {selectedFile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Alt Text (Accessibility)
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe image for screen readers"
                  className="w-full text-xs p-2 border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Story caption text"
                  className="w-full text-xs p-2 border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Photo Credit
                </label>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="e.g. PTI / Special Correspondent"
                  className="w-full text-xs p-2 border border-gray-300"
                />
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-dw-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isUploading ? 'Uploading to Server...' : 'Confirm Upload'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-gray-200">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search media by filename, alt text, or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-300 focus:outline-none focus:border-dw-red"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs border border-gray-300 px-3 py-1.5 bg-white font-mono focus:outline-none focus:border-dw-red"
          >
            <option value="all">All File Types</option>
            <option value="images">Images Only</option>
            <option value="videos">Videos Only</option>
            <option value="documents">PDFs & Documents</option>
          </select>

          <button
            type="submit"
            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-gray-500 font-mono bg-white border border-gray-200">
          Loading Media Files...
        </div>
      ) : mediaItems.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm font-serif">No media assets found matching query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaItems.map((item) => {
            const isImage = item.mime_type?.startsWith('image/');
            const isVideo = item.mime_type?.startsWith('video/');
            const fileUrl = item.url || (item.path?.startsWith('http') ? item.path : (item.filename ? `/uploads/${item.filename}` : ''));

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 group hover:border-gray-400 transition-colors flex flex-col justify-between overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={item.alt_text || item.original_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <div className="w-full h-full relative bg-black flex items-center justify-center">
                      <video src={fileUrl} className="w-full h-full object-cover opacity-80" muted preload="metadata" />
                      <span className="absolute bottom-1.5 left-1.5 px-1 py-0.5 bg-black/80 text-[9px] font-mono text-white font-bold uppercase">
                        VIDEO
                      </span>
                    </div>
                  ) : (
                    <FileText className="w-10 h-10 text-gray-400" />
                  )}

                  {/* Copy link overlay button */}
                  <button
                    type="button"
                    onClick={() => copyToClipboard(fileUrl, item.id)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 hover:bg-black text-white text-xs shadow-xs"
                    title="Copy File URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Metadata */}
                <div className="p-2.5 text-xs space-y-1">
                  <div className="font-mono text-[11px] font-bold text-gray-800 truncate" title={item.original_name}>
                    {item.original_name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono flex items-center justify-between">
                    <span>{formatBytes(item.file_size)}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  {item.alt_text && (
                    <div className="text-[10px] text-gray-500 truncate" title={item.alt_text}>
                      {item.alt_text}
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-500 hover:text-dw-red text-[11px] inline-flex items-center gap-0.5"
                    >
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    {hasPermission(['admin', 'editor']) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.original_name)}
                        className="text-gray-400 hover:text-dw-red p-0.5"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
