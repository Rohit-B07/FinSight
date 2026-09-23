'use client';

import { useState, useEffect } from 'react';
import RiskGauge from '../../components/RiskGauge';
import RiskAlertFeed from '../../components/RiskAlertFeed';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function RiskPage() {
  const [data, setData] = useState({
    dashboard: null,
    alerts: [],
    loading: true
  });

  const fetchRiskData = async () => {
    try {
      const [dashRes, alertsRes] = await Promise.all([
        api.get('/risk/dashboard').catch(() => null),
        api.get('/risk/alerts').catch(() => null)
      ]);
      setData({
        dashboard: dashRes || { overall_score: 65, severity: 'medium', indicators: {} },
        alerts: alertsRes || [],
        loading: false
      });
    } catch (err) {
      console.error(err);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchRiskData();

    const channel = supabase
      .channel('risk_alerts_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'risk_alerts' }, payload => {
        setData(prev => ({
          ...prev,
          alerts: [payload.new, ...prev.alerts]
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcknowledge = async (id) => {
    // Optimistic update
    setData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== id)
    }));
    try {
      await api.post(`/risk/alerts/${id}/acknowledge`);
    } catch (err) {
      console.error('Failed to acknowledge', err);
      // Revert if needed
    }
  };

  if (data.loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading risk intelligence...</div>;
  }

  const indicators = [
    { name: 'Market Volatility', value: 72, trend: 'up' },
    { name: 'Liquidity Risk', value: 34, trend: 'down' },
    { name: 'Credit Risk', value: 45, trend: 'flat' },
    { name: 'Operational Risk', value: 60, trend: 'up' },
    { name: 'Compliance Risk', value: 20, trend: 'down' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Risk Intelligence</h1>
        <p className="text-slate-500 mt-2">Real-time monitoring and anomaly detection</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Overall Risk Posture</h2>
        <RiskGauge 
          score={data.dashboard?.overall_score || 45} 
          severity={data.dashboard?.severity || 'medium'} 
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {indicators.map((ind, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-sm font-medium text-slate-500 mb-2">{ind.name}</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-slate-800">{ind.value}</span>
              {ind.trend === 'up' && <ArrowUpRight className="w-5 h-5 text-red-500" />}
              {ind.trend === 'down' && <ArrowDownRight className="w-5 h-5 text-emerald-500" />}
              {ind.trend === 'flat' && <Minus className="w-5 h-5 text-slate-400" />}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Active Risk Alerts</h3>
        <RiskAlertFeed alerts={data.alerts} onAcknowledge={handleAcknowledge} />
      </div>
    </div>
  );
}
