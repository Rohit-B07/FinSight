'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

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
      return <ArrowUpDown className="w-4 h-4 ml-1 inline text-blue-600" />;
    }
    return <ArrowUpDown className="w-4 h-4 ml-1 inline text-slate-300" />;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th onClick={() => requestSort('category')} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
              Category {renderSortIcon('category')}
            </th>
            <th onClick={() => requestSort('current_budget')} className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
              Current Budget {renderSortIcon('current_budget')}
            </th>
            <th onClick={() => requestSort('recommended_budget')} className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
              Recommended {renderSortIcon('recommended_budget')}
            </th>
            <th onClick={() => requestSort('change_percent')} className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
              Change (%) {renderSortIcon('change_percent')}
            </th>
            <th onClick={() => requestSort('projected_impact')} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
              Projected Impact {renderSortIcon('projected_impact')}
            </th>
            <th onClick={() => requestSort('confidence')} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
              Confidence {renderSortIcon('confidence')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {sortedData.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                {row.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-500">
                {formatCurrency(row.current_budget)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-800">
                {formatCurrency(row.recommended_budget)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${row.change_percent > 0 ? 'text-emerald-600' : row.change_percent < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                {row.change_percent > 0 ? '+' : ''}{row.change_percent}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                {row.projected_impact}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${row.confidence * 100}%` }}></div>
                </div>
                <span className="text-xs text-slate-500 mt-1 block">{(row.confidence * 100).toFixed(0)}%</span>
              </td>
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                No recommendations available. Run an optimization to see results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
