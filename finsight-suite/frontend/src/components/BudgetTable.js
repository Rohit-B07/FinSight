'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronUp, ChevronDown, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BudgetTable({ recommendations = [], onRefresh }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...recommendations].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc'
        ? <ChevronUp className="w-4 h-4 ml-1 inline text-primary-600" />
        : <ChevronDown className="w-4 h-4 ml-1 inline text-primary-600" />;
    }
    return <ArrowUpDown className="w-4 h-4 ml-1 inline text-slate-300 group-hover:text-slate-500" />;
  };

  const impactColors = {
    'High': 'bg-success-50 text-success-700 border-success-200',
    'Medium': 'bg-warning-50 text-warning-700 border-warning-200',
    'Low': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const getDiffColor = (percent) => {
    if (percent > 10) return 'text-success-700 bg-success-50 border-success-200';
    if (percent > 0) return 'text-success-600 bg-success-50/50 border-success-100';
    if (percent > -10) return 'text-warning-600 bg-warning-50/50 border-warning-100';
    return 'text-danger-600 bg-danger-50 border-danger-200';
  };

  const totalCurrent = sortedData.reduce((s, r) => s + (r.current_budget || 0), 0);
  const totalRecommended = sortedData.reduce((s, r) => s + (r.recommended_budget || 0), 0);
  const totalDiff = totalRecommended - totalCurrent;
  const totalDiffPercent = totalCurrent > 0 ? (totalDiff / totalCurrent) * 100 : 0;

  return (
    <div className="card overflow-hidden">
      <div className="p-5 lg:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Optimization Recommendations
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              AI-generated budget reallocations with confidence scores and projected impact
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current</p>
              <p className="text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">{formatCurrency(totalCurrent)}</p>
            </div>
            <div className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary-500">Recommended</p>
              <p className="text-base font-extrabold text-primary-700 mt-0.5 tabular-nums">{formatCurrency(totalRecommended)}</p>
            </div>
            <div className={`rounded-xl border px-4 py-2.5 ${getDiffColor(totalDiffPercent)}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Net Change</p>
              <p className="text-base font-extrabold mt-0.5 tabular-nums">
                {totalDiff >= 0 ? '+' : ''}{formatCurrency(totalDiff)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead>
            <tr className="bg-slate-50/80">
              {[
                { k: 'category', label: 'Category', align: 'left' },
                { k: 'current_budget', label: 'Current Budget', align: 'right' },
                { k: 'recommended_budget', label: 'Recommended', align: 'right' },
                { k: 'change_percent', label: 'Change', align: 'right' },
                { k: 'projected_impact', label: 'Projected Impact', align: 'left' },
                { k: 'confidence', label: 'AI Confidence', align: 'left' },
              ].map(col => (
                <th
                  key={col.k}
                  onClick={() => requestSort(col.k)}
                  className={`px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100/50 transition-colors group ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  <span className="inline-flex items-center">
                    {col.label} {renderSortIcon(col.k)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedData.map((row, idx) => {
              const diff = row.recommended_budget - row.current_budget;
              return (
                <tr key={idx} className="hover:bg-primary-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 flex items-center justify-center text-xs font-black text-primary-700">
                        {row.category_name?.charAt(0) || row.category?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{row.category_name || row.category}</p>
                        <p className="text-[11px] text-slate-400">Category #{row.category_id || idx + 1}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-600 tabular-nums">
                    {formatCurrency(row.current_budget)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-extrabold text-slate-900 tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      {formatCurrency(row.recommended_budget)}
                      {diff > 0 && <ChevronUp className="w-4 h-4 text-success-500" />}
                      {diff < 0 && <ChevronDown className="w-4 h-4 text-danger-500" />}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border tabular-nums ${getDiffColor(row.change_percent || (diff / row.current_budget) * 100)}`}>
                      {(row.change_percent ?? ((diff / row.current_budget) * 100)).toFixed(1) >= 0 ? '+' : ''}
                      {(row.change_percent ?? ((diff / row.current_budget) * 100)).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      impactColors[row.projected_impact] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {row.projected_impact === 'High' && <Sparkles className="w-3 h-3" />}
                      {row.projected_impact === 'Medium' && <CheckCircle2 className="w-3 h-3" />}
                      {row.projected_impact || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                          style={{ width: `${(row.confidence * 100).toFixed(0)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 tabular-nums w-10 text-right">
                        {(row.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">No recommendations yet</h4>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Configure your budget parameters and run the optimizer to see AI-powered allocation suggestions.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
