import { Sprout, TreeDeciduous, TrendingUp, Wheat, ChevronDown, Calendar } from 'lucide-react';
import { GROWTH_STAGES } from '../config/agronomyConfig';

const iconMap = {
    Sprout: Sprout,
    TreeDeciduous: TreeDeciduous,
    TrendingUp: TrendingUp,
    Wheat: Wheat
};

const GrowthStageSelector = ({ selectedStage, onStageChange, plantingDate }) => {
    const stages = Object.values(GROWTH_STAGES);
    const currentStage = GROWTH_STAGES[selectedStage] || GROWTH_STAGES.GERMINATION;
    const Icon = iconMap[currentStage.icon] || Sprout;
    const currentIndex = stages.findIndex(s => s.id === currentStage.id);

    // Calculate days into stage (mock calculation - would use actual planting date)
    const getDaysProgress = () => {
        if (!plantingDate) return null;
        const daysSincePlanting = Math.floor((Date.now() - new Date(plantingDate).getTime()) / (1000 * 60 * 60 * 24));
        const stageRanges = [
            { stage: 'GERMINATION', start: 0, end: 35 },
            { stage: 'TILLERING', start: 35, end: 100 },
            { stage: 'GRAND_GROWTH', start: 100, end: 270 },
            { stage: 'MATURITY', start: 270, end: 360 }
        ];
        const range = stageRanges.find(r => r.stage === selectedStage);
        if (!range) return null;
        const daysIntoStage = Math.max(0, daysSincePlanting - range.start);
        const stageDuration = range.end - range.start;
        return {
            days: Math.min(daysIntoStage, stageDuration),
            total: stageDuration,
            percent: Math.min(100, (daysIntoStage / stageDuration) * 100)
        };
    };

    const progress = getDaysProgress();

    return (
        <div className="bg-surface-card rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white/70">Growth Stage</h3>
                <span className="text-xs text-white/50">{currentStage.duration}</span>
            </div>

            {/* Mobile: Dropdown */}
            <div className="relative md:hidden">
                <select
                    value={selectedStage}
                    onChange={(e) => onStageChange(e.target.value)}
                    className="w-full appearance-none bg-surface-elevated text-white rounded-xl px-4 py-3 pr-10 border border-white/10 focus:border-cane-green focus:outline-none focus:ring-2 focus:ring-cane-green/30 transition-all"
                    aria-label="Select growth stage"
                >
                    {stages.map((stage) => (
                        <option
                            key={stage.id}
                            value={Object.keys(GROWTH_STAGES).find(key => GROWTH_STAGES[key].id === stage.id)}
                        >
                            {stage.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
            </div>

            {/* Desktop: Segmented Control with keyboard support */}
            <div className="hidden md:flex gap-2" role="tablist" aria-label="Growth stages">
                {stages.map((stage, index) => {
                    const StageIcon = iconMap[stage.icon] || Sprout;
                    const stageKey = Object.keys(GROWTH_STAGES).find(key => GROWTH_STAGES[key].id === stage.id);
                    const isSelected = selectedStage === stageKey;
                    const isPast = index < currentIndex;

                    return (
                        <button
                            key={stage.id}
                            role="tab"
                            aria-selected={isSelected}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => onStageChange(stageKey)}
                            onKeyDown={(e) => {
                                if (e.key === 'ArrowRight' && index < stages.length - 1) {
                                    const nextKey = Object.keys(GROWTH_STAGES).find(key => GROWTH_STAGES[key].id === stages[index + 1].id);
                                    onStageChange(nextKey);
                                } else if (e.key === 'ArrowLeft' && index > 0) {
                                    const prevKey = Object.keys(GROWTH_STAGES).find(key => GROWTH_STAGES[key].id === stages[index - 1].id);
                                    onStageChange(prevKey);
                                }
                            }}
                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cane-green/50 ${isSelected
                                    ? 'bg-cane-green text-white shadow-lg shadow-cane-green/30 scale-[1.02]'
                                    : isPast
                                        ? 'bg-cane-green/20 text-cane-green-light hover:bg-cane-green/30'
                                        : 'bg-surface-elevated text-white/60 hover:bg-surface-elevated/80 hover:text-white'
                                }`}
                        >
                            <StageIcon className="w-5 h-5" />
                            <span className="text-xs font-medium">{stage.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Stage Progress Bar */}
            <div className="mt-4 mb-3">
                <div className="flex items-center gap-1">
                    {stages.map((stage, index) => {
                        const isActive = index === currentIndex;
                        const isPast = index < currentIndex;
                        return (
                            <div
                                key={stage.id}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${isPast ? 'bg-cane-green' : isActive ? 'bg-cane-green/50' : 'bg-white/10'
                                    }`}
                            >
                                {isActive && progress && (
                                    <div
                                        className="h-full bg-cane-green rounded-full transition-all duration-500"
                                        style={{ width: `${progress.percent}%` }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stage Info */}
            <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl">
                <div className="p-2 bg-cane-green/20 rounded-lg">
                    <Icon className="w-5 h-5 text-cane-green" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{currentStage.name}</p>
                    <p className="text-xs text-white/50 truncate">{currentStage.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-white/50">Moisture Target</p>
                    <p className="text-sm font-bold text-cane-green">
                        {currentStage.moisture.min}% - {currentStage.moisture.max}%
                    </p>
                </div>
            </div>

            {/* Progress Info */}
            {progress && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/50">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Day {progress.days} of {progress.total} in this stage</span>
                </div>
            )}
        </div>
    );
};

export default GrowthStageSelector;
