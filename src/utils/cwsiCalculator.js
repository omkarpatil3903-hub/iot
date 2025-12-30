/**
 * Crop Water Stress Index (CWSI) Calculator
 * 
 * CWSI measures plant water stress on a 0-1 scale
 * 0 = No stress (well-watered)
 * 1 = Maximum stress (fully stressed)
 * 
 * Simplified formula using air temperature and humidity
 */

/**
 * Calculate wet bulb temperature (approximation)
 * @param {number} temp - Air temperature in Celsius
 * @param {number} humidity - Relative humidity in percentage
 * @returns {number} Wet bulb temperature
 */
const calculateWetBulb = (temp, humidity) => {
    // Stull formula approximation
    return temp * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) +
        Math.atan(temp + humidity) -
        Math.atan(humidity - 1.676331) +
        0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) -
        4.686035;
};

/**
 * Calculate Vapor Pressure Deficit (VPD)
 * @param {number} temp - Temperature in Celsius
 * @param {number} humidity - Relative humidity (0-100)
 * @returns {number} VPD in kPa
 */
export const calculateVPD = (temp, humidity) => {
    if (temp == null || humidity == null) return null;

    // Saturation vapor pressure (Tetens formula)
    const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));

    // Actual vapor pressure
    const ea = es * (humidity / 100);

    // VPD = saturation - actual
    return Math.round((es - ea) * 100) / 100;
};

/**
 * Calculate Crop Water Stress Index
 * @param {number} temp - Air temperature in Celsius
 * @param {number} humidity - Relative humidity in percentage
 * @param {number} soilMoisture - Average soil moisture percentage (optional)
 * @returns {object} CWSI metrics
 */
export const calculateCWSI = (temp, humidity, soilMoisture = null) => {
    if (temp == null || humidity == null) {
        return {
            value: null,
            level: 'unknown',
            message: 'Insufficient data'
        };
    }

    // Calculate VPD-based stress approximation
    const vpd = calculateVPD(temp, humidity);

    // Normalize VPD to 0-1 scale (0-3 kPa range)
    let cwsi = Math.min(1, Math.max(0, vpd / 3));

    // Adjust based on soil moisture if available
    if (soilMoisture !== null) {
        // Low soil moisture increases stress
        const moistureFactor = soilMoisture < 40 ? 0.2 : soilMoisture < 60 ? 0.1 : 0;
        cwsi = Math.min(1, cwsi + moistureFactor);
    }

    // Determine stress level
    let level, message;
    if (cwsi < 0.2) {
        level = 'none';
        message = 'No water stress - optimal conditions';
    } else if (cwsi < 0.4) {
        level = 'mild';
        message = 'Mild stress - monitor closely';
    } else if (cwsi < 0.6) {
        level = 'moderate';
        message = 'Moderate stress - consider irrigation';
    } else if (cwsi < 0.8) {
        level = 'high';
        message = 'High stress - irrigation recommended';
    } else {
        level = 'severe';
        message = 'Severe stress - immediate irrigation needed';
    }

    return {
        value: Math.round(cwsi * 100) / 100,
        level,
        message,
        vpd
    };
};

/**
 * Get CWSI color based on stress level
 */
export const getCWSIColor = (level) => {
    const colors = {
        none: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        mild: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
        moderate: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
        high: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
        severe: { text: 'text-red-400', bg: 'bg-red-500/20' },
        unknown: { text: 'text-gray-400', bg: 'bg-gray-500/20' }
    };
    return colors[level] || colors.unknown;
};

export default { calculateCWSI, calculateVPD, getCWSIColor };
