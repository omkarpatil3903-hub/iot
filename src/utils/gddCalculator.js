/**
 * Growing Degree Days (GDD) Calculator
 * 
 * GDD measures heat accumulation to predict crop development
 * Formula: GDD = max(0, (Tmax + Tmin) / 2 - Tbase)
 * 
 * Sugarcane base temperature: 10°C
 * Stage thresholds based on accumulated GDD
 */

const SUGARCANE_BASE_TEMP = 10; // °C

const STAGE_THRESHOLDS = {
    GERMINATION: { min: 0, max: 350, name: 'Germination' },
    TILLERING: { min: 350, max: 1000, name: 'Tillering' },
    GRAND_GROWTH: { min: 1000, max: 2800, name: 'Grand Growth' },
    MATURITY: { min: 2800, max: 4000, name: 'Maturity' }
};

/**
 * Calculate daily GDD
 * @param {number} maxTemp - Maximum temperature of the day
 * @param {number} minTemp - Minimum temperature of the day
 * @param {number} baseTemp - Base temperature (default: 10°C for sugarcane)
 * @returns {number} GDD for the day
 */
export const calculateDailyGDD = (maxTemp, minTemp, baseTemp = SUGARCANE_BASE_TEMP) => {
    if (maxTemp == null || minTemp == null) return 0;

    const avgTemp = (maxTemp + minTemp) / 2;
    return Math.max(0, avgTemp - baseTemp);
};

/**
 * Calculate accumulated GDD from temperature history
 * @param {Array} temperatureHistory - Array of {date, maxTemp, minTemp}
 * @returns {number} Total accumulated GDD
 */
export const calculateAccumulatedGDD = (temperatureHistory) => {
    if (!temperatureHistory || temperatureHistory.length === 0) return 0;

    return temperatureHistory.reduce((total, day) => {
        return total + calculateDailyGDD(day.maxTemp, day.minTemp);
    }, 0);
};

/**
 * Get current growth stage based on accumulated GDD
 * @param {number} accumulatedGDD - Total GDD accumulated
 * @returns {object} Current stage information
 */
export const getGrowthStage = (accumulatedGDD) => {
    for (const [stageKey, stage] of Object.entries(STAGE_THRESHOLDS)) {
        if (accumulatedGDD >= stage.min && accumulatedGDD < stage.max) {
            const progress = ((accumulatedGDD - stage.min) / (stage.max - stage.min)) * 100;
            return {
                stage: stageKey,
                name: stage.name,
                progress: Math.round(progress),
                gddInStage: Math.round(accumulatedGDD - stage.min),
                gddNeededForNext: Math.round(stage.max - accumulatedGDD)
            };
        }
    }

    // Beyond maturity
    return {
        stage: 'HARVEST',
        name: 'Harvest Ready',
        progress: 100,
        gddInStage: accumulatedGDD - STAGE_THRESHOLDS.MATURITY.min,
        gddNeededForNext: 0
    };
};

/**
 * Estimate days until next stage
 * @param {number} accumulatedGDD - Current GDD
 * @param {number} avgDailyGDD - Average daily GDD accumulation
 * @returns {object} Estimate information
 */
export const estimateDaysToNextStage = (accumulatedGDD, avgDailyGDD) => {
    const stage = getGrowthStage(accumulatedGDD);

    if (stage.gddNeededForNext === 0 || avgDailyGDD <= 0) {
        return { days: null, nextStage: null };
    }

    const daysNeeded = Math.ceil(stage.gddNeededForNext / avgDailyGDD);

    // Find next stage name
    const stageOrder = ['GERMINATION', 'TILLERING', 'GRAND_GROWTH', 'MATURITY', 'HARVEST'];
    const currentIndex = stageOrder.indexOf(stage.stage);
    const nextStage = currentIndex < stageOrder.length - 1
        ? STAGE_THRESHOLDS[stageOrder[currentIndex + 1]]?.name || 'Harvest'
        : 'Harvest';

    return {
        days: daysNeeded,
        nextStage
    };
};

/**
 * Generate GDD summary for display
 * @param {number} accumulatedGDD - Total accumulated GDD
 * @param {number} avgDailyGDD - Average daily GDD
 * @returns {object} Summary for UI
 */
export const getGDDSummary = (accumulatedGDD, avgDailyGDD = 15) => {
    const stage = getGrowthStage(accumulatedGDD);
    const estimate = estimateDaysToNextStage(accumulatedGDD, avgDailyGDD);

    return {
        totalGDD: Math.round(accumulatedGDD),
        currentStage: stage.name,
        stageProgress: stage.progress,
        daysToNextStage: estimate.days,
        nextStage: estimate.nextStage,
        gddToday: avgDailyGDD
    };
};

export { STAGE_THRESHOLDS, SUGARCANE_BASE_TEMP };
export default {
    calculateDailyGDD,
    calculateAccumulatedGDD,
    getGrowthStage,
    estimateDaysToNextStage,
    getGDDSummary
};
