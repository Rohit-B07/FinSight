'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Save } from 'lucide-react';
import { api } from '../../../lib/api';

export default function PrioritiesPage() {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        const { data, error } = await supabase.from('business_priorities').select('*').order('name');
        if (error) throw error;
        
        if (data && data.length > 0) {
          setPriorities(data);
        } else {
          // Default mock if none in DB
          setPriorities([
            { id: 1, name: 'Growth', weight: 40 },
            { id: 2, name: 'Profitability', weight: 30 },
            { id: 3, name: 'Innovation', weight: 20 },
            { id: 4, name: 'Stability', weight: 10 },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPriorities();
  }, []);

  const totalWeight = priorities.reduce((sum, p) => sum + Number(p.weight), 0);

  const handleWeightChange = (id, newWeight) => {
    setPriorities(priorities.map(p => 
      p.id === id ? { ...p, weight: Number(newWeight) } : p
    ));
  };

  const handleNameChange = (id, newName) => {
    setPriorities(priorities.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Assuming a backend endpoint or direct supabase upsert
      await api.post('/budget/priorities', { priorities }).catch(async () => {
        // Fallback to direct supabase if API not ready
        for (const p of priorities) {
          if (p.id) {
            await supabase.from('business_priorities').update({ name: p.name, weight: p.weight }).eq('id', p.id);
          }
        }
      });
      alert('Priorities saved successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to save priorities');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Business Priorities</h1>
          <p className="text-slate-500 mt-1">Configure weights to guide budget optimization models.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || totalWeight !== 100}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`p-4 border-b flex justify-between items-center ${totalWeight === 100 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          <span className="font-semibold">Total Weight Distribution</span>
          <span className="font-bold text-xl">{totalWeight}%</span>
        </div>
        
        {totalWeight !== 100 && (
          <div className="px-6 py-3 bg-red-100 text-red-700 text-sm font-medium">
            Warning: Total weight must equal exactly 100%. Currently at {totalWeight}%.
          </div>
        )}

        <div className="p-6 space-y-8">
          {priorities.map((priority) => (
            <div key={priority.id} className="flex items-center space-x-6">
              <input
                type="text"
                value={priority.name}
                onChange={(e) => handleNameChange(priority.id, e.target.value)}
                className="w-48 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1 flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priority.weight}
                  onChange={(e) => handleWeightChange(priority.id, e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="w-16 text-right font-mono font-medium text-slate-700">
                  {priority.weight}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
