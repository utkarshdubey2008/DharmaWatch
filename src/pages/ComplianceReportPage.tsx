import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { FileCheck, Scale, AlertCircle, RefreshCw, Mail } from 'lucide-react';

interface ComplianceReportItem {
  id: string;
  month_year: string;
  total_received: number;
  resolved: number;
  pending: number;
  summary: string;
  created_at: string;
  updated_at: string;
}

export const ComplianceReportPage: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/compliance');
        if (res.ok) {
          const data = await res.json();
          setReports(data || []);
        }
      } catch (err) {
        console.error('Failed to load compliance reports:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Grievance Redressal', path: '/grievance-redressal' },
    { label: 'Monthly Compliance Report' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex" />

      {/* Header */}
      <header className="border-b-2 border-gray-900 pb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200">
            Digital Media Ethics Code
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500 font-mono">Part III, IT Rules, 2021</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-sans font-black tracking-tight text-gray-950 leading-tight">
          Monthly Compliance Report
        </h1>

        <p className="text-base sm:text-lg text-gray-700 leading-relaxed font-sans">
          In accordance with the Digital Media Ethics Code under India&apos;s Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, DharmaWatch publishes monthly reports detailing grievances received, addressed, and resolved.
        </p>
      </header>

      {/* Grievance Officer Quick Contact Reference */}
      <section className="bg-stone-50 border border-stone-200 p-5 rounded-lg space-y-2 text-xs text-gray-700">
        <div className="flex items-center gap-2 text-gray-900 font-bold uppercase tracking-wider font-mono">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>Grievance Mechanism Point of Contact</span>
        </div>
        <p>
          Readers may report factual inaccuracies, complaints, or content concerns directly to our designated Grievance Officer:
        </p>
        <div className="font-mono text-xs pt-1 space-y-1">
          <div><strong>Name:</strong> Shubham</div>
          <div><strong>Designation:</strong> Grievance Officer</div>
          <div><strong>Email:</strong> <a href="mailto:grievance@TheDharmaWatch.in" className="text-amber-700 font-bold hover:underline">grievance@TheDharmaWatch.in</a></div>
        </div>
        <p className="pt-1 text-gray-500">
          For full details on complaint submission and review procedures, refer to our{' '}
          <Link to="/grievance-redressal" className="text-amber-700 font-bold hover:underline">
            Grievance Redressal Policy
          </Link>.
        </p>
      </section>

      {/* Reports Listing in exact requested format */}
      <section className="space-y-6">
        <div className="border-b border-gray-200 pb-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-amber-600" />
            <span>Monthly Grievance Statements</span>
          </h2>
          <span className="text-xs font-mono text-gray-400">Chronological Archive</span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-6 h-6 text-amber-600 animate-spin mx-auto mb-2" />
            <p className="text-xs uppercase tracking-wider text-gray-500 font-mono">
              Loading compliance reports...
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 bg-white border border-gray-200 rounded-xl text-center text-sm text-gray-500">
            No compliance reports have been filed for this period.
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-4 hover:border-gray-400 transition-colors shadow-xs"
              >
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-950 font-sans">
                    Month: {report.month_year}
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 border border-gray-200">
                    Official Record
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                    <span className="text-gray-500 block uppercase font-bold text-[10px]">
                      Total grievances received
                    </span>
                    <span className="text-lg font-black text-gray-950">
                      {report.total_received}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                    <span className="text-gray-500 block uppercase font-bold text-[10px]">
                      Grievances resolved
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      {report.resolved}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-50 border border-stone-200 rounded">
                    <span className="text-gray-500 block uppercase font-bold text-[10px]">
                      Grievances pending
                    </span>
                    <span className="text-lg font-black text-amber-700">
                      {report.pending}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-gray-700 space-y-1 font-sans">
                  <div className="font-bold text-gray-900">Summary:</div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded text-gray-700 leading-relaxed font-sans">
                    {report.summary}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Directory Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 text-xs font-bold">
        <Link to="/grievance-redressal" className="text-gray-600 hover:text-gray-900">
          ← Grievance Redressal Policy
        </Link>
        <Link to="/editorial-policy" className="text-amber-700 hover:text-amber-900">
          Editorial Standards &amp; Verification →
        </Link>
      </div>
    </div>
  );
};
