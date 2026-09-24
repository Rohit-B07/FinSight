'use client';

import { AlertTriangle, CheckCircle, XCircle, AlertCircle, Info, Zap, Clock, User } from 'lucide-react';

export default function RiskAlertFeed({ alerts = [], onAcknowledge, limit }) {
  const displayAlerts = limit ? alerts.slice(0, limit) : alerts;

  const getSeverityStyles = (severity) => {
    switch ((severity || '').toLowerCase?.() ?? severity) {
      case 'critical': return {
        wrapper: 'bg-gradient-to-r from-danger-50 to-white border-danger-200',
        badge: 'bg-danger-500 text-white',
        iconBg: 'bg-danger-100 text-danger-600',
        dot: 'bg-danger-500',
        border: 'border-l-danger-500',
      };
      case 'high': return {
        wrapper: 'bg-gradient-to-r from-orange-50 to-white border-orange-200',
        badge: 'bg-orange-500 text-white',
        iconBg: 'bg-orange-100 text-orange-600',
        dot: 'bg-orange-500',
        border: 'border-l-orange-500',
      };
      case 'medium': return {
        wrapper: 'bg-gradient-to-r from-warning-50 to-white border-warning-200',
        badge: 'bg-warning-500 text-white',
        iconBg: 'bg-warning-100 text-warning-600',
        dot: 'bg-warning-500',
        border: 'border-l-warning-500',
      };
      case 'low':
      default: return {
        wrapper: 'bg-gradient-to-r from-success-50 to-white border-success-200',
        badge: 'bg-success-500 text-white',
        iconBg: 'bg-success-100 text-success-600',
        dot: 'bg-success-500',
        border: 'border-l-success-500',
      };
    }
  };

  const getIcon = (severity) => {
    switch ((severity || '').toLowerCase?.() ?? severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertCircle;
      case 'low':
      default: return Info;
    }
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHr = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHr / 24);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${diffDay}d ago`;
  };

  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center bg-slate-50/50">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-success-50 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-success-500" />
        </div>
        <h4 className="font-bold text-slate-800 mb-1.5">All clear — no active alerts</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Your risk indicators are currently stable. Continue monitoring for any changes.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success-100 text-success-700 border border-success-200 text-xs font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
          </span>
          Monitoring Active
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert, idx) => {
        const styles = getSeverityStyles(alert.severity);
        const Icon = getIcon(alert.severity);
        const sev = (alert.severity || 'low').toLowerCase?.() ?? alert.severity ?? 'low';
        return (
          <div
            key={alert.id || idx}
            className={`rounded-2xl border ${styles.wrapper} border-l-4 ${styles.border} p-4 md:p-5 shadow-soft hover:shadow-medium transition-all duration-300 animate-slide-up`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg}`}>
                <Icon className="w-5.5 h-5.5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles.badge}`}>
                    <Zap className="w-3 h-3" />
                    {alert.severity || 'Low'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(alert.created_at)}
                  </span>
                  {alert.indicator_type && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/60 border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      {alert.indicator_type}
                    </span>
                  )}
                </div>

                <p className="font-bold text-slate-800 leading-snug mb-1.5">
                  {alert.message || alert.threshold_breached || 'Risk threshold exceeded'}
                </p>

                {alert.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{alert.description}</p>
                )}

                {alert.source && (
                  <p className="mt-2 text-xs text-slate-400 inline-flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Source: {alert.source}
                  </p>
                )}
              </div>

              {onAcknowledge && !alert.acknowledged && (
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all duration-200 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                </div>
              )}

              {alert.acknowledged && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {limit && alerts.length > limit && (
        <button className="w-full py-3 text-sm font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-xl transition-colors">
          View {alerts.length - limit} more alerts →
        </button>
      )}
    </div>
  );
}
