/**
 * Moisture Analytics Utility
 * Calculates depletion rate and water infiltration metrics
 */

/**
 * Calculate moisture depletion rate
 * @param {Array} readings - Array of {timestamp, moisture} readings
 * @returns {object} Depletion metrics
 */
export const calculateDepletionRate = (readings) => {
    if (!readings || readings.length < 2) {
        return { rate: null, trend: 'stable', hoursUntilCritical: null };
    }

    // Sort by timestamp
    const sorted = [...readings].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Calculate time difference in hours
    const timeDiff = (new Date(last.timestamp) - new Date(first.timestamp)) / (1000 * 60 * 60);
    if (timeDiff <= 0) return { rate: null, trend: 'stable', hoursUntilCritical: null };

    // Calculate average moisture change
    const moistureChange = last.moisture - first.moisture;
    const ratePerHour = moistureChange / timeDiff;

    // Determine trend
    let trend = 'stable';
    if (ratePerHour < -0.5) trend = 'depleting';
    else if (ratePerHour > 0.5) trend = 'increasing';

    // Estimate hours until critical (below 40%)
    const criticalLevel = 40;
    const currentMoisture = last.moisture;
    let hoursUntilCritical = null;

    if (ratePerHour < 0 && currentMoisture > criticalLevel) {
        hoursUntilCritical = (currentMoisture - criticalLevel) / Math.abs(ratePerHour);
    }

    return {
        rate: Math.round(ratePerHour * 100) / 100,
        trend,
        hoursUntilCritical: hoursUntilCritical ? Math.round(hoursUntilCritical) : null,
        currentMoisture
    };
};

/**
 * Calculate water infiltration speed
 * Measures how quickly water moves from surface to root zone
 * @param {Array} surfaceReadings - Surface moisture readings
 * @param {Array} rootZoneReadings - Root zone moisture readings
 * @returns {object} Infiltration metrics
 */
export const calculateInfiltrationSpeed = (surfaceReadings, rootZoneReadings) => {
    if (!surfaceReadings?.length || !rootZoneReadings?.length) {
        return { speed: null, status: 'unknown', lagHours: null };
    }

    // Calculate average difference and lag
    const surfaceAvg = surfaceReadings.reduce((s, r) => s + r.moisture, 0) / surfaceReadings.length;
    const rootAvg = rootZoneReadings.reduce((s, r) => s + r.moisture, 0) / rootZoneReadings.length;

    const difference = surfaceAvg - rootAvg;

    // Estimate infiltration lag by finding peak correlation
    // Simplified: just calculate based on moisture differential
    let speed, status, lagHours;

    if (difference > 15) {
        speed = 'slow';
        status = 'poor';
        lagHours = 4;
    } else if (difference > 8) {
        speed = 'moderate';
        status = 'normal';
        lagHours = 2;
    } else if (difference > 0) {
        speed = 'fast';
        status = 'good';
        lagHours = 1;
    } else {
        speed = 'saturated';
        status = 'waterlogged';
        lagHours = 0;
    }

    return {
        speed,
        status,
        lagHours,
        surfaceAvg: Math.round(surfaceAvg),
        rootAvg: Math.round(rootAvg),
        differential: Math.round(difference)
    };
};

/**
 * Estimate next irrigation time
 * @param {number} currentMoisture - Current moisture level
 * @param {number} depletionRate - Depletion rate per hour
 * @param {number} targetMoisture - Target moisture to trigger irrigation
 * @returns {object} Irrigation estimate
 */
export const estimateIrrigationTime = (currentMoisture, depletionRate, targetMoisture = 50) => {
    if (depletionRate >= 0 || currentMoisture <= targetMoisture) {
        return { hoursUntil: 0, recommended: true };
    }

    const hoursUntil = (currentMoisture - targetMoisture) / Math.abs(depletionRate);

    return {
        hoursUntil: Math.round(hoursUntil),
        recommended: hoursUntil < 6
    };
};

export default {
    calculateDepletionRate,
    calculateInfiltrationSpeed,
    estimateIrrigationTime
};
