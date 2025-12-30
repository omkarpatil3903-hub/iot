import { AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { detectAnomalies, getSensorHealth, SEVERITY_LEVELS } from '../utils/anomalyDetector';

const AnomalyAlertCard = ({ currentData, historicalData, onDismiss }) => {
    const anomalies = detectAnomalies(currentData, historicalData);
    const health = getSensorHealth(anomalies);

    const severityIcons = {
        HIGH: XCircle,
        MEDIUM: AlertTriangle,
        LOW: Activity
    };

    return (
        <div className={`bg-surface-card rounded-2xl p-4 border h-full flex flex-col ${health.status === 'healthy' ? 'border-white/10' : health.status === 'critical' ? 'border-red-500/30' : 'border-amber-500/30'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${health.bg}`}>
                        {health.status === 'healthy' ? (
                            <CheckCircle className={`w-5 h-5 ${health.color}`} />
                        ) : (
                            <AlertTriangle className={`w-5 h-5 ${health.color}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Sensor Health</h3>
                        <p className={`text-xs ${health.color}`}>{health.label}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-bold ${health.color}`}>
                        {anomalies.length}
                    </p>
                    <p className="text-xs text-white/50">issues</p>
                </div>
            </div>

            {/* Anomaly List */}
            {anomalies.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {anomalies.map((anomaly, index) => {
                        const SeverityIcon = severityIcons[anomaly.severity] || AlertTriangle;
                        const severity = SEVERITY_LEVELS[anomaly.severity] || SEVERITY_LEVELS.LOW;

                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-xl ${severity.bg} flex items-start gap-3`}
                            >
                                <SeverityIcon className={`w-4 h-4 ${severity.color} flex-shrink-0 mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${severity.color}`}>{anomaly.message}</p>
                                    <p className="text-xs text-white/50 mt-0.5 capitalize">
                                        {anomaly.sensorType || anomaly.sensor} • {severity.label} severity
                                    </p>
                                </div>
                                {onDismiss && (
                                    <button
                                        onClick={() => onDismiss(index)}
                                        className="text-white/40 hover:text-white/70 transition-colors"
                                        aria-label="Dismiss"
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-sm text-emerald-400">All sensors operating normally</p>
                    <p className="text-xs text-white/50 mt-1">No anomalies detected</p>
                </div>
            )}

            {/* Sensor Status Grid */}
            <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2">Sensor Status</p>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { name: 'Moisture', count: 3, status: 'ok' },
                        { name: 'Temp', count: 1, status: 'ok' },
                        { name: 'Humidity', count: 1, status: 'ok' },
                        { name: 'Rain', count: 1, status: 'ok' }
                    ].map((sensor) => {
                        const hasIssue = anomalies.some(a =>
                            a.sensorType === sensor.name.toLowerCase() ||
                            a.sensor?.includes(sensor.name.toLowerCase())
                        );
                        return (
                            <div
                                key={sensor.name}
                                className={`p-2 rounded-lg text-center ${hasIssue ? 'bg-red-500/20' : 'bg-white/5'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${hasIssue ? 'bg-red-400' : 'bg-emerald-400'
                                    }`} />
                                <p className="text-[10px] text-white/60">{sensor.name}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnomalyAlertCard;
