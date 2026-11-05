import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  BookOpen,
  Sparkles,
  Download,
  Info
} from 'lucide-react';
import {
  fetchPredictorData,
  PredictorDataPayload,
  CutoffRowRaw
} from '../../services/predictorService';

export const CapAllotments: React.FC = () => {
  const [dataPayload, setDataPayload] = useState<PredictorDataPayload | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [selectedRound, setSelectedRound] = useState<'all' | 'r1' | 'r2' | 'r3' | 'r4'>('all');
  const [selectedQuota, setSelectedQuota] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState<'avg' | 'r1' | 'name'>('avg');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    fetchPredictorData().then(data => {
      setDataPayload(data);
      setLoading(false);
    });
  }, []);

  const filteredRows = useMemo(() => {
    if (!dataPayload) return [];
    const rows = selectedYear === '2026' ? dataPayload.rows_2026 : dataPayload.rows_2025;
    const words = searchTerm ? searchTerm.toLowerCase().trim().split(/\s+/) : null;

    const list: Array<{
      college_code: number;
      college_name: string;
      district: string;
      university: string;
      is_autonomous: boolean;
      branch_name: string;
      quota: string;
      r1_p: number | null;
      r2_p: number | null;
      r3_p: number | null;
      r4_p: number | null;
      avg_p: number;
      r1_r: number | null;
      avg_r: number;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const col = dataPayload.colleges[r.c];
      if (!col) continue;

      if (selectedQuota !== 'All' && r.q !== selectedQuota) continue;
      if (selectedDistrict !== 'All' && col.dist !== selectedDistrict) continue;

      if (words) {
        const text = `${col.name} ${col.dist} ${col.uni} ${r.b} ${r.q}`.toLowerCase();
        if (!words.every(w => text.includes(w))) continue;
      }

      list.push({
        college_code: col.code,
        college_name: col.name,
        district: col.dist,
        university: col.uni,
        is_autonomous: col.auto,
        branch_name: r.b,
        quota: r.q,
        r1_p: r.p[0],
        r2_p: r.p[1],
        r3_p: r.p[2],
        r4_p: r.p[3],
        avg_p: r.p[4] || 0,
        r1_r: r.r[0],
        avg_r: r.r[4] || 0
      });
    }

    const mult = sortOrder === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      if (sortBy === 'avg') return (a.avg_p - b.avg_p) * mult;
      if (sortBy === 'r1') return ((a.r1_p || 0) - (b.r1_p || 0)) * mult;
      if (sortBy === 'name') return a.college_name.localeCompare(b.college_name) * mult;
      return 0;
    });

    return list;
  }, [dataPayload, selectedYear, selectedQuota, selectedDistrict, searchTerm, sortBy, sortOrder]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-3 uppercase tracking-wider">
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />
          Official CAP Allotment Explorer
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2">
          MHT-CET CAP Allotment Data Explorer
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          Explore official seat allotment cutoffs by college and branch across all CAP rounds — closing
          percentiles, merit ranks, and quota breakdown.
        </p>
      </div>

      {/* Control Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search college, branch..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600"
            />
          </div>

          {/* Year */}
          <div>
            <select
              value={selectedYear}
              onChange={e => {
                setSelectedYear(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="2026">Academic Year 2026-2027</option>
              <option value="2025">Academic Year 2025-2026</option>
            </select>
          </div>

          {/* Quota */}
          <div>
            <select
              value={selectedQuota}
              onChange={e => {
                setSelectedQuota(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All">All Seat Quotas</option>
              <option value="GOPENS">GOPENS (General Open State)</option>
              <option value="GOPENH">GOPENH (Open Home Uni)</option>
              <option value="GOPENO">GOPENO (Open Other Uni)</option>
              <option value="TFWS">TFWS (Fee Waiver)</option>
              <option value="EWS">EWS (Economically Weaker)</option>
              <option value="GOBCS">GOBCS (OBC State)</option>
              <option value="GSCS">GSCS (SC State)</option>
              <option value="GSTS">GSTS (ST State)</option>
              <option value="AI">AI (All India - JEE)</option>
            </select>
          </div>

          {/* Results count & page size */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800">
              {filteredRows.length.toLocaleString()} records
            </span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
              <option value={200}>200 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-semibold">
            Loading official allotment database...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="p-3 pl-5">College & District</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Quota</th>
                  <th className="p-3 text-right">Round 1 %</th>
                  <th className="p-3 text-right">Round 2 %</th>
                  <th className="p-3 text-right">Round 3 %</th>
                  <th className="p-3 text-right">Round 4 %</th>
                  <th className="p-3 pr-5 text-right font-extrabold text-brand-900 bg-brand-50/50">
                    AVG Cutoff
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginated.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 pl-5 max-w-sm">
                      <div className="font-bold text-slate-900">{r.college_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        #{r.college_code} • {r.district} • {r.university}
                        {r.is_autonomous && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            Auto
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{r.branch_name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {r.quota}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      {r.r1_p !== null ? r.r1_p.toFixed(3) : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      {r.r2_p !== null ? r.r2_p.toFixed(3) : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      {r.r3_p !== null ? r.r3_p.toFixed(3) : '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      {r.r4_p !== null ? r.r4_p.toFixed(3) : '—'}
                    </td>
                    <td className="p-3 pr-5 text-right font-mono font-bold text-brand-700 bg-brand-50/30">
                      {r.avg_p.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredRows.length > pageSize && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
