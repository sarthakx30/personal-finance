// Dynamic categories fetched from Google Sheets
// These serve as fallbacks for new users or when a sheet isn't loaded
export const EXPENSE_CATEGORIES = [];

// Fixed income categories
export const INCOME_CATEGORIES = [];

// Default budget bucket configuration
// Users can customize this via the Bucket Editor, which saves to Google Drive
export const BUCKET_CONFIG = {
    'Need': {
        categories: [],
        color: '#ef4444', // Red
        threshold_percent: 0.55,
        red_marking: 'OVER',
    },
    'Want': {
        categories: [],
        color: '#f59e0b', // Amber/Orange
        threshold_percent: 0.30,
        red_marking: 'OVER',
    },
    'Save': {
        categories: [],
        color: '#10b981', // Green
        threshold_percent: 0.20,
        red_marking: 'UNDER',
    },
    'Other': {
        categories: [],
        color: '#6366f1', // Indigo
        threshold_percent: 0.05,
        red_marking: 'OVER',
    },
};

/**
 * Categorize expense by bucket name
 * @param {string} categoryName - The category name to look up
 * @param {object} [bucketConfig] - Optional custom bucket configuration
 * @returns {string} The bucket name (Need, Want, Save, Other)
 */
export const getCategoryBucket = (categoryName, bucketConfig = BUCKET_CONFIG) => {
    if (!categoryName) return 'Other';
    const normalizedName = categoryName.toLowerCase().trim();

    for (const [bucketName, bucketData] of Object.entries(bucketConfig)) {
        if (bucketData.categories && bucketData.categories.some(cat => cat.toLowerCase() === normalizedName)) {
            return bucketName;
        }
    }

    return 'Other'; // Default to Other if not found
};

/**
 * Group categories by bucket and calculate totals
 * @param {object} categoryBreakdown - Object with category names as keys and amounts as values
 * @param {object} [bucketConfig] - Optional custom bucket configuration
 * @returns {object} Object with bucket names as keys and {amount, categories} as values
 */
export const groupCategoriesByBucket = (categoryBreakdown, bucketConfig = BUCKET_CONFIG) => {
    const bucketTotals = {};

    // Initialize buckets
    Object.keys(bucketConfig).forEach(bucketName => {
        bucketTotals[bucketName] = {
            amount: 0,
            categories: [],
        };
    });

    // Group categories by bucket
    Object.entries(categoryBreakdown).forEach(([categoryName, amount]) => {
        const bucketName = getCategoryBucket(categoryName, bucketConfig);
        // Ensure bucket exists (in case config changed but defaults didn't update somewhere else)
        if (bucketTotals[bucketName]) {
            bucketTotals[bucketName].amount += amount;
            bucketTotals[bucketName].categories.push({
                name: categoryName,
                amount,
            });
        } else {
             // Fallback if bucket not found in config (should go to 'Other' usually)
             if (!bucketTotals['Other']) {
                 bucketTotals['Other'] = { amount: 0, categories: [] };
             }
             bucketTotals['Other'].amount += amount;
             bucketTotals['Other'].categories.push({ name: categoryName, amount });
        }
    });

    return bucketTotals;
};