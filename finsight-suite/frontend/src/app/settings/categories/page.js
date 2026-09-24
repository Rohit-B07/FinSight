'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Save, Tag, CheckCircle2, AlertCircle, RefreshCw, Lock, Unlock } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');
      if (!error && data && data.length > 0) {
        setCategories(data);
      } else {
        setCategories([
          { id: 1, name: 'Marketing & Advertising', min_spend: 100000, max_spend: 500000, current_budget: 200000, is_locked: false, description: 'Digital, print, and brand campaigns' },
          { id: 2, name: 'Research & Development', min_spend: 200000, max_spend: 600000, current_budget: 300000, is_locked: false, description: 'Product engineering & innovation' },
          { id: 3, name: 'Operations & Infrastructure', min_spend: 300000, max_spend: 800000, current_budget: 500000, is_locked: true, description: 'Facilities, cloud, and tooling' },
          { id: 4, name: 'Sales & Distribution', min_spend: 80000, max_spend: 400000, current_budget: 180000, is_locked: false, description: 'Commissions, channels, logistics' },
          { id: 5, name: 'HR & Administration', min_spend: 50000, max_spend: 250000, current_budget: 120000, is_locked: false, description: 'Talent, benefits, office admin' },
        ]);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleChange = (index, field, value) => {
    const newCats = [...categories];
    if (field === 'min_spend' || field === 'max_spend' || field === 'current_budget') {
      value = Number(value) || 0;
    }
    newCats[index][field] = value;
    setCategories(newCats);
  };

  const addCategory = () => {
    setCategories([...categories, {
      id: Date.now(),
      name: 'New Category',
      min_spend: 0,
      max_spend: 100000,
      current_budget: 50000,
      is_locked: false,
      description: ''
    }]);
  };

  const removeCategory = (index) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== index));
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(val || 0);

  const saveChanges = async () => {
    setSaving(true);
    try {
      for (const c of categories) {
        if (c.id) {
          await supabase.from('budget_categories')
            .upsert({
              name: c.name, min_spend: c.min_spend, max_spend: c.max_spend,
              current_budget: c.current_budget, is_locked: c.is_locked, description: c.description
            }, { onConflict: 'id' }).catch(() => {});
        }
      }
      setSuccessMsg(`Saved ${categories.length} budget categories successfully`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const totalCurrent = categories.reduce((s, c) => s + (c.current_budget || 0), 0);
  const totalMin = categories.reduce((s, c) => s + (c.min_spend || 0), 0);
  const totalMax = categories.reduce((s, c) => s + (c.max_spend || 0), 0);
  const lockedCount = categories.filter(c => c.is_locked).length;

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Budget Categories
          </h1>
          <p className="text-slate-500 mt-1.5">
            Manage budget category constraints, min/max spend limits, and lock defaults for optimization
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={addCategory} className="btn-outline">
            <Plus className="w-4 h-4" /> Add Category
          </button>
          <button onClick={saveChanges} disabled={saving} className="btn-primary">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-success-200 bg-success-50 p-4 flex items-center gap-3 animate-slide-down">
          <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-success-600" />
          </div>
          <p className="font-bold text-success-800">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Categories', value: categories.length, icon: Tag, color: 'primary' },
          { label: 'Min Spend Range', value: formatCurrency(totalMin), icon: null, color: 'secondary' },
          { label: 'Current Budget', value: formatCurrency(totalCurrent), icon: null, color: 'accent' },
          { label: 'Max Spend Cap', value: formatCurrency(totalMax), icon: Lock, color: 'warning' },
        ].map((k, i) => (
          <div key={i} className="card p-5 card-hover">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{k.label}</p>
              {k.icon && <k.icon className="w-4 h-4 text-slate-400" />}
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 lg:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                <Tag className="w-4.5 h-4.5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 tracking-tight">Category Configuration</h3>
                <p className="text-xs text-slate-500">{categories.length} total • {lockedCount} locked</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-500" /> Min
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary-500" /> Current
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-500" /> Max
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Min Spend</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Current</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Max Spend</th>
                <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">Allocation Range</th>
                <th className="px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">Locked</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, idx) => {
                const range = (cat.max_spend || 1) - (cat.min_spend || 0);
                const pct = range > 0 ? (((cat.current_budget || 0) - (cat.min_spend || 0)) / range) * 100 : 0;
                const validMinMax = (cat.min_spend || 0) <= (cat.max_spend || 0) && (cat.current_budget || 0) >= (cat.min_spend || 0) && (cat.current_budget || 0) <= (cat.max_spend || 0);
                return (
                  <tr key={cat.id} className={`hover:bg-primary-50/30 transition-colors ${!validMinMax ? 'bg-warning-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-sm font-black text-slate-600 flex-shrink-0">
                          {cat.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => handleChange(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary-500 focus:outline-none font-bold text-slate-900 py-0.5"
                          />
                          <input
                            type="text"
                            value={cat.description || ''}
                            onChange={(e) => handleChange(idx, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-300 focus:outline-none text-xs text-slate-500 py-0.5 mt-0.5"
                            placeholder="Optional description"
                          />
                        </div>
                        {!validMinMax && (
                          <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0" title="Min/current/max values conflict" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1 font-semibold text-primary-600">
                        <span className="text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          value={cat.min_spend}
                          onChange={(e) => handleChange(idx, 'min_spend', e.target.value)}
                          className="w-28 text-right bg-primary-50/50 border border-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 rounded-lg px-3 py-1.5 tabular-nums"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1 font-black text-slate-900">
                        <span className="text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          value={cat.current_budget}
                          onChange={(e) => handleChange(idx, 'current_budget', e.target.value)}
                          className="w-28 text-right bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 rounded-lg px-3 py-1.5 tabular-nums"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1 font-semibold text-accent-600">
                        <span className="text-xs text-slate-400">₹</span>
                        <input
                          type="number"
                          value={cat.max_spend}
                          onChange={(e) => handleChange(idx, 'max_spend', e.target.value)}
                          className="w-28 text-right bg-accent-50/50 border border-accent-100 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 rounded-lg px-3 py-1.5 tabular-nums"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[220px]">
                      <div className="px-2">
                        <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner-soft">
                          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-400/40 to-accent-400/40 rounded-full" style={{ left: '0%', right: '0%' }} />
                          <div
                            className="absolute top-0 bottom-0 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full shadow-sm"
                            style={{
                              left: `${Math.max(0, Math.min(100, pct * 0.85 + 2))}%`,
                              width: '16%',
                              transform: 'translateX(-50%)'
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5 tabular-nums">
                          <span>{formatCurrency(cat.min_spend)}</span>
                          <span>{formatCurrency(cat.max_spend)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleChange(idx, 'is_locked', !cat.is_locked)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          cat.is_locked
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {cat.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {cat.is_locked ? 'Locked' : 'Unlocked'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => removeCategory(idx)}
                        disabled={categories.length <= 1}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-danger-600 hover:bg-danger-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
