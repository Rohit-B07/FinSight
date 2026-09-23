'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SummaryCard({ title, value, subtitle, icon: Icon, trend, trendDirection }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        {Icon && (
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-4 flex items-center text-sm">
          {trend && (
            <span className={`flex items-center mr-2 font-medium ${trendDirection === 'up' ? 'text-emerald-600' : trendDirection === 'down' ? 'text-red-600' : 'text-slate-600'}`}>
              {trendDirection === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
              {trendDirection === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
              {trend}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
