export const CURRENCIES = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
];

export function symbolFor(code) {
    return CURRENCIES.find((c) => c.code === code)?.symbol || '$';
}
