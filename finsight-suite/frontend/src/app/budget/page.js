'use client';

import { useState } from 'react';
import BudgetTable from '../../components/BudgetTable';
import BudgetSlider from '../../components/BudgetSlider';
import { api } from '../../lib/api';
import { RefreshCw } from 'lucide-react';

export default function BudgetPage() {
  const [scenario, setScenario] = useState('Balanced');
  const [totalBudget, setTotalBudget] = useState(1000000);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [lockedCategories, setLockedCategories] = useState({});
  const [sliderValues, setSliderValues] = useState({});

  const scenarios = ['Conservative', 'Balanced', 'Aggressive'];

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const payload = {
        total_budget: totalBudget,
        scenario: scenario.toLowerCase(),
        constraints: Object.entries(lockedCategories)
          .filter(([_, isLocked]) => isLocked)
          .map(([category]) => ({ category, exact: sliderValues[category] }))
      };
      
      const data = await api.post('/budget/optimize', payload);
      setResults(data);
      
      // Initialize slider values from results if not already set
      const newSliderValues = { ...sliderValues };
      data.recommendations.forEach(rec => {
        if (!newSliderValues[rec.category]) {
          newSliderValues[rec.category] = rec.recommended_budget;
        }
      });
      setSliderValues(newSliderValues);
    } catch (err) {
      console.error('Optimization failed:', err);
      // Fallback mock data for demo
      const mockData = {
        recommendations: [
          { category: 'Marketing', current_budget: 200000, recommended_budget: 250000, change_percent: 25, projected_impact: 'High', confidence: 0.85 },
          { category: 'R&D', current_budget: 300000, recommended_budget: 280000, change_percent: -6.7, projected_impact: 'Medium', confidence: 0.9 },
          { category: 'Operations', current_budget: 500000, recommended_budget: 470000, change_percent: -6, projected_impact: 'Low', confidence: 0.95 },
        ]
      };
      setResults(mockData);
      
      const newSliderValues = { ...sliderValues };
      mockData.recommendations.forEach(rec => {
        if (!newSliderValues[rec.category]) {
          newSliderValues[rec.category] = rec.recommended_budget;
        }
      });
      setSliderValues(newSliderValues);
    } finally {
      setLoading(false);
    }
  };

  const toggleLock = (category) => {
    setLockedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSliderChange = (category, value) => {
    setSliderValues(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const totalAllocated = Object.values(sliderValues).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Budget Optimization</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget (₹)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Optimization Scenario</label>
            <div className="flex space-x-2">
              {scenarios.map(s => (
                <button
                  key={s}
                  onClick={() => setScenario(s)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    scenario === s 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : null}
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-800">Optimization Results</h2>
          <BudgetTable recommendations={results.recommendations} />
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Fine-tune Allocations</h3>
              <div className="text-sm font-medium">
                Allocated: <span className={totalAllocated > totalBudget ? 'text-red-600' : 'text-emerald-600'}>
                  ₹{totalAllocated.toLocaleString('en-IN')}
                </span> / ₹{totalBudget.toLocaleString('en-IN')}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.recommendations.map((rec) => (
                <BudgetSlider
                  key={rec.category}
                  category={rec.category}
                  value={sliderValues[rec.category] || rec.recommended_budget}
                  min={rec.current_budget * 0.5}
                  max={rec.current_budget * 1.5}
                  isLocked={lockedCategories[rec.category] || false}
                  onChange={(val) => handleSliderChange(rec.category, val)}
                  onToggleLock={() => toggleLock(rec.category)}
                />
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleOptimize}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Re-optimize with Locks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
