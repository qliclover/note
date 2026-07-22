'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Nav from '@/app/Nav'
import { categoryColor } from '@/app/categoryColor'

export default function StatsPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/transactions')
            .then((res) => { if (res.status === 401) { router.push('/login'); return null; } return res.json(); })
            .then((data) => { if (data) setTransactions(data.transactions); });
        fetch('/api/categories')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => { if (data) setCategories(data.categories); });
    }, [router]);

    const month = new Date().toISOString().slice(0, 7);
    const monthLabel = new Date(month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.slice(0, 7) === month);
    const spent = monthExpenses.reduce((s, t) => s + t.amount, 0);

    const byCat = {};
    monthExpenses.forEach(t => {
        const key = t.category ? t.category.name : 'Uncategorized';
        byCat[key] = (byCat[key] || 0) + t.amount;
    });
    const cats = Object.entries(byCat)
        .map(([name, value]) => ({ name, value, color: categoryColor(monthExpenses.find(t => (t.category ? t.category.name : 'Uncategorized') === name)?.category, categories) }))
        .sort((a, b) => b.value - a.value);

    // last 7 days (incl. today), expense totals
    const days = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return d;
    });
    const dayTotals = days.map(d => transactions
        .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === d.toDateString())
        .reduce((s, t) => s + t.amount, 0));
    const maxDay = Math.max(1, ...dayTotals);
    const avgDay = dayTotals.reduce((s, v) => s + v, 0) / 7;

    return (
        <div className="max-w-md mx-auto" style={{ padding: '62px 26px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
                <div className="lbl">{monthLabel}</div>
                <div className="h1">Statistics</div>
            </div>

            <div style={{ borderTop: '1px solid #e6e4df', paddingTop: '20px' }}>
                <div className="flex items-baseline justify-between" style={{ marginBottom: '22px' }}>
                    <div className="lbl">Spent this month</div>
                    <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '34px' }}>${spent.toLocaleString('en-US')}</div>
                </div>
                <div className="flex flex-col" style={{ gap: '20px' }}>
                    {cats.map((c) => {
                        const percent = spent ? Math.round((c.value / spent) * 100) : 0;
                        return (
                            <div key={c.name}>
                                <div className="flex items-center justify-between" style={{ marginBottom: '7px' }}>
                                    <div className="flex items-center" style={{ gap: '9px' }}>
                                        <span className="dot" style={{ background: c.color }} />
                                        {c.name} <span style={{ color: '#a3a09a', fontSize: '12px', marginLeft: '4px' }}>{percent}%</span>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '19px' }}>${c.value.toLocaleString('en-US')}</div>
                                </div>
                                <div style={{ height: '4px', borderRadius: '4px', background: '#eeece7' }}>
                                    <div style={{ height: '100%', width: `${percent}%`, background: c.color, borderRadius: '4px' }} />
                                </div>
                            </div>
                        );
                    })}
                    {cats.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px' }}>No expenses this month.</p>}
                </div>
            </div>

            <div style={{ borderTop: '1px solid #e6e4df', paddingTop: '20px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '18px' }}>
                    <div className="lbl">This week</div>
                    <div style={{ fontSize: '13px', color: '#a3a09a' }}>avg ${avgDay.toFixed(0)}/day</div>
                </div>
                <div className="flex items-end" style={{ gap: '12px', height: '80px' }}>
                    {dayTotals.map((v, i) => (
                        <div key={i} style={{ flex: 1, height: `${Math.max(4, Math.round((v / maxDay) * 100))}%`, background: i === 6 ? '#1a1a1a' : '#ddd9cf', borderRadius: '3px 3px 0 0' }} />
                    ))}
                </div>
            </div>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    )
}
