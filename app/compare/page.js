'use client'
import { useEffect } from 'react'
import Nav from '@/app/Nav'
import SubTabs, { INSIGHTS_TABS } from '@/app/SubTabs'
import { useData } from '@/app/DataContext'
import { currentPeriod, previousPeriod, inPeriod } from '@/app/period'

export default function ComparePage() {
    const { transactions, symbol, monthStartDay, ensureLoaded } = useData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { ensureLoaded(); }, []);

    const thisPeriod = currentPeriod(monthStartDay);
    const prevPeriod = previousPeriod(monthStartDay);
    const monthShort = (d) => d.toLocaleDateString('en-US', { month: 'short' });

    function expenseByCat(period) {
        const map = {};
        transactions
            .filter((t) => t.type === 'expense' && inPeriod(t.date, period))
            .forEach((t) => {
                const key = t.category ? t.category.name : 'Uncategorized';
                map[key] = (map[key] || 0) + t.amount;
            });
        return map;
    }
    const thisCat = expenseByCat(thisPeriod);
    const prevCat = expenseByCat(prevPeriod);

    const thisTotal = Object.values(thisCat).reduce((s, v) => s + v, 0);
    const prevTotal = Object.values(prevCat).reduce((s, v) => s + v, 0);
    const diff = thisTotal - prevTotal;

    const allCats = [...new Set([...Object.keys(thisCat), ...Object.keys(prevCat)])];
    const rows = allCats
        .map((name) => ({ name, delta: (thisCat[name] || 0) - (prevCat[name] || 0) }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div>
                <div className='lbl'>{monthShort(prevPeriod.start)} → {monthShort(thisPeriod.start)} {thisPeriod.start.getFullYear()}</div>
                <div className='h1'>Compared</div>
            </div>

            <SubTabs tabs={INSIGHTS_TABS} />

            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '18px' }}>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '2px' }}>You spent</div>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '52px', letterSpacing: '-1px', lineHeight: 1 }}>
                    {symbol}{Math.trunc(thisTotal)}<span style={{ color: 'var(--muted)' }}>.{(thisTotal % 1).toFixed(2).slice(2)}</span>
                </div>
                <div style={{ fontSize: '14px', color: diff <= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '6px' }}>
                    {diff <= 0 ? '↓' : '↑'} {symbol}{Math.abs(diff).toLocaleString('en-US')} {diff <= 0 ? 'less' : 'more'} than {monthShort(prevPeriod.start)}
                </div>
            </div>

            <div>
                <div className='lbl' style={{ marginBottom: '6px' }}>By category</div>
                {rows.map((r) => (
                    <div key={r.name} className='row'>
                        <span>{r.name}</span>
                        <span style={{ color: r.delta <= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {r.delta <= 0 ? '↓' : '↑'} {symbol}{Math.abs(r.delta).toLocaleString('en-US')}
                        </span>
                    </div>
                ))}
                {rows.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No data to compare.</p>}
            </div>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    );
}
