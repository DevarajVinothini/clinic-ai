/**
 * Risk Prediction Service — ML no-show prediction logic
 * Moved from ml/noShowPredictor.js
 */

// Logistic regression weights (pre-trained)
const WEIGHTS = {
    bias: -1.2,
    previousNoShows: 0.85,
    noShowRate: 1.5,
    dayOfWeek_monday: 0.15,
    dayOfWeek_friday: 0.25,
    hourOfDay_early: 0.3,
    hourOfDay_late: 0.2,
    age_young: 0.2,
    age_senior: 0.15,
    daysUntilAppointment: 0.02,
    hasHistory: -0.5,
};

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

const RiskPredictionService = {
    /**
     * Predict no-show probability
     * @param {Object} features - Patient & appointment features
     * @returns {number} Risk score between 0 and 1
     */
    predictNoShow(features) {
        const {
            previousNoShows = 0,
            previousAppointments = 0,
            dayOfWeek = 0,
            hourOfDay = 9,
            age = 40,
            daysUntilAppointment = 7,
        } = features;

        const noShowRate = previousAppointments > 0
            ? previousNoShows / previousAppointments
            : 0;

        let score = WEIGHTS.bias;
        score += WEIGHTS.previousNoShows * Math.min(previousNoShows, 5) / 5;
        score += WEIGHTS.noShowRate * noShowRate;

        if (dayOfWeek === 1) score += WEIGHTS.dayOfWeek_monday;
        if (dayOfWeek === 5) score += WEIGHTS.dayOfWeek_friday;

        if (hourOfDay < 9) score += WEIGHTS.hourOfDay_early;
        if (hourOfDay > 16) score += WEIGHTS.hourOfDay_late;

        if (age < 30) score += WEIGHTS.age_young;
        if (age > 65) score += WEIGHTS.age_senior;

        score += WEIGHTS.daysUntilAppointment * Math.min(daysUntilAppointment, 30) / 30;

        if (previousAppointments > 0) score += WEIGHTS.hasHistory;

        return Math.round(sigmoid(score) * 100) / 100;
    },

    /**
     * Get human-readable risk label
     * @param {number} score - Risk score (0-1)
     * @returns {string} LOW, MEDIUM, or HIGH
     */
    getRiskLabel(score) {
        if (score >= 0.7) return 'HIGH';
        if (score >= 0.4) return 'MEDIUM';
        return 'LOW';
    },
};

module.exports = RiskPredictionService;
