'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await api.get('/ml/models').catch(() => null);
        if (data) {
          setModels(data);
        } else {
          // Mock data fallback
          setModels([
            { id: 'm1', version: 'v2.4.1', algorithm: 'XGBoost', trained_at: '2023-10-15T08:30:00Z', mae: 450.2, rmse: 620.5, r2: 0.94, is_active: true },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const handleActivate = async (id) => {
    try {
      await api.post('/ml/models/activate', { model_id: id }).catch(() => null);
      setModels(models.map(m => ({
        ...m,
        is_active: m.id === id
      })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading models...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">ML Model Management</h1>
      <p className="text-slate-500">Manage and deploy predictive models for budget and risk analysis.</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Algorithm</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trained At</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">MAE</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">RMSE</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">R²</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {models.map((model) => (
              <tr key={model.id} className={model.is_active ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{model.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{model.algorithm}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(model.trained_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{model.mae}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{model.rmse}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">{model.r2}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {model.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!model.is_active && (
                    <button
                      onClick={() => handleActivate(model.id)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" /> Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
