import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setStatus('success');
    }
  };

  return (
    <section className="border border-zinc-200 bg-zinc-50 p-6 sm:p-10 my-10 font-sans">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold uppercase tracking-wider mb-3">
          <Mail className="w-3.5 h-3.5 text-red-600" />
          <span>Weekly Newsletter</span>
        </div>

        <h3 className="font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
          Investigative Reporting in Your Inbox
        </h3>

        <p className="text-xs sm:text-sm text-zinc-600 mt-2.5 leading-relaxed">
          Receive verified reporting, legal developments, and investigations directly in your inbox.
        </p>

        {status === 'success' ? (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-300 flex items-center justify-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Thank you for subscribing to DharmaWatch updates.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-zinc-300 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-red-600"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}

        <p className="text-xs text-zinc-500 mt-3">
          Free updates. No advertising. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};
