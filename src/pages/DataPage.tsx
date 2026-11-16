import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { ResearchDataset } from '../types';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { Download, BarChart2, Info, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import {
  DEMO_STAT_SUMMARY,
  DEMO_CHART_RESTITUTION_BY_YEAR,
  DEMO_CHART_STATUS_BREAKDOWN,
} from '../data/researchData';

export const DataPage: React.FC = () => {
  const [datasets, setDatasets] = useState<ResearchDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<ResearchDataset | null>(null);
  const [activeChart, setActiveChart] = useState<'restitution' | 'verification'>('restitution');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await contentService.getResearchDatasets();
      setDatasets(data);
      if (data.length > 0) setSelectedDataset(data[0]);
      setIsLoading(false);
    };

    load();
  }, []);

  const breadcrumbs = [
    { label: 'Data Journalism & Research' },
  ];

  const handleExport = (format: 'CSV' | 'JSON') => {
    alert(`Demo notice: Exporting ${selectedDataset?.title || 'dataset'} in ${format} format.`);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-wider text-gray-500 font-sans">
          Loading datasets and charts...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 font-sans">
      <Breadcrumbs items={breadcrumbs} className="hidden sm:flex mb-2" />

      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 block mb-1">
          DharmaWatch Data &amp; Research Bureau
        </span>

        <h1 className="font-sans font-black text-2xl sm:text-4xl text-gray-950 tracking-tight leading-tight">
          Data, Visualizations &amp; Public Registries
        </h1>

        <p className="font-sans text-xs sm:text-sm text-gray-600 max-w-3xl mt-1.5 leading-relaxed">
          Open data registries, interactive charts, and documentation indices tracking interstate clean energy infrastructure, metropolitan procurement audits, and judicial velocity.
        </p>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
            {DEMO_STAT_SUMMARY.totalDocumentedRecords.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Cataloged Project Data Points</div>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-sans">
            {DEMO_STAT_SUMMARY.verifiedPrimarySources.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Verified Regulatory Filings</div>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
            {DEMO_STAT_SUMMARY.reconciliationAuditAcreage}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Audited Commercial Capex</div>
        </div>
        <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-sans">
            {DEMO_STAT_SUMMARY.resolvedRestitutions}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-medium">Completed Investigation Hubs</div>
        </div>
      </div>

      {/* Clean Interactive Visual Chart Container */}
      <div className="border border-gray-200 rounded-2xl p-6 sm:p-8 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-amber-600" />
            <h2 className="font-sans font-bold text-xl text-gray-900">
              Data Visualizations
            </h2>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveChart('restitution')}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                activeChart === 'restitution'
                  ? 'bg-amber-500 border-amber-500 text-black font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              National Green Grid Evacuation (GW)
            </button>
            <button
              onClick={() => setActiveChart('verification')}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                activeChart === 'verification'
                  ? 'bg-amber-500 border-amber-500 text-black font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              Evidentiary Source Composition
            </button>
          </div>
        </div>

        {/* Chart 1: Bar Chart */}
        {activeChart === 'restitution' && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              Interstate high-voltage green transmission capacity (2020 - 2026 YTD in Gigawatts):
            </div>
            <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-4 px-2 sm:px-6 bg-gray-50 rounded-xl border border-gray-100">
              {DEMO_CHART_RESTITUTION_BY_YEAR.map((pt) => {
                const heightPct = Math.round((pt.count / 260) * 100);
                return (
                  <div key={pt.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-gray-600 group-hover:text-amber-600 transition-colors">
                      {pt.label}
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-amber-500/80 hover:bg-amber-500 rounded-t-lg transition-all shadow-xs"
                    />
                    <div className="text-[11px] text-gray-600 font-medium">
                      {pt.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart 2: Source Composition */}
        {activeChart === 'verification' && (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              Classification of documentation backing investigative data points across active audits:
            </div>
            <div className="space-y-3 pt-2">
              {DEMO_CHART_STATUS_BREAKDOWN.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800">{item.status}</span>
                    <span className="font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dataset Explorer Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dataset List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
            Available Registries &amp; Research Datasets ({datasets.length})
          </div>

          <div className="space-y-2">
            {datasets.map((ds) => {
              const isSelected = selectedDataset?.id === ds.id;
              return (
                <button
                  key={ds.id}
                  onClick={() => setSelectedDataset(ds)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="text-[11px] font-bold text-amber-600 uppercase mb-1">
                    {ds.category}
                  </div>
                  <div className="font-sans font-bold text-sm text-gray-900 leading-snug">
                    {ds.title}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span>{ds.recordsCount} records</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">{ds.verifiedPercentage}% verified</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Dataset Details (7 cols) */}
        {selectedDataset && (
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <div className="text-[11px] font-bold text-amber-600 uppercase">
                  {selectedDataset.category}
                </div>
                <h3 className="font-sans font-bold text-xl text-gray-900 mt-1">
                  {selectedDataset.title}
                </h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('CSV')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExport('JSON')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed font-sans">
              {selectedDataset.description}
            </p>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100 text-xs text-gray-700 leading-relaxed">
              <strong className="text-gray-900 block font-bold uppercase text-[11px] text-amber-600">
                Methodology &amp; Verification Protocol:
              </strong>
              <p>{selectedDataset.methodologyNote}</p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-900 uppercase">
                Key Empirical Findings:
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 list-disc pl-5">
                {selectedDataset.keyFindings.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed">{finding}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Primary Sources:</span>
              {selectedDataset.primarySourceTypes.map((st) => (
                <span
                  key={st}
                  className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 text-[11px]"
                >
                  {st}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
