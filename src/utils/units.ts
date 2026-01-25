export const convertWeight = (kg: string | number, system: 'metric' | 'imperial'): string => {
    const val = typeof kg === 'string' ? parseFloat(kg) : kg;
    if (!val || isNaN(val)) return '';

    if (system === 'metric') {
        return `${Math.round(val)} kg`;
    } else {
        // 1 kg = 2.20462 lbs
        const lbs = val * 2.20462;
        return `${Math.round(lbs)} Ibs`;
    }
};

export const convertHeight = (cm: string | number, system: 'metric' | 'imperial'): string => {
    const val = typeof cm === 'string' ? parseFloat(cm) : cm;
    if (!val || isNaN(val)) return '';

    if (system === 'metric') {
        return `${Math.round(val)} cm`;
    } else {
        // 1 cm = 0.0328084 ft
        const totalInches = val * 0.393701;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}' ${inches}"`;
    }
};

// Helper to convert inputs back to Metric for storage
export const toMetricWeight = (val: string, system: 'metric' | 'imperial'): string => {
    const num = parseFloat(val);
    if (!num || isNaN(num)) return '';
    if (system === 'metric') return num.toString();
    return (num / 2.20462).toFixed(1);
};

export const toMetricHeight = (val: string, system: 'metric' | 'imperial'): string => {
    const num = parseFloat(val);
    if (!num || isNaN(num)) return '';
    if (system === 'metric') return num.toString();
    return (num / 0.393701).toFixed(1); // inches to cm
};

export const getDisplayValue = (val: string | number, type: 'weight' | 'height', system: 'metric' | 'imperial'): string => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (!num || isNaN(num)) return '';

    if (system === 'metric') return Math.round(num).toString();

    if (type === 'weight') {
        // kg to lbs
        return Math.round(num * 2.20462).toString();
    } else {
        // cm to total inches for simple input
        return Math.round(num * 0.393701).toString();
    }
};
