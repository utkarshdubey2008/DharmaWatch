import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { CaseFile, CaseFileStatus } from '../types';
import { CaseFileCard } from '../components/caseFile/CaseFileCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { FolderArchive, Filter, Search } from 'lucide-react';

export const CaseFilesPage: React.FC = () => {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setIsLoading(true);
      const data = await contentService.getCaseFiles(selectedStatus);
      setCaseFiles(data);
      setIsLoading(false);
    };

    fetchCases();
  }, [selectedStatus]);

  const filteredCases = caseFiles.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.location.country.toLowerCase().includes(q) ||
      (c.location.state && c.location.state.toLowerCase().includes(q))
    );
  });

  const statuses: (CaseFileStatus | 'All')[] = [
    'All',
    'In Court',
    'Under Investigation',
    'Developing',
    'Resolved',
    'Archived',
  ];

  const breadcrumbs = [
    { label: 'Special Projects', path: '/investigations' },
    { label: 'Project Dossiers & Public Trackers' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Masthead */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-1.5 text-amber-600 text-[11px] uppercase font-extrabold tracking-wider mb-1.5">
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Investigative Dossiers &amp; Policy Trackers</span>
        </div>

        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          Project Dossiers &amp; Public Inquiries
        </h1>

        <p className="font-sans text-xs sm:text-sm text-gray-600 max-w-3xl mt-1.5 leading-relaxed">
          Comprehensive journalistic dossiers tracking ongoing infrastructure audits, regulatory enforcement, constitutional litigation, and public spending investigations with verifiable source records.
        </p>

        {/* Filter Controls */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] uppercase font-bold text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> STATUS:
            </span>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium ${
                  selectedStatus === status
                    ? 'bg-amber-500 border-amber-500 text-black font-bold'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search project dossiers..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Grid of Dossiers */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
            Loading project dossiers...
          </p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="py-16 text-center text-gray-500 font-sans">
          No project dossiers found matching the criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCases.map((c) => (
            <CaseFileCard key={c.id} caseFile={c} />
          ))}
        </div>
      )}
    </div>
  );
};
