'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import SubTabs, { INSIGHTS_TABS } from '@/app/SubTabs'

export default function ComparePage() {
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/transactions')
            .then((res) => {if (res.status === 401) {
                router.push('/login'); return null;
            } return res.json();})
            .then((data) => {if (data) setTransactions(data.transactions);});
    }, [router]);

    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prev.toISOString().slice(0, 7);
    const monthShort = (ym) => new Date(ym + '-02').toLocaleDateString('en-US', { month: 'short' });

    function expenseByCat(ym) {
        const map = {};
        transactions
            .filter((t) => t.type === 'expense' && t.date.slice(0, 7) === ym)
            .forEach((t) => {
                const key = t.category ? t.category.name : 'Uncategorized';
                map[key] = (map[key] || 0) + t.amount;
            });
        return map;
    }
    const thisCat = expenseByCat(thisMonth);
    const prevCat = expenseByCat(prevMonth);

    const thisTotal = Object.values(thisCat).reduce((s, v) => s + v, 0);
    const prevTotal = Object.values(prevCat).reduce((s, v) => s + v, 0);
    const diff = thisTotal - prevTotal;

    const allCats = [...new Set([...Object.keys(thisCat), ...Object.keys(prevCat)])];
    const rows = allCats
        .map((name) => ({ name, delta: (thisCat[name] || 0) - (prevCat[name] || 0) }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

    return (
        <div className='max-w-md mx-auto' style={{ padding: '62px 26px 24px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div>
                <div className='lbl'>{monthShort(prevMonth)} → {monthShort(thisMonth)} {now.getFullYear()}</div>
                <div className='h1'>Compared</div>
            </div>

            <SubTabs tabs={INSIGHTS_TABS} />

            <div style={{ borderBottom: '1px solid #e6e4df', paddingBottom: '18px' }}>
                <div style={{ fontSize: '13px', color: '#9a9791', marginBottom: '2px' }}>You spent</div>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '52px', letterSpacing: '-1px', lineHeight: 1 }}>
                    ${Math.trunc(thisTotal)}<span style={{ color: '#8a8783' }}>.{(thisTotal % 1).toFixed(2).slice(2)}</span>
                </div>
                <div style={{ fontSize: '14px', color: diff <= 0 ? '#2f6b52' : '#c15b4a', marginTop: '6px' }}>
                    {diff <= 0 ? '↓' : '↑'} ${Math.abs(diff).toLocaleString('en-US')} {diff <= 0 ? 'less' : 'more'} than {monthShort(prevMonth)}
                </div>
            </div>

            <div>
                <div className='lbl' style={{ marginBottom: '6px' }}>By category</div>
                {rows.map((r) => (
                    <div key={r.name} className='row'>
                        <span>{r.name}</span>
                        <span style={{ color: r.delta <= 0 ? '#2f6b52' : '#c15b4a' }}>
                            {r.delta <= 0 ? '↓' : '↑'} ${Math.abs(r.delta).toLocaleString('en-US')}
                        </span>
                    </div>
                ))}
                {rows.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px' }}>No data to compare.</p>}
            </div>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    );
}
