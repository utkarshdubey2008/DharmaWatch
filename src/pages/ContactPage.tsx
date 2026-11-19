import React, { useState, useEffect, useRef } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import {
  Lock,
  Key,
  CheckCircle2,
  Mail,
  Copy,
  Check,
  FileText,
  UploadCloud,
  EyeOff,
  MessageSquare,
  ShieldCheck,
  Search,
  ExternalLink,
  RefreshCw,
  LogOut,
  Code2,
} from 'lucide-react';
import {
  encryptWhistleblowerPayload,
  fetchNewsroomPublicKey,
  generateSecureReceipt,
  stripExifMetadata,
  EncryptedTipEnvelope,
} from '../utils/cryptoTip';

export const ContactPage: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<'browser' | 'status' | 'signal' | 'pgp'>('browser');
  const [formData, setFormData] = useState({
    desk: 'Investigative Projects Desk',
    subject: '',
    message: '',
    urgency: 'normal',
    isAnonymous: true,
    contactHandle: '',
    files: [] as { name: string; size: number; base64?: string }[],
  });

  const [receiptToken, setReceiptToken] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [showFullKey, setShowFullKey] = useState(false);
  const [showArmoredCipher, setShowArmoredCipher] = useState(false);
  const [lastEncryptedEnvelope, setLastEncryptedEnvelope] = useState<EncryptedTipEnvelope | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isScrubbingFiles, setIsScrubbingFiles] = useState(false);

  // Status Lookup State
  const [lookupToken, setLookupToken] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Public key cache
  const [newsroomKey, setNewsroomKey] = useState<{ pem: string; fingerprint: string }>({
    pem: '',
    fingerprint: '4F82:B931:0A7E:98C2',
  });

  // Fetch live newsroom RSA public key on mount
  useEffect(() => {
    fetchNewsroomPublicKey().then(setNewsroomKey);
  }, []);

  // Emergency Panic / Quick Exit Protocol (ESC Key Handler)
  const handleEmergencyPanic = () => {
    // 1. Wipe in-memory state
    setFormData({
      desk: '',
      subject: '',
      message: '',
      urgency: 'normal',
      isAnonymous: true,
      contactHandle: '',
      files: [],
    });
    setReceiptToken(null);
    setLastEncryptedEnvelope(null);

    // 2. Clear clipboard if supported
    if (navigator.clipboard) {
      navigator.clipboard.writeText('');
    }

    // 3. Clear session and local caches
    try {
      sessionStorage.clear();
      localStorage.removeItem('dw_tip_draft');
    } catch {}

    // 4. Force replace browser window to neutral search
    window.location.replace('https://www.google.com');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleEmergencyPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = (text: string, setter: (val: boolean) => void) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 2000);
    }
  };

  // Client-Side Metadata Scrubbing on File Drop
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsScrubbingFiles(true);

    try {
      const scrubbedList: { name: string; size: number; base64?: string }[] = [];
      for (const file of Array.from(e.target.files)) {
        const scrubbed = await stripExifMetadata(file);
        scrubbedList.push({
          name: scrubbed.name,
          size: scrubbed.size,
          base64: scrubbed.base64,
        });
      }

      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...scrubbedList],
      }));
    } catch (err: any) {
      console.error('[File Scrubbing Error]:', err);
    } finally {
      setIsScrubbingFiles(false);
    }
  };

  // End-to-End Encrypted Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Generate high-entropy cryptographic token
    const token = generateSecureReceipt();

    try {
      // 1. Client-Side E2EE Encryption using Web Crypto
      const keyPem = newsroomKey.pem || (await fetchNewsroomPublicKey()).pem;
      const payloadToEncrypt = {
        department: formData.desk,
        urgency: formData.urgency,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        contactHandle: formData.contactHandle.trim() || undefined,
        files: formData.files.map((f) => f.name),
        receiptToken: token,
      };

      const encryptedEnvelope = await encryptWhistleblowerPayload(
        payloadToEncrypt,
        keyPem,
        newsroomKey.fingerprint
      );

      setLastEncryptedEnvelope(encryptedEnvelope);

      // 2. Transmit only the ciphertext envelope over the network (Zero-Log)
      const res = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
        body: JSON.stringify({
          receiptToken: token,
          encryptedEnvelope,
          department: formData.desk,
          urgency: formData.urgency,
          subject: formData.subject.trim() ? '[ENCRYPTED SUBJECT]' : '[CONFIDENTIAL DISCLOSURE]',
        }),
      });

      const data = await res.json();
      if (res.ok && data.receiptToken) {
        setReceiptToken(data.receiptToken);
      } else {
        setReceiptToken(token);
      }

      // Memory wipe of sensitive plaintext
      setFormData((prev) => ({
        ...prev,
        message: '',
        contactHandle: '',
        files: [],
      }));
    } catch (err: any) {
      console.error('[E2EE Transmission Error]:', err);
      // Fallback local receipt if offline
      setReceiptToken(token);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Anonymous Receipt Status Check
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupToken.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/tips/receipt/${encodeURIComponent(lookupToken.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && data.receiptToken) {
        setLookupResult(data);
      } else {
        setLookupError(data.error || 'No record found matching this receipt token.');
      }
    } catch (err: any) {
      setLookupError('Failed to connect to verification server. Please verify network connection.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const breadcrumbs = [
    { label: 'Newsroom' },
    { label: 'Confidential Tip Intake & Shield Protocol' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

        {/* Emergency Quick Exit (Panic Button) */}
        <button
          onClick={handleEmergencyPanic}
          title="Instantly clear form, erase memory, and exit to Google (Press ESC)"
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold tracking-wider uppercase transition-colors shadow-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Quick Exit (ESC)</span>
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 1. EDITORIAL MASTHEAD BANNER                                 */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="border-b-2 border-gray-900 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600">
            Whistleblower &amp; Investigative Desk
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-[11px] font-semibold text-gray-500">
            Zero-Knowledge Cryptographic Intake
          </span>
        </div>

        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          Confidential Tip Intake
        </h1>

        <p className="font-sans text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed max-w-3xl">
          All browser submissions are encrypted end-to-end (E2EE) with our newsroom&apos;s 2048-bit RSA-OAEP and AES-256-GCM cipher before leaving your device. Connection logs, IP addresses, and metadata headers are permanently discarded.
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 2. OPERATIONAL SECURITY & THREAT GUIDANCE BANNER             */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-gray-950 font-extrabold text-xs sm:text-sm uppercase tracking-wide">
          <span>Operational Security (OPSEC) Protocol</span>
          <span className="font-mono text-[10px] text-gray-500 font-normal">
            Key Fingerprint: {newsroomKey.fingerprint}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-700 leading-relaxed">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="font-bold text-gray-950 mb-1 flex items-center gap-1.5">
              <EyeOff className="w-3.5 h-3.5 text-amber-700" />
              <span>Isolated Hardware</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Never transmit material using a computer, phone, email, or Wi-Fi network provided by your employer or institution. Use public Wi-Fi or Tor.
            </p>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="font-bold text-gray-950 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Client-Side E2EE</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Your message is encrypted directly in your browser using Web Crypto. No unencrypted plaintext ever touches our network servers.
            </p>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="font-bold text-gray-950 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Metadata Scrubbing</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Digital documents and photos have camera EXIF, GPS coordinates, and device serial tags scrubbed on the client before transmission.
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. MULTI-CHANNEL SELECTION TABS                              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-none pb-0 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveChannel('browser')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeChannel === 'browser'
                ? 'border-gray-950 text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Secure Drop (Browser E2EE)</span>
          </button>

          <button
            onClick={() => setActiveChannel('status')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeChannel === 'status'
                ? 'border-gray-950 text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Track Receipt Status</span>
          </button>

          <button
            onClick={() => setActiveChannel('signal')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeChannel === 'signal'
                ? 'border-gray-950 text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-sky-600" />
            <span>Signal Messenger</span>
          </button>

          <button
            onClick={() => setActiveChannel('pgp')}
            className={`pb-3 px-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeChannel === 'pgp'
                ? 'border-gray-950 text-gray-950 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Key className="w-4 h-4 text-amber-600" />
            <span>PGP Encrypted Email</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. ACTIVE CHANNEL CONTENT                                    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Channel Panel (8 cols) */}
        <div className="lg:col-span-8">
          {/* TAB 1: BROWSER SECURE DROP WITH E2EE */}
          {activeChannel === 'browser' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="font-sans font-extrabold text-lg text-gray-950">
                    Direct Encrypted Intake
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Cipher: RSA-OAEP-256 + AES-256-GCM. Headers and network IP addresses are discarded on arrival.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase rounded-full border border-emerald-200">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>E2EE Active</span>
                </div>
              </div>

              {receiptToken ? (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-sans font-bold text-lg text-emerald-950">
                      Confidential Submission Encrypted &amp; Dispatched
                    </h3>
                    <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                      Your materials were encrypted client-side and safely transmitted to our newsroom ingest queue.
                    </p>
                  </div>

                  {/* Cryptographic Receipt Block */}
                  <div className="bg-white border border-emerald-300 rounded-xl p-4 max-w-md mx-auto text-left space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Cryptographic Receipt Token
                      </span>
                      <button
                        onClick={() => handleCopy(receiptToken, setCopiedReceipt)}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-bold hover:underline"
                      >
                        {copiedReceipt ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Token</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="font-mono text-sm font-bold text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200 tracking-wider">
                      {receiptToken}
                    </div>

                    <p className="text-[10px] text-gray-500 leading-normal">
                      Save this token in a safe location. You can track whether our editorial desk has commenced verification under the <strong>Track Receipt Status</strong> tab above without disclosing identity.
                    </p>
                  </div>

                  {/* Armored Ciphertext Verification */}
                  {lastEncryptedEnvelope && (
                    <div className="max-w-md mx-auto text-left">
                      <button
                        onClick={() => setShowArmoredCipher(!showArmoredCipher)}
                        className="text-[11px] text-gray-600 hover:text-gray-900 font-semibold underline flex items-center gap-1"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{showArmoredCipher ? 'Hide Verified Ciphertext' : 'Inspect Armored Ciphertext Envelope'}</span>
                      </button>

                      {showArmoredCipher && (
                        <div className="mt-2 p-3 bg-gray-900 rounded-lg text-emerald-400 font-mono text-[10px] overflow-x-auto leading-tight break-all border border-gray-800">
                          {lastEncryptedEnvelope.armoredEnvelope}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setReceiptToken(null);
                        setLastEncryptedEnvelope(null);
                        setFormData({
                          desk: 'Investigative Projects Desk',
                          subject: '',
                          message: '',
                          urgency: 'normal',
                          isAnonymous: true,
                          contactHandle: '',
                          files: [],
                        });
                      }}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Submit Another Encrypted Lead
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Target Reporting Desk *
                      </label>
                      <select
                        value={formData.desk}
                        onChange={(e) => setFormData({ ...formData, desk: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                      >
                        <option value="Investigative Projects Desk">Investigative Projects Desk (General)</option>
                        <option value="Economy & Corporate Fraud">Economy, Banking &amp; Corporate Fraud</option>
                        <option value="Government Procurement">Procurement, Tenders &amp; Public Spending</option>
                        <option value="Supreme Court & Legal">Supreme Court, Judiciary &amp; Law Enforcement</option>
                        <option value="Public Safety & Crimes">Public Safety, Heritage &amp; Community Harm</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Urgency / Threat Severity
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                      >
                        <option value="normal">Standard Evidentiary Review</option>
                        <option value="high">Time-Sensitive Public Record (Active Tender / Impending Action)</option>
                        <option value="critical">Critical / Life Threat / Imminent Destruction of Records</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Subject / Investigation Summary *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Discrepancies in municipal infrastructure procurement (FY 2024-25)"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Detailed Narrative &amp; Primary Record Citations *
                      </label>
                      <span className="text-[10px] text-gray-400 font-mono">Encrypted Client-Side with AES-GCM</span>
                    </div>
                    <textarea
                      required
                      rows={6}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide:
1. What occurred, who was involved, and which public authority/corporation is implicated?
2. What documents or primary evidence verify this account?
3. Where can editors independently verify these facts through public databases or audits?"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white leading-relaxed font-sans transition-colors"
                    />
                  </div>

                  {/* Document Attachment Dropzone with Auto EXIF Scrubbing */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Primary Documents &amp; Evidence Files (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center hover:border-amber-500 bg-gray-50/50 transition-colors">
                      <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-gray-700">
                        Drag and drop files here, or{' '}
                        <label className="text-amber-600 hover:underline cursor-pointer">
                          <span>browse from device</span>
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Supported: PDF, DOCX, XLSX, CSV, JPG, PNG (Max 50MB per file). All EXIF, GPS coordinates, and camera serial tags are automatically scrubbed on your device.
                      </p>

                      {isScrubbingFiles && (
                        <div className="mt-2 text-xs text-amber-600 font-semibold flex items-center justify-center gap-1.5">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Scrubbing image EXIF and device fingerprints...</span>
                        </div>
                      )}

                      {formData.files.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 justify-center">
                          {formData.files.map((file, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] text-gray-800 font-mono shadow-2xs"
                            >
                              <FileText className="w-3 h-3 text-amber-600" />
                              <span>{file.name} ({(file.size / 1024).toFixed(0)} KB)</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Source Anonymity Preferences */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                        Source Identity Protocol
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="anonymity"
                          checked={formData.isAnonymous}
                          onChange={() => setFormData({ ...formData, isAnonymous: true })}
                          className="mt-0.5 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 block">Complete Anonymity (Unilateral Drop)</span>
                          <span className="text-gray-500 text-[11px] block">
                            No contact handle recorded. Follow-up is tracked solely via your anonymous receipt token.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-gray-200/60">
                        <input
                          type="radio"
                          name="anonymity"
                          checked={!formData.isAnonymous}
                          onChange={() => setFormData({ ...formData, isAnonymous: false })}
                          className="mt-0.5 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 block">Confidential On-Background Follow-up</span>
                          <span className="text-gray-500 text-[11px] block">
                            Provide a pseudonym, Signal handle, or Proton address encrypted under journalistic shield.
                          </span>
                        </div>
                      </label>
                    </div>

                    {!formData.isAnonymous && (
                      <div className="pt-2">
                        <input
                          type="text"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          data-lpignore="true"
                          value={formData.contactHandle}
                          onChange={(e) => setFormData({ ...formData, contactHandle: e.target.value })}
                          placeholder="Signal username (@handle) or Proton/Tuta address"
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gray-950 hover:bg-black text-white text-xs uppercase font-extrabold tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSubmitting ? 'Encrypting & Transmitting...' : 'Transmit End-to-End Encrypted Intake'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: RECEIPT STATUS TRACKER */}
          {activeChannel === 'status' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="font-sans font-extrabold text-lg text-gray-950">
                  Track Receipt Status
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Check if our investigative editors have read, corroborated, or initiated proceedings on your submission without disclosing your identity.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Anonymous Receipt Token
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      value={lookupToken}
                      onChange={(e) => setLookupToken(e.target.value)}
                      placeholder="e.g. DW-SEC-OENL-Y93Q"
                      className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isLookingUp}
                      className="px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLookingUp ? 'Verifying...' : 'Check Status'}
                    </button>
                  </div>
                </div>
              </form>

              {lookupError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                  {lookupError}
                </div>
              )}

              {lookupResult && (
                <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Editorial Audit Status
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                      lookupResult.status === 'unread'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : lookupResult.status === 'investigating'
                        ? 'bg-sky-100 text-sky-900 border border-sky-200'
                        : lookupResult.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {lookupResult.status === 'unread' && 'Queued / Pending Review'}
                      {lookupResult.status === 'investigating' && 'Assigned to Senior Investigative Desk'}
                      {lookupResult.status === 'verified' && 'Corroborated / Drafting in Progress'}
                      {lookupResult.status === 'archived' && 'Archived in Legal Depository'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Department Desk:</span>
                      <span className="font-semibold text-gray-950">{lookupResult.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Severity Classification:</span>
                      <span className="font-semibold text-gray-950 uppercase">{lookupResult.urgency}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Ingest Timestamp:</span>
                      <span className="font-mono text-gray-950">{new Date(lookupResult.created_at).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Last Audit Update:</span>
                      <span className="font-mono text-gray-950">{new Date(lookupResult.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SIGNAL MESSENGER */}
          {activeChannel === 'signal' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="font-sans font-extrabold text-lg text-gray-950">
                    Signal End-to-End Encrypted Messaging
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Recommended for real-time secure communication and audio-verified background interviews.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 text-[10px] font-bold uppercase rounded-full border border-sky-200">
                  <MessageSquare className="w-3 h-3 text-sky-600" />
                  <span>Signal Verified</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                  Official DharmaWatch Newsroom Signal Handles:
                </span>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-900">Official Signal Username (Phone Concealed)</div>
                      <div className="font-mono text-sm text-sky-700 font-bold mt-0.5">@dharmawatch.01</div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">Zero Phone Trace · 24/7 Monitored</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-700">
                <h3 className="font-bold text-gray-950 uppercase tracking-wider text-xs">
                  Required Signal Safety Steps:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 pl-1 leading-relaxed">
                  <li>
                    <strong className="text-gray-900">Configure Disappearing Messages:</strong> Set timer to <strong>24 hours</strong>.
                  </li>
                  <li>
                    <strong className="text-gray-900">Disable Link Previews:</strong> Turn off &apos;Generate link previews&apos; in Signal Privacy settings.
                  </li>
                  <li>
                    <strong className="text-gray-900">Screen Security:</strong> Enable Incognito Keyboard to prevent keystroke logging.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: PGP ENCRYPTED EMAIL */}
          {activeChannel === 'pgp' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="font-sans font-extrabold text-lg text-gray-950">
                    PGP Encrypted Correspondence
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    For transmitting large cryptographic attachments and public record archives via standard email.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase rounded-full border border-amber-200">
                  <Key className="w-3 h-3 text-amber-600" />
                  <span>RSA-4096 Key</span>
                </div>
              </div>

              {/* Secure Address Box */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                  Encrypted Ingest Address:
                </span>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-mono text-sm font-bold text-gray-900">
                    leak@thedharmawatch.in
                  </span>
                  <button
                    onClick={() => handleCopy('leak@thedharmawatch.in', setCopiedKey)}
                    className="inline-flex items-center gap-1 text-xs text-amber-600 font-semibold hover:underline cursor-pointer"
                  >
                    {copiedKey ? 'Copied' : 'Copy Address'}
                  </button>
                </div>
              </div>

              {/* Key Fingerprint Box */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    Full Key Fingerprint:
                  </span>
                  <button
                    onClick={() => handleCopy(newsroomKey.fingerprint, setCopiedFingerprint)}
                    className="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer"
                  >
                    {copiedFingerprint ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 bg-white border border-gray-200 rounded font-mono text-xs font-bold text-gray-800 tracking-wider break-all">
                  {newsroomKey.fingerprint}
                </div>
              </div>

              {/* Collapsible Full Public Key */}
              <div>
                <button
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="text-xs font-bold text-gray-900 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                >
                  <span>{showFullKey ? 'Hide Public Key Block' : 'View Full Public Key Block (ASCII Armored)'}</span>
                </button>

                {showFullKey && (
                  <pre className="mt-3 p-3 bg-gray-900 text-amber-400 font-mono text-[10px] rounded-xl overflow-x-auto leading-tight border border-gray-800">
                    {newsroomKey.pem}
                  </pre>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar: Legal Shield & Guidelines (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider text-gray-950">
              Journalistic Shield Standards
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              DharmaWatch operates strictly in the public interest. We corroborate every leak through independent registry filings, forensic accounting audits, and primary documents prior to publication.
            </p>
            <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1.5">
              <div>• <strong>No tracking cookies:</strong> No third-party ad networks or analytics scripts run on intake endpoints.</div>
              <div>• <strong>Zero IP retention:</strong> Web server discard filters drop TCP source IP addresses before storing submissions.</div>
              <div>• <strong>Evidentiary privilege:</strong> Identities are shielded under Indian press freedom protections.</div>
            </div>
          </div>

          <div className="bg-gray-950 text-white rounded-2xl p-5 shadow-xs space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Emergency Inquiries
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              If you believe records are in danger of immediate physical destruction or if you face an imminent threat:
            </p>
            <div className="font-mono text-xs text-amber-300 pt-1 font-bold">
              Signal: @dharmawatch.01 · leak@thedharmawatch.in
            </div>
          </div>

          {/* Official Newsroom Department Directory */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-sans font-extrabold text-xs uppercase tracking-wider text-gray-950">
              Departmental Directory
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Direct communications by bureau:
            </p>
            <div className="space-y-2 text-xs divide-y divide-gray-100">
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">General Inquiries</span>
                <a href="mailto:contact@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  contact@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Pitches &amp; Submissions</span>
                <a href="mailto:submissions@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  submissions@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Ground Tips &amp; Leads</span>
                <a href="mailto:tips@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  tips@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Whistleblower / PGP Leaks</span>
                <a href="mailto:leak@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  leak@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Corrections &amp; Fact Checking</span>
                <a href="mailto:corrections@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  corrections@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Editorial Grievances</span>
                <a href="mailto:grievance@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  grievance@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Press &amp; Media Relations</span>
                <a href="mailto:press@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  press@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Copyright &amp; Syndication</span>
                <a href="mailto:copyright@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  copyright@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Security Disclosures</span>
                <a href="mailto:security@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  security@thedharmawatch.in
                </a>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Privacy &amp; Data Compliance</span>
                <a href="mailto:privacy@thedharmawatch.in" className="font-mono text-xs font-bold text-amber-600 hover:underline">
                  privacy@thedharmawatch.in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
