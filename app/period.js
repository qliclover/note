// Computes the current "billing period" for a custom month-start day.
// With startDay=1 this is just the calendar month; e.g. startDay=25 means
// the period from the 25th of one month through the 24th of the next.
export function currentPeriod(startDay = 1, ref = new Date()) {
    let start = new Date(ref.getFullYear(), ref.getMonth(), startDay);
    if (ref.getDate() < startDay) {
        start = new Date(ref.getFullYear(), ref.getMonth() - 1, startDay);
    }
    const end = new Date(start.getFullYear(), start.getMonth() + 1, startDay);
    return { start, end };
}

export function previousPeriod(startDay = 1, ref = new Date()) {
    const { start } = currentPeriod(startDay, ref);
    const prevRef = new Date(start.getFullYear(), start.getMonth() - 1, start.getDate());
    return currentPeriod(startDay, prevRef);
}

export function inPeriod(dateStr, period) {
    const d = new Date(dateStr);
    return d >= period.start && d < period.end;
}

export function periodLabel(period) {
    return period.start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
