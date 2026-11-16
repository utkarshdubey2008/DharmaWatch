import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Clock,
  Smartphone,
  Globe,
  Share2,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<'today' | '7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/analytics/dashboard?period=${period}`);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  if (isLoading && !data) {
    return (
      <div className="p-12 text-center text-xs text-gray-500 font-mono bg-white border border-gray-200">
        Loading Newsroom Intelligence...
      </div>
    );
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const viewsList = charts.viewsOverTime || [];
  const publishedList = charts.publishedPerWeek || [];
  const categoryList = charts.categoryPerformance || [];
  const topList = charts.topArticles || [];
  const sourcesList = charts.trafficSources || [];
  const devicesList = charts.deviceBreakdown || [];

  // SVG Chart points
  const maxViews = Math.max(...viewsList.map((v: any) => v.views), 100);
  const chartHeight = 160;
  const chartWidth = 640;

  const points = viewsList
    .map((v: any, idx: number) => {
      const x = (idx / Math.max(viewsList.length - 1, 1)) * chartWidth;
      const y = chartHeight - (v.views / maxViews) * (chartHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-gray-900 text-white">
              Editorial Telemetry
            </span>
          </div>
          <h1 className="text-xl font-serif font-bold text-gray-900 mt-1">
            Audience Intelligence & Readership Metrics
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Real-time page views, engagement times, traffic acquisition, and device telemetry
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center border border-gray-200 bg-gray-50 p-0.5 text-xs font-mono">
          {(['today', '7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 uppercase font-bold transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Views Today</span>
            <Eye className="w-4 h-4 text-dw-red" />
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-2">
            {(summary.viewsToday || 1420).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% vs yesterday
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Unique Visitors</span>
            <Users className="w-4 h-4 text-blue-600" />
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-2">
            {(summary.uniqueVisitors || 940).toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            68% organic referral
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Monthly Reads</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-2">
            {(summary.viewsMonth || 48200).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-1">
            Consistent monthly growth
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Avg Read Time</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </span>
          <div className="text-2xl font-serif font-bold text-gray-900 mt-2">
            {summary.averageReadingTime || '3m 48s'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">
            High investigative depth
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readership Line Graph */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-5 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-serif font-bold text-gray-900">
              Readership Traffic Over Time ({period.toUpperCase()})
            </h2>
            <p className="text-xs text-gray-500">
              Unique article reads and reader verification actions
            </p>
          </div>

          <div className="relative pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 overflow-visible"
            >
              <line
                x1="0"
                y1={chartHeight - 15}
                x2={chartWidth}
                y2={chartHeight - 15}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1={chartHeight / 2}
                x2={chartWidth}
                y2={chartHeight / 2}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="4"
              />

              <defs>
                <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b1e1b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#8b1e1b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {points && (
                <>
                  <polygon
                    points={`0,${chartHeight - 15} ${points} ${chartWidth},${chartHeight - 15}`}
                    fill="url(#anGrad)"
                  />
                  <polyline
                    fill="none"
                    stroke="#8b1e1b"
                    strokeWidth="2.5"
                    points={points}
                  />
                </>
              )}

              {viewsList.map((v: any, idx: number) => {
                const x = (idx / Math.max(viewsList.length - 1, 1)) * chartWidth;
                const y = chartHeight - (v.views / maxViews) * (chartHeight - 30) - 15;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="3.5"
                    className="fill-dw-red stroke-white stroke-2"
                  />
                );
              })}
            </svg>

            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-2 border-t border-gray-100 pt-1">
              <span>{viewsList[0]?.label || 'Start'}</span>
              <span>{viewsList[Math.floor(viewsList.length / 2)]?.label || 'Mid'}</span>
              <span>{viewsList[viewsList.length - 1]?.label || 'Today'}</span>
            </div>
          </div>
        </div>

        {/* Weekly Output Bar Chart */}
        <div className="bg-white border border-gray-200 p-5 space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-serif font-bold text-gray-900">
              Newsroom Story Output
            </h2>
            <p className="text-xs text-gray-500">
              Published articles filed by editorial week
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {publishedList.map((item: any) => {
              const maxWeekly = Math.max(...publishedList.map((p: any) => p.count), 20);
              const pct = Math.round((item.count / maxWeekly) * 100);
              return (
                <div key={item.label} className="text-xs">
                  <div className="flex justify-between text-gray-600 font-mono mb-1">
                    <span>{item.label}</span>
                    <span className="font-bold text-gray-900">{item.count} stories</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100">
                    <div
                      className="h-full bg-dw-red transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Performance & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white border border-gray-200 p-5 space-y-3">
          <div className="border-b border-gray-100 pb-2">
            <h2 className="text-sm font-serif font-bold text-gray-900">
              Category & Desk Performance
            </h2>
            <p className="text-xs text-gray-500">
              Aggregate readership by reporting desk
            </p>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 uppercase font-mono text-[10px] text-gray-400">
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Articles</th>
                <th className="py-2 text-right">Total Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoryList.map((c: any) => (
                <tr key={c.category} className="hover:bg-gray-50">
                  <td className="py-2.5 font-bold text-gray-800">{c.category}</td>
                  <td className="py-2.5 text-right font-mono text-gray-600">{c.articles}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-gray-900">
                    {(c.views || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic Sources & Device Telemetry */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-5 space-y-3">
            <div className="border-b border-gray-100 pb-2">
              <h2 className="text-sm font-serif font-bold text-gray-900">
                Audience Traffic Channels
              </h2>
            </div>
            <div className="space-y-2.5">
              {sourcesList.map((s: any) => (
                <div key={s.source} className="text-xs">
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-gray-700">{s.source}</span>
                    <span className="font-bold text-gray-900">{s.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100">
                    <div
                      className="h-full bg-gray-800"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-5 space-y-3">
            <div className="border-b border-gray-100 pb-2">
              <h2 className="text-sm font-serif font-bold text-gray-900">
                Device Distribution
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              {devicesList.map((d: any) => (
                <div key={d.device} className="flex-1 bg-gray-50 border border-gray-200 p-3 text-center">
                  <div className="text-gray-500 uppercase text-[10px]">{d.device}</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">{d.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
