'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Nav from '@/app/Nav'
import SubTabs, { INSIGHTS_TABS } from '@/app/SubTabs'
import { categoryColor } from '@/app/categoryColor'

const FILTERS = [
    { id: 'expense', label: 'Expense' },
    { id: 'income', label: 'Income' },
    { id: 'thisMonth', label: 'This month' },
    { id: 'over50', label: '> $50' },
];

export default function SearchPage() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [query, setQuery] = useState('');
    const [active, setActive] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/transactions')
            .then((res) => { if (res.status === 401) { router.push('/login'); return null; } return res.json(); })
            .then((data) => { if (data) setTransactions(data.transactions); });
        fetch('/api/categories')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => { if (data) setCategories(data.categories); });
    }, [router]);

    function toggle(id) {
        setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
    }

    const q = query.trim().toLowerCase();
    const month = new Date().toISOString().slice(0, 7);
    const results = transactions.filter((t) => {
        if (active.includes('expense') && t.type !== 'expense') return false;
        if (active.includes('income') && t.type !== 'income') return false;
        if (active.includes('thisMonth') && t.date.slice(0, 7) !== month) return false;
        if (active.includes('over50') && t.amount <= 50) return false;
        if (!q) return true;
        const hay = `${t.note || ''} ${t.category ? t.category.name : ''}`.toLowerCase();
        return hay.includes(q);
    });
    const total = results.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="max-w-md mx-auto" style={{ padding: '62px 26px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '40px' }}>Search</div>

            <SubTabs tabs={INSIGHTS_TABS} />

            <input type="text" placeholder="coffee, salary…" value={query} onChange={(e) => setQuery(e.target.value)}
                style={{ borderBottom: '1px solid #d9d6cf', padding: '10px 0', fontSize: '17px', background: 'transparent', outline: 'none', width: '100%' }} />

            <div className="flex flex-wrap" style={{ gap: '10px' }}>
                {FILTERS.map((f) => (
                    <button key={f.id} onClick={() => toggle(f.id)}
                        style={{
                            fontSize: '13px', padding: '7px 13px', borderRadius: '2px',
                            border: active.includes(f.id) ? '1px solid #1a1a1a' : '1px solid #e0ddd5',
                            color: active.includes(f.id) ? '#1a1a1a' : '#a3a09a',
                        }}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div style={{ borderTop: '1px solid #e6e4df', paddingTop: '4px' }}>
                <div className="lbl" style={{ margin: '8px 0' }}>{results.length} results · ${total.toLocaleString('en-US')}</div>
                {results.map((t) => (
                    <Link key={t.id} href={`/transaction/${t.id}`} className="row">
                        <div className="flex items-center" style={{ gap: '11px' }}>
                            <span className="dot" style={{ background: t.type === 'income' ? '#6f7a4e' : categoryColor(t.category, categories) }} />
                            <div>
                                <div style={{ fontSize: '16px' }}>{t.note || 'Untitled'}</div>
                                <div style={{ fontSize: '12px', color: '#a3a09a' }}>
                                    {t.category ? t.category.name : (t.type === 'income' ? 'Income' : 'Uncategorized')} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '20px' }}>
                            {t.type === 'income' ? '+' : '−'}${t.amount.toLocaleString('en-US')}
                        </div>
                    </Link>
                ))}
                {results.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px', padding: '14px 0' }}>No results.</p>}
            </div>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    )
}
