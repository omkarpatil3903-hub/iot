import { Thermometer, Calendar, ArrowRight } from 'lucide-react';
import { getGDDSummary, STAGE_THRESHOLDS } from '../utils/gddCalculator';

const GDDCard = ({ accumulatedGDD = 850, dailyGDD = 15, plantingDate }) => {
    const summary = getGDDSummary(accumulatedGDD, dailyGDD);

    // Stage colors
    const stageColors = {
        'Germination': { bg: 'bg-lime-500/20', text: 'text-lime-400' },
        'Tillering': { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
        'Grand Growth': { bg: 'bg-cane-green/20', text: 'text-cane-green' },
        'Maturity': { bg: 'bg-amber-500/20', text: 'text-amber-400' },
        'Harvest Ready': { bg: 'bg-orange-500/20', text: 'text-orange-400' }
    };

    const currentColors = stageColors[summary.currentStage] || stageColors['Germination'];

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Thermometer className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-white">Growing Degree Days</h3>
                        <p className="text-xs text-white/50">Thermal accumulation</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-orange-400">{summary.totalGDD}</p>
                    <p className="text-xs text-white/50">GDD accumulated</p>
                </div>
            </div>

            {/* Stage Progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${currentColors.text}`}>
                        {summary.currentStage}
                    </span>
                    <span className="text-xs text-white/50">{summary.stageProgress}% complete</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${currentColors.bg.replace('/20', '')} rounded-full transition-all duration-500`}
                        style={{ width: `${summary.stageProgress}%` }}
                    />
                </div>

                {/* Stage Markers */}
                <div className="flex mt-2 gap-1">
                    {Object.entries(STAGE_THRESHOLDS).map(([key, stage], index) => {
                        const isActive = summary.currentStage === stage.name;
                        const isPast = summary.totalGDD > stage.max;
                        return (
                            <div
                                key={key}
                                className={`flex-1 h-1 rounded-full transition-colors ${isPast ? 'bg-cane-green' : isActive ? currentColors.bg.replace('/20', '/50') : 'bg-white/10'
                                    }`}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-white/40">
                    <span>Germ</span>
                    <span>Tiller</span>
                    <span>Growth</span>
                    <span>Mature</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2.5 bg-white/5 rounded-xl">
                    <p className="text-xs text-white/50">Today's GDD</p>
                    <p className="text-lg font-semibold text-white">+{summary.gddToday}</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl">
                    <p className="text-xs text-white/50">Base Temp</p>
                    <p className="text-lg font-semibold text-white">10°C</p>
                </div>
            </div>

            {/* Next Stage Prediction */}
            {summary.nextStage && (
                <div className="p-3 bg-cane-green/10 rounded-xl border border-cane-green/20">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cane-green" />
                        <p className="text-sm text-cane-green-light">
                            <span className="font-medium">{summary.nextStage}</span>
                            {summary.daysToNextStage && (
                                <>
                                    <ArrowRight className="w-3 h-3 inline mx-1" />
                                    <span className="text-white/60">~{summary.daysToNextStage} days</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GDDCard;
