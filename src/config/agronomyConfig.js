/**
 * Sugarcane Growth Stage Configuration
 * Defines moisture thresholds for each growth phase
 */

export const GROWTH_STAGES = {
    GERMINATION: {
        id: 'germination',
        name: 'Germination',
        icon: 'Sprout',
        description: 'Sprouting phase - high moisture required',
        duration: '0-35 days',
        moisture: {
            min: 70,
            max: 90,
            optimal: 80
        }
    },
    TILLERING: {
        id: 'tillering',
        name: 'Tillering',
        icon: 'TreeDeciduous',
        description: 'Active root & shoot development',
        duration: '35-100 days',
        moisture: {
            min: 65,
            max: 85,
            optimal: 75
        }
    },
    GRAND_GROWTH: {
        id: 'grand_growth',
        name: 'Grand Growth',
        icon: 'TrendingUp',
        description: 'Maximum cane elongation phase',
        duration: '100-270 days',
        moisture: {
            min: 60,
            max: 80,
            optimal: 70
        }
    },
    MATURITY: {
        id: 'maturity',
        name: 'Maturity',
        icon: 'Wheat',
        description: 'Ripening - reduced water for sugar concentration',
        duration: '270-360 days',
        moisture: {
            min: 50,
            max: 70,
            optimal: 60
        }
    }
};

export const SENSOR_DEPTHS = {
    SURFACE: {
        depth: 15,
        label: 'Surface',
        description: '15cm - Top soil moisture'
    },
    MID: {
        depth: 30,
        label: 'Mid Zone',
        description: '30cm - Middle soil layer'
    },
    ROOT: {
        depth: 45,
        label: 'Root Zone',
        description: '45cm - Deep root moisture'
    }
};

/**
 * Get moisture status based on current reading and growth stage
 */
export const getMoistureStatus = (value, stage) => {
    const thresholds = GROWTH_STAGES[stage]?.moisture || GROWTH_STAGES.GERMINATION.moisture;

    if (value < thresholds.min) {
        return {
            status: 'low',
            label: 'Low',
            color: 'danger',
            message: 'Irrigation recommended'
        };
    } else if (value > thresholds.max) {
        return {
            status: 'high',
            label: 'High',
            color: 'warning',
            message: 'Risk of waterlogging'
        };
    } else {
        return {
            status: 'optimal',
            label: 'Optimal',
            color: 'success',
            message: 'Moisture level ideal'
        };
    }
};

export default GROWTH_STAGES;
