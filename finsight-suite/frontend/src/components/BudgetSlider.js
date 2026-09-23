'use client';

import { Lock, Unlock } from 'lucide-react';

export default function BudgetSlider({ category, value, min, max, isLocked, onChange, onToggleLock }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={`p-4 bg-white rounded-lg border ${isLocked ? 'border-slate-300 bg-slate-50' : 'border-slate-200'} shadow-sm`}>
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium text-slate-800">{category}</span>
        <div className="flex items-center space-x-3">
          <span className="font-bold text-lg text-blue-700">{formatCurrency(value)}</span>
          <button
            onClick={onToggleLock}
            className={`p-2 rounded-md transition-colors ${
              isLocked 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            title={isLocked ? "Unlock value" : "Lock value"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={isLocked}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            isLocked ? 'bg-slate-300 opacity-60' : 'bg-slate-200 accent-blue-600'
          }`}
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}</span>
        </div>
      </div>
    </div>
  );
}
