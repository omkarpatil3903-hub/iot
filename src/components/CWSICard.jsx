import { Droplet, AlertTriangle } from 'lucide-react';
import { calculateCWSI, getCWSIColor, calculateVPD } from '../utils/cwsiCalculator';

const CWSICard = ({ temperature, humidity, soilMoisture }) => {
    const cwsi = calculateCWSI(temperature, humidity, soilMoisture);
    const vpd = calculateVPD(temperature, humidity);
    const colors = getCWSIColor(cwsi.level);

    // Calculate gauge percentage (0-1 to 0-100)
    const gaugePercent = cwsi.value !== null ? cwsi.value * 100 : 0;

    return (
        <div className={`bg-surface-card rounded-2xl p-4 border border-white/10 h-full flex flex-col ${cwsi.level === 'severe' || cwsi.level === 'high' ? 'ring-1 ring-red-500/30' : ''
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                        {cwsi.level === 'severe' || cwsi.level === 'high' ? (
                            <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                        ) : (
                            <Droplet className={`w-5 h-5 ${colors.text}`} />
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Crop Water Stress</h3>
                        <p className="text-xs text-white/50">CWSI Index (0-1)</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-2xl font-bold ${colors.text}`}>
                        {cwsi.value !== null ? cwsi.value.toFixed(2) : '--'}
                    </p>
                    <p className={`text-xs ${colors.text} capitalize`}>{cwsi.level}</p>
                </div>
            </div>

            {/* CWSI Gauge Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">Stress Level</span>
                    <span className="text-xs text-white/50">{gaugePercent.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full relative">
                        {/* Gradient background showing full scale */}
                        <div className="absolute inset-0 opacity-30"
                            style={{
                                background: 'linear-gradient(to right, #10B981, #3B82F6, #F59E0B, #EF4444)'
                            }}
                        />
                        {/* Active portion */}
                        <div
                            className={`h-full ${colors.bg.replace('/20', '')} transition-all duration-500`}
                            style={{ width: `${gaugePercent}%` }}
                        />
                    </div>
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-white/40">
                    <span>No Stress</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                </div>
            </div>

            {/* VPD Display */}
            <div className="grid grid-cols-2 gap-3 mb-3 flex-grow">
                <div className="p-2.5 bg-white/5 rounded-xl">
                    <p className="text-xs text-white/50">VPD</p>
                    <p className="text-lg font-semibold text-white">
                        {vpd !== null ? `${vpd} kPa` : '--'}
                    </p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl">
                    <p className="text-xs text-white/50">Soil Moisture</p>
                    <p className="text-lg font-semibold text-white">
                        {soilMoisture !== null ? `${soilMoisture.toFixed(1)}%` : '--'}
                    </p>
                </div>
            </div>

            {/* Message */}
            <div className={`p-2.5 rounded-xl ${colors.bg} mt-auto`}>
                <p className={`text-sm ${colors.text}`}>{cwsi.message}</p>
            </div>
        </div>
    );
};

export default CWSICard;
