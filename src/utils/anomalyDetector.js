/**
 * Anomaly Detector
 * Identifies unusual sensor readings that may indicate:
 * - Sensor malfunction
 * - Environmental extremes
 * - Data transmission issues
 */

const ANOMALY_THRESHOLDS = {
    moisture: {
        min: 0,
        max: 100,
        maxChangePerHour: 20,  // Max % change in 1 hour
        stuckThreshold: 6      // Hours of identical readings = stuck sensor
    },
    temperature: {
        min: -10,
        max: 55,
        maxChangePerHour: 10,  // Max °C change in 1 hour
        stuckThreshold: 6
    },
    humidity: {
        min: 0,
        max: 100,
        maxChangePerHour: 30,
        stuckThreshold: 6
    }
};

const SEVERITY_LEVELS = {
    LOW: { label: 'Low', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    MEDIUM: { label: 'Medium', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    HIGH: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' }
};

/**
 * Check if value is out of range
 * @param {number} value - Sensor value
 * @param {string} sensorType - Type of sensor
 * @returns {object|null} Anomaly if detected
 */
const checkOutOfRange = (value, sensorType) => {
    const threshold = ANOMALY_THRESHOLDS[sensorType];
    if (!threshold) return null;

    if (value < threshold.min) {
        return {
            type: 'out_of_range_low',
            message: `${sensorType} reading below minimum (${value} < ${threshold.min})`,
            severity: 'HIGH',
            sensorType
        };
    }

    if (value > threshold.max) {
        return {
            type: 'out_of_range_high',
            message: `${sensorType} reading above maximum (${value} > ${threshold.max})`,
            severity: 'HIGH',
            sensorType
        };
    }

    return null;
};

/**
 * Check for sudden spikes or drops
 * @param {Array} readings - Array of {timestamp, value}
 * @param {string} sensorType - Type of sensor
 * @returns {object|null} Anomaly if detected
 */
const checkSuddenChange = (readings, sensorType) => {
    if (!readings || readings.length < 2) return null;

    const threshold = ANOMALY_THRESHOLDS[sensorType];
    if (!threshold) return null;

    // Sort by timestamp
    const sorted = [...readings].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Check consecutive readings
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        const hoursDiff = (new Date(curr.timestamp) - new Date(prev.timestamp)) / (1000 * 60 * 60);

        if (hoursDiff > 0 && hoursDiff <= 2) {
            const changeRate = Math.abs(curr.value - prev.value) / hoursDiff;

            if (changeRate > threshold.maxChangePerHour) {
                return {
                    type: 'sudden_change',
                    message: `Rapid ${sensorType} change: ${Math.round(changeRate)}%/hour`,
                    severity: changeRate > threshold.maxChangePerHour * 2 ? 'HIGH' : 'MEDIUM',
                    sensorType,
                    changeRate: Math.round(changeRate)
                };
            }
        }
    }

    return null;
};

/**
 * Check for stuck sensor (no change over time)
 * @param {Array} readings - Array of {timestamp, value}
 * @param {string} sensorType - Type of sensor
 * @returns {object|null} Anomaly if detected
 */
const checkStuckSensor = (readings, sensorType) => {
    if (!readings || readings.length < 3) return null;

    const threshold = ANOMALY_THRESHOLDS[sensorType];
    if (!threshold) return null;

    // Sort by timestamp
    const sorted = [...readings].sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Check if all recent readings are identical
    const recentReadings = sorted.slice(-6); // Last 6 readings
    const firstValue = recentReadings[0]?.value;

    const allSame = recentReadings.every(r => r.value === firstValue);

    if (allSame && recentReadings.length >= 3) {
        const hoursSpan = (new Date(recentReadings[recentReadings.length - 1].timestamp) -
            new Date(recentReadings[0].timestamp)) / (1000 * 60 * 60);

        if (hoursSpan >= threshold.stuckThreshold) {
            return {
                type: 'stuck_sensor',
                message: `${sensorType} sensor stuck at ${firstValue} for ${Math.round(hoursSpan)}h`,
                severity: 'MEDIUM',
                sensorType,
                stuckValue: firstValue
            };
        }
    }

    return null;
};

/**
 * Run all anomaly checks on sensor data
 * @param {object} currentData - Current sensor readings
 * @param {object} historicalData - Historical readings
 * @returns {Array} List of detected anomalies
 */
export const detectAnomalies = (currentData, historicalData) => {
    const anomalies = [];

    if (!currentData) return anomalies;

    // Check current moisture readings
    ['moisture_15cm', 'moisture_30cm', 'moisture_45cm'].forEach(key => {
        const value = currentData[key];
        if (value !== undefined) {
            const anomaly = checkOutOfRange(value, 'moisture');
            if (anomaly) {
                anomaly.sensor = key;
                anomalies.push(anomaly);
            }
        }
    });

    // Check temperature
    if (currentData.temperature !== undefined) {
        const anomaly = checkOutOfRange(currentData.temperature, 'temperature');
        if (anomaly) {
            anomaly.sensor = 'temperature';
            anomalies.push(anomaly);
        }
    }

    // Check humidity
    if (currentData.humidity !== undefined) {
        const anomaly = checkOutOfRange(currentData.humidity, 'humidity');
        if (anomaly) {
            anomaly.sensor = 'humidity';
            anomalies.push(anomaly);
        }
    }

    // Check historical data for patterns
    if (historicalData?.temperature) {
        const readings = historicalData.temperature.map(d => ({
            timestamp: d.timestamp,
            value: d.temperature
        }));

        const suddenChange = checkSuddenChange(readings, 'temperature');
        if (suddenChange) anomalies.push(suddenChange);

        const stuck = checkStuckSensor(readings, 'temperature');
        if (stuck) anomalies.push(stuck);
    }

    return anomalies;
};

/**
 * Get sensor health status based on anomalies
 * @param {Array} anomalies - List of anomalies
 * @returns {object} Health status
 */
export const getSensorHealth = (anomalies) => {
    if (!anomalies || anomalies.length === 0) {
        return {
            status: 'healthy',
            label: 'All Sensors Normal',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/20'
        };
    }

    const hasHigh = anomalies.some(a => a.severity === 'HIGH');
    const hasMedium = anomalies.some(a => a.severity === 'MEDIUM');

    if (hasHigh) {
        return {
            status: 'critical',
            label: 'Critical Issues Detected',
            color: 'text-red-400',
            bg: 'bg-red-500/20'
        };
    }

    if (hasMedium) {
        return {
            status: 'warning',
            label: 'Warnings Detected',
            color: 'text-amber-400',
            bg: 'bg-amber-500/20'
        };
    }

    return {
        status: 'minor',
        label: 'Minor Issues',
        color: 'text-blue-400',
        bg: 'bg-blue-500/20'
    };
};

export { SEVERITY_LEVELS, ANOMALY_THRESHOLDS };
export default { detectAnomalies, getSensorHealth };
