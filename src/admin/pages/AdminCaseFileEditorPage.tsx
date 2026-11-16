import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  FileText,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Upload,
  CheckCircle,
} from 'lucide-react';

interface TimelineEvent {
  id?: string;
  date: string;
  time?: string;
  headline: string;
  description: string;
  verificationStatus: string;
}

interface PrimaryDocument {
  name: string;
  type: string;
  date: string;
  verificationStatus: string;
  url?: string;
}

export const AdminCaseFileEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [caseId, setCaseId] = useState('');
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState('Investigating');
  const [category, setCategory] = useState('Violence');
  const [incidentType, setIncidentType] = useState('Assault');
  const [leadImage, setLeadImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  // Bullet points
  const [confirmedPoints, setConfirmedPoints] = useState<string[]>([]);
  const [allegedPoints, setAllegedPoints] = useState<string[]>([]);
  const [keyParties, setKeyParties] = useState<string[]>([]);

  // Inputs for adding bullets
  const [newConfirmed, setNewConfirmed] = useState('');
  const [newAlleged, setNewAlleged] = useState('');
  const [newParty, setNewParty] = useState('');

  // Timeline & Docs
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [primaryDocuments, setPrimaryDocuments] = useState<PrimaryDocument[]>([]);

  // Modals / forms
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState<TimelineEvent>({
    date: new Date().toISOString().slice(0, 10),
    time: '',
    headline: '',
    description: '',
    verificationStatus: 'Verified',
  });

  const [showDocModal, setShowDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState<PrimaryDocument>({
    name: '',
    type: 'Police FIR',
    date: new Date().toISOString().slice(0, 10),
    verificationStatus: 'Primary Source',
    url: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!isEditing || !id) {
        setCaseId(`dw-case-${Date.now().toString(36)}`);
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.get(`/api/case-files/${id}`);
        setCaseId(data.id || '');
        setSlug(data.slug || '');
        setTitle(data.title || '');
        setSummary(data.summary || '');
        setStatus(data.status || 'Investigating');
        setCategory(data.category || 'Violence');
        setIncidentType(data.incidentType || 'Assault');
        setLeadImage(data.leadImage || '');

        if (data.location) {
          setCity(data.location.city || '');
          setState(data.location.state || '');
          setCountry(data.location.country || 'India');
        }

        setConfirmedPoints(Array.isArray(data.whatIsConfirmed) ? data.whatIsConfirmed : []);
        setAllegedPoints(Array.isArray(data.whatIsAlleged) ? data.whatIsAlleged : []);
        setKeyParties(Array.isArray(data.keyParties) ? data.keyParties : []);
        setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
        setPrimaryDocuments(Array.isArray(data.primaryDocuments) ? data.primaryDocuments : []);
      } catch (err) {
        console.error('Failed to load case file:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', title || file.name);

      const token = localStorage.getItem('dw_admin_token');
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');
      setLeadImage(data.url);
      alert('Lead image uploaded and attached.');
    } catch (err: any) {
      alert(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !summary.trim()) {
      alert('Case title and summary overview are required.');
      return;
    }

    setIsSaving(true);
    const payload = {
      id: caseId,
      slug: slug || title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
      title,
      summary,
      status,
      category,
      incidentType,
      leadImage,
      location: { city, state, country },
      whatIsConfirmed: confirmedPoints,
      whatIsAlleged: allegedPoints,
      keyParties,
      timeline,
      primaryDocuments,
    };

    try {
      if (isEditing && id) {
        await api.put(`/api/case-files/${id}`, payload);
        alert('Case file dossier updated.');
      } else {
        await api.post('/api/case-files', payload);
        alert('Case file created.');
        navigate(`/admin/case-files/${caseId}/edit`, { replace: true });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save case file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTimelineEvent = () => {
    if (!newEvent.headline || !newEvent.date) {
      alert('Event headline and date are required.');
      return;
    }
    setTimeline([...timeline, { ...newEvent, id: `evt-${Date.now()}` }]);
    setNewEvent({
      date: new Date().toISOString().slice(0, 10),
      time: '',
      headline: '',
      description: '',
      verificationStatus: 'Verified',
    });
    setShowEventModal(false);
  };

  const handleAddDocument = () => {
    if (!newDoc.name) {
      alert('Document name is required.');
      return;
    }
    setPrimaryDocuments([...primaryDocuments, newDoc]);
    setNewDoc({
      name: '',
      type: 'Police FIR',
      date: new Date().toISOString().slice(0, 10),
      verificationStatus: 'Primary Source',
      url: '',
    });
    setShowDocModal(false);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 font-mono">
        Loading Case Dossier Editor...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-28 sm:pb-32">
      {/* Top Bar */}
      <div className="bg-white border border-gray-200 p-3 sm:p-4 sticky top-14 z-20 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/admin/case-files"
            className="p-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 shrink-0"
            title="Back to Case Files"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400">
              Case Dossier #{caseId}
            </span>
            <h1 className="text-xs sm:text-sm font-serif font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
              {isEditing ? `Editing: ${title}` : 'Open New Case File'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing && (
            <Link
              to={`/case/${id}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-gray-300 hover:bg-gray-100 text-dw-red"
              title="View Public Case Dossier"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Done • Save Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Main Details */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Case Identifier Code
            </label>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              disabled={isEditing}
              className="w-full text-xs p-2 border border-gray-300 bg-gray-50 font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Dossier Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none"
            >
              <option value="Investigating">Investigating</option>
              <option value="Verified">Verified</option>
              <option value="Legal Action">Legal Action</option>
              <option value="Archived">Archived</option>
              <option value="Developing">Developing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs p-2 border border-gray-300 font-mono bg-white focus:outline-none"
            >
              <option value="Violence">Violence</option>
              <option value="Persecution">Persecution</option>
              <option value="Terror & Extremism">Terror & Extremism</option>
              <option value="Temple & Heritage">Temple & Heritage</option>
              <option value="Displacement">Displacement</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Case Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!isEditing) {
                setSlug(e.target.value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'));
              }
            }}
            placeholder="e.g. Gwalior Kanwariya Assault Case"
            className="w-full text-base font-serif font-bold p-2.5 border border-gray-300 focus:outline-none focus:border-dw-red"
          />
        </div>

        {/* Slug input */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <span className="font-bold">URL:</span>
          <span>/case-files/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="custom-case-slug"
            className="flex-1 py-1 px-2 border border-gray-300 text-xs font-mono focus:outline-none focus:border-dw-red"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
            Executive Summary / Overview *
          </label>
          <textarea
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Detailed factual summary describing what occurred, dates, persons involved, and state of official inquiry..."
            className="w-full text-xs p-3 border border-gray-300 focus:outline-none focus:border-dw-red font-sans"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              City / District
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Gwalior"
              className="w-full text-xs p-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              State / Province
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Madhya Pradesh"
              className="w-full text-xs p-2 border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Lead Photo / Evidence URL
            </label>
            <input
              type="text"
              value={leadImage}
              onChange={(e) => setLeadImage(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs p-2 border border-gray-300 font-mono"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDirectImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="mt-1.5 w-full py-1 px-2 bg-gray-50 hover:bg-gray-100 border border-dashed border-gray-300 text-gray-700 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3 h-3 text-gray-500" />
              <span>{isUploadingImage ? 'Uploading...' : 'Upload Lead Image from Device'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Findings: Confirmed vs Alleged */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Confirmed Facts */}
        <div className="bg-white border border-gray-200 p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>What Is Verified & Confirmed</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add confirmed fact..."
              value={newConfirmed}
              onChange={(e) => setNewConfirmed(e.target.value)}
              className="flex-1 text-xs p-1.5 border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                if (newConfirmed.trim()) {
                  setConfirmedPoints([...confirmedPoints, newConfirmed.trim()]);
                  setNewConfirmed('');
                }
              }}
              className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold"
            >
              Add
            </button>
          </div>

          <ul className="space-y-1.5 text-xs text-gray-700">
            {confirmedPoints.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between gap-2 p-2 bg-emerald-50/50 border border-emerald-100">
                <span>• {item}</span>
                <button
                  type="button"
                  onClick={() => setConfirmedPoints(confirmedPoints.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-dw-red font-bold"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Allegations Under Verification */}
        <div className="bg-white border border-gray-200 p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 border-b border-gray-100 pb-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>What Is Alleged / Under Verification</span>
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add alleged point..."
              value={newAlleged}
              onChange={(e) => setNewAlleged(e.target.value)}
              className="flex-1 text-xs p-1.5 border border-gray-300"
            />
            <button
              type="button"
              onClick={() => {
                if (newAlleged.trim()) {
                  setAllegedPoints([...allegedPoints, newAlleged.trim()]);
                  setNewAlleged('');
                }
              }}
              className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold"
            >
              Add
            </button>
          </div>

          <ul className="space-y-1.5 text-xs text-gray-700">
            {allegedPoints.map((item, idx) => (
              <li key={idx} className="flex items-start justify-between gap-2 p-2 bg-amber-50/50 border border-amber-100">
                <span>• {item}</span>
                <button
                  type="button"
                  onClick={() => setAllegedPoints(allegedPoints.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-dw-red font-bold"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chronological Incident Timeline Builder */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Chronological Incident Timeline ({timeline.length} Events)
            </h2>
            <p className="text-[11px] text-gray-500 font-mono">
              Document precise sequence of events with timestamped verification
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowEventModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Event</span>
          </button>
        </div>

        {timeline.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-4 text-center bg-gray-50">
            No events logged in the timeline yet.
          </p>
        ) : (
          <div className="space-y-3">
            {timeline.map((evt, idx) => (
              <div
                key={idx}
                className="p-3 border border-gray-200 bg-gray-50/60 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-dw-red">{evt.date}</span>
                    {evt.time && <span className="text-gray-400 font-mono">{evt.time}</span>}
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                      {evt.verificationStatus}
                    </span>
                  </div>
                  <div className="font-bold text-gray-900 mt-1">{evt.headline}</div>
                  <p className="text-gray-600 mt-0.5">{evt.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setTimeline(timeline.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-dw-red p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Evidence Documents */}
      <div className="bg-white border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Primary Evidence & Documents ({primaryDocuments.length})
            </h2>
            <p className="text-[11px] text-gray-500 font-mono">
              FIRs, post-mortem summaries, court filings, official notifications
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDocModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-gray-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Attach Document</span>
          </button>
        </div>

        {primaryDocuments.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-4 text-center bg-gray-50">
            No primary documents attached yet.
          </p>
        ) : (
          <div className="space-y-2">
            {primaryDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 border border-gray-200 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900">{doc.name}</div>
                  <div className="text-gray-500 text-[11px] font-mono">
                    Type: {doc.type} • Date: {doc.date} • {doc.verificationStatus}
                  </div>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-dw-red hover:underline font-mono text-[10px]"
                    >
                      {doc.url}
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setPrimaryDocuments(primaryDocuments.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-dw-red p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add Timeline Event */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-4 border border-gray-200 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif border-b border-gray-100 pb-2">
              Add Incident Timeline Event
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Time (e.g. 21:30 IST)
                </label>
                <input
                  type="text"
                  value={newEvent.time || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="21:30 IST"
                  className="w-full text-xs p-2 border border-gray-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Headline *
              </label>
              <input
                type="text"
                value={newEvent.headline}
                onChange={(e) => setNewEvent({ ...newEvent, headline: e.target.value })}
                placeholder="e.g. FIR Registered at Hazira Police Station"
                className="w-full text-xs p-2 border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Description / Details
              </label>
              <textarea
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Factual summary of this specific occurrence..."
                className="w-full text-xs p-2 border border-gray-300"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddTimelineEvent}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-dw-red text-white hover:bg-red-700"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Document */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-4 border border-gray-200 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif border-b border-gray-100 pb-2">
              Attach Primary Source Document
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                value={newDoc.name}
                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                placeholder="e.g. Certified Copy of Hazira FIR No. 248/2026"
                className="w-full text-xs p-2 border border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Document Type
                </label>
                <input
                  type="text"
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  placeholder="FIR / Medical / Court Order"
                  className="w-full text-xs p-2 border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={newDoc.date}
                  onChange={(e) => setNewDoc({ ...newDoc, date: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Document URL
              </label>
              <input
                type="text"
                value={newDoc.url}
                onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs p-2 border border-gray-300 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDocument}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-dw-red text-white hover:bg-red-700"
              >
                Attach
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Action Bar: Always visible on Mobile, Tablet & PC */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gray-100 text-gray-700">
            #{caseId}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 text-blue-700">
            {status}
          </span>
          <span className="hidden sm:inline text-xs text-gray-700 font-serif font-bold truncate max-w-xs">
            {title || 'Untitled Dossier'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isEditing && (
            <Link
              to={`/case/${id}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-gray-300 hover:bg-gray-100 text-dw-red rounded"
              title="View Public Case Dossier"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-4 sm:px-6 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            title="Save Dossier Changes"
          >
            <CheckCircle className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>{isSaving ? 'Saving...' : 'Done • Save Dossier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
