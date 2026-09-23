'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function RiskAlertFeed({ alerts = [], onAcknowledge }) {
  const getSeverityStyles = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': 
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const getSeverityBadge = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': 
      default: return 'bg-emerald-100 text-emerald-800';
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((new Date(timestamp).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) {
      const hoursDiff = Math.round((new Date(timestamp).getTime() - new Date().getTime()) / (1000 * 60 * 60));
      if (hoursDiff === 0) {
        const minDiff = Math.round((new Date(timestamp).getTime() - new Date().getTime()) / (1000 * 60));
        return rtf.format(minDiff, 'minute');
      }
      return rtf.format(hoursDiff, 'hour');
    }
    return rtf.format(daysDifference, 'day');
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-800">No active alerts</h3>
        <p className="text-sm text-slate-500">Your risk levels are currently stable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityStyles(alert.severity)} shadow-sm flex items-start justify-between`}>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-xs opacity-75">{formatRelativeTime(alert.created_at)}</span>
              </div>
              <p className="font-medium text-sm leading-snug">{alert.message}</p>
            </div>
          </div>
          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="ml-4 px-3 py-1 bg-white bg-opacity-50 hover:bg-opacity-100 rounded text-sm font-medium transition-colors"
            >
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
