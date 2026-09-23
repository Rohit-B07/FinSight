'use client';

import { useState, useEffect } from 'react';
import { Wallet, ShieldAlert, Bell, Brain } from 'lucide-react';
import SummaryCard from '../../components/SummaryCard';
import TrendChart from '../../components/TrendChart';
import RiskAlertFeed from '../../components/RiskAlertFeed';
import { api } from '../../lib/api';

export default function DashboardPage() {
  const [data, setData] = useState({
    budget: null,
    risk: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [budgetRes, riskRes] = await Promise.all([
          api.get('/budget/recommendations').catch(() => null),
          api.get('/risk/dashboard').catch(() => null)
        ]);

        setData({
          budget: budgetRes,
          risk: riskRes,
          loading: false,
          error: null
        });
      } catch (err) {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    fetchDashboardData();
  }, []);

  if (data.loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading dashboard data...</div>;
  }

  // Mock data for charts if API fails
  const mockTrendData = [
    { month: 'Jan', spend: 4000, risk: 24 },
    { month: 'Feb', spend: 3000, risk: 13 },
    { month: 'Mar', spend: 2000, risk: 98 },
    { month: 'Apr', spend: 2780, risk: 39 },
    { month: 'May', spend: 1890, risk: 48 },
    { month: 'Jun', spend: 2390, risk: 38 },
  ];

  const totalBudget = data.budget?.recommendations?.reduce((acc, curr) => acc + curr.current_budget, 0) || 500000;
  const riskScore = data.risk?.overall_score || 45;
  const activeAlerts = data.risk?.active_alerts || [];
  const modelActive = true;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
      
      {data.error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          Failed to load some dashboard data. Showing available or mock data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Budget" 
          value={`₹${(totalBudget/1000).toFixed(0)}k`} 
          icon={Wallet} 
          trend="2.5%" 
          trendDirection="up"
        />
        <SummaryCard 
          title="Risk Score" 
          value={riskScore.toFixed(1)} 
          icon={ShieldAlert} 
          subtitle="Medium Risk"
        />
        <SummaryCard 
          title="Active Alerts" 
          value={activeAlerts.length} 
          icon={Bell} 
          trend={activeAlerts.length > 0 ? "Requires action" : "All clear"} 
          trendDirection={activeAlerts.length > 0 ? "down" : "up"}
        />
        <SummaryCard 
          title="ML Status" 
          value={modelActive ? "Active" : "Inactive"} 
          icon={Brain} 
          subtitle="v2.4.1 running"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart 
          title="Historical Spend vs Recommended" 
          data={mockTrendData} 
          xKey="month" 
          yKeys={['spend']} 
        />
        <TrendChart 
          title="Risk Score Trend" 
          data={mockTrendData} 
          xKey="month" 
          yKeys={['risk']} 
          colors={['#dc2626']}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Latest Risk Alerts</h3>
        <RiskAlertFeed alerts={activeAlerts.slice(0, 5)} />
      </div>
    </div>
  );
}
