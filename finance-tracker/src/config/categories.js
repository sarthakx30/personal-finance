// Fixed expense categories
export const EXPENSE_CATEGORIES = [
    'Food',
    'Gifts',
    'Health / Medical',
    'Home Supplies / Groceries',
    'Transportation / Uber',
    'Personal',
    'Pets',
    'Travel / Fuel',
    'Debt',
    'Other',
    'Trip',
    'Mom',
    'Saksham Bhaiya',
    'Osheen',
    'Office Outing / Spends',
    'Drinks / Party',
    'Home Bills',
    'Subscription / Phone Bills',
    'Dates',
    'Investment',
    'Mandir',
    'Personal Outing',
    'Credit Card Bill',
    'Family Outing',
    'Cash',
    'Savings',
    'EMI',
];

// Fixed income categories
export const INCOME_CATEGORIES = [
    'Salary',
    'Bonus',
    'Freelance',
    'Investment',
    'Gift',
    'Refund',
    'Other',
];

// Budget bucket configuration for categorizing expenses
export const BUCKET_CONFIG = {
    'Need': {
        categories: [
            'home supplies / groceries',
            'home bills',
            'pets',
            'subscription / phone bills',
            'mandir',
            'emi',
        ],
        color: '#ef4444', // Red
        threshold_percent: 0.55,
        red_marking: 'OVER',
    },
    'Want': {
        categories: [
            'food',
            'gifts',
            'transportation / uber',
            'personal',
            'travel / fuel',
            'trip',
            'office outing / spends',
            'drinks / party',
            'dates',
            'personal outing',
            'family outing',
            'credit card bill',
        ],
        color: '#f59e0b', // Amber/Orange
        threshold_percent: 0.10,
        red_marking: 'OVER',
    },
    'Save': {
        categories: ['investment', 'savings'],
        color: '#10b981', // Green
        threshold_percent: 0.30,
        red_marking: 'UNDER',
    },
    'Other': {
        categories: [
            'health / medical',
            'debt',
            'other',
            'mom',
            'saksham bhaiya',
            'osheen',
            'cash',
        ],
        color: '#6366f1', // Indigo
        threshold_percent: 0.05,
        red_marking: 'OVER',
    },
};

/**
 * Categorize expense by bucket name
 * @param {string} categoryName - The category name to look up
 * @returns {string} The bucket name (Need, Want, Save, Other)
 */
export const getCategoryBucket = (categoryName) => {
    const normalizedName = categoryName.toLowerCase().trim();

    for (const [bucketName, bucketData] of Object.entries(BUCKET_CONFIG)) {
        if (bucketData.categories.some(cat => cat.toLowerCase() === normalizedName)) {
            return bucketName;
        }
    }

    return 'Other'; // Default to Other if not found
};

/**
 * Group categories by bucket and calculate totals
 * @param {object} categoryBreakdown - Object with category names as keys and amounts as values
 * @returns {object} Object with bucket names as keys and {amount, categories} as values
 */
export const groupCategoriesByBucket = (categoryBreakdown) => {
    const bucketTotals = {};

    // Initialize buckets
    Object.keys(BUCKET_CONFIG).forEach(bucketName => {
        bucketTotals[bucketName] = {
            amount: 0,
            categories: [],
        };
    });

    // Group categories by bucket
    Object.entries(categoryBreakdown).forEach(([categoryName, amount]) => {
        const bucketName = getCategoryBucket(categoryName);
        bucketTotals[bucketName].amount += amount;
        bucketTotals[bucketName].categories.push({
            name: categoryName,
            amount,
        });
    });

    return bucketTotals;
};
