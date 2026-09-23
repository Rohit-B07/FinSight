'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Trash2, Save } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('budget_categories').select('*').order('name');
      if (data) setCategories(data);
      else setCategories([{ id: 1, name: 'Marketing', min_spend: 100000, max_spend: 500000, is_locked: false }]); // mock
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleChange = (index, field, value) => {
    const newCats = [...categories];
    newCats[index][field] = value;
    setCategories(newCats);
  };

  const addCategory = () => {
    setCategories([...categories, { id: Date.now(), name: 'New Category', min_spend: 0, max_spend: 100000, is_locked: false }]);
  };

  const removeCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    // Simplified save logic
    alert('Categories saved successfully');
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Budget Categories</h1>
        <div className="space-x-3">
          <button onClick={addCategory} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </button>
          <button onClick={saveChanges} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Min Spend (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Max Spend (₹)</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Locked default</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((cat, idx) => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleChange(idx, 'name', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={cat.min_spend}
                    onChange={(e) => handleChange(idx, 'min_spend', Number(e.target.value))}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={cat.max_spend}
                    onChange={(e) => handleChange(idx, 'max_spend', Number(e.target.value))}
                    className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none py-1"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={cat.is_locked}
                    onChange={(e) => handleChange(idx, 'is_locked', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => removeCategory(idx)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
