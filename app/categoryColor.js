const PALETTE = ['#a5735a', '#6f7a4e', '#5e6b73', '#7a5c66', '#8a6d3c', '#4f6b62'];

export function categoryColor(category, categories) {
    if (!category) return '#8f8b82';
    const idx = categories.findIndex((c) => c.id === category.id);
    return PALETTE[(idx < 0 ? 0 : idx) % PALETTE.length];
}

export function colorForIndex(i) {
    return PALETTE[i % PALETTE.length];
}
