/**
 * Temperature-Humidity Index (THI) Calculator
 * Used to assess heat stress conditions for crop evapotranspiration
 * 
 * Formula: THI = (0.8 × temp) + ((humidity / 100) × (temp - 14.4)) + 46.4
 */

/**
 * Calculate THI value
 * @param {number} temperature - Temperature in Celsius
 * @param {number} humidity - Relative humidity in percentage (0-100)
 * @returns {number} THI value rounded to 1 decimal
 */
export const calculateTHI = (temperature, humidity) => {
    if (temperature == null || humidity == null) return null;

    const thi = (0.8 * temperature) + ((humidity / 100) * (temperature - 14.4)) + 46.4;
    return Math.round(thi * 10) / 10;
};

/**
 * Get stress level based on THI value
 * @param {number} thi - Calculated THI value
 * @returns {object} Stress level details
 */
export const getStressLevel = (thi) => {
    if (thi == null) {
        return {
            level: 'unknown',
            label: 'No Data',
            color: 'gray',
            isAlert: false,
            message: 'Sensor data unavailable'
        };
    }

    if (thi < 68) {
        return {
            level: 'normal',
            label: 'Normal',
            color: 'success',
            isAlert: false,
            message: 'Ideal conditions for growth'
        };
    } else if (thi < 72) {
        return {
            level: 'mild',
            label: 'Mild Stress',
            color: 'info',
            isAlert: false,
            message: 'Monitor conditions closely'
        };
    } else if (thi < 78) {
        return {
            level: 'moderate',
            label: 'Moderate Stress',
            color: 'warning',
            isAlert: false,
            message: 'Increased evapotranspiration'
        };
    } else if (thi < 82) {
        return {
            level: 'high',
            label: 'High Stress',
            color: 'danger',
            isAlert: true,
            message: 'High evapotranspiration - irrigate!'
        };
    } else {
        return {
            level: 'severe',
            label: 'Severe Stress',
            color: 'danger',
            isAlert: true,
            message: 'Critical heat stress - immediate action needed'
        };
    }
};

/**
 * THI Threshold constant
 */
export const THI_ALERT_THRESHOLD = 78;

export default { calculateTHI, getStressLevel, THI_ALERT_THRESHOLD };
