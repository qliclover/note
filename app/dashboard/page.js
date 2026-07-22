'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/app/Nav'
import { categoryColor } from '@/app/categoryColor'
import { activeShadow } from '@/app/tabStyle'

function fmtDate(iso) {
    const d = new Date(iso);
    const today = new Date();
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yest)) return 'Yest.';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
    const [filter, setFilter] = useState('all');
    const router = useRouter();

    async function loadTransactions() {
        const res = await fetch('/api/transactions');
        if (res.status === 401) { router.push('/login'); return; }
        const data = await res.json();
        setTransactions(data.transactions);
    }

    async function loadCategories() {
        const res = await fetch('/api/categories');
        if (res.status === 401) { router.push('/login'); return; }
        const data = await res.json();
        setCategories(data.categories);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { loadTransactions(); loadCategories(); }, []);

    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    }

    const monthTx = transactions.filter(t => t.date.slice(0, 7) === month);
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;

    const shown = filter === 'all' ? monthTx : monthTx.filter(t => t.categoryId === Number(filter));
    const monthLabel = new Date(month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div className='flex items-baseline justify-between'>
                <label className='lbl' style={{ position: 'relative' }}>
                    {monthLabel}
                    <input type='month' value={month} onChange={(e) => setMonth(e.target.value)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }} />
                </label>
                <div className='flex items-center' style={{ gap: '18px' }}>
                    <Link href='/search' aria-label='Search' style={{ fontSize: '17px', color: '#6a6a6a' }}>⌕</Link>
                    <Link href='/receipt' style={{ fontSize: '13px', color: '#6a6a6a' }}>Scan</Link>
                    <button onClick={handleLogout} style={{ fontSize: '13px', color: '#6a6a6a' }}>Log out</button>
                </div>
            </div>

            <div>
                <div style={{ fontSize: '13px', color: '#9a9791', marginBottom: '2px' }}>You have</div>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '66px', letterSpacing: '-1px', lineHeight: .95 }}>
                    {balance < 0 ? '−' : ''}${Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: balance % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })}
                </div>
                <div className='flex items-center' style={{ gap: '22px', marginTop: '14px' }}>
                    <div>
                        <div className='lbl' style={{ fontSize: '10px' }}>In</div>
                        <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '24px', marginTop: '1px' }}>${income.toLocaleString('en-US')}</div>
                    </div>
                    <div style={{ width: '1px', height: '34px', background: '#e6e4df' }} />
                    <div>
                        <div className='lbl' style={{ fontSize: '10px' }}>Out</div>
                        <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '24px', marginTop: '1px' }}>${expense.toLocaleString('en-US')}</div>
                    </div>
                </div>
            </div>

            <div className='flex items-center overflow-x-auto' style={{ gap: '18px', borderTop: '1px solid #e6e4df', borderBottom: '1px solid #e6e4df', padding: '12px 0', fontSize: '14px' }}>
                <button onClick={() => setFilter('all')} className='flex-none' style={{ whiteSpace: 'nowrap', textShadow: activeShadow(filter === 'all'), color: filter === 'all' ? '#1a1a1a' : '#a3a09a', borderBottom: filter === 'all' ? '2px solid #1a1a1a' : '2px solid transparent', paddingBottom: '2px' }}>All</button>
                {categories.map((c) => (
                    <button key={c.id} onClick={() => setFilter(String(c.id))} className='flex-none' style={{ whiteSpace: 'nowrap', textShadow: activeShadow(filter === String(c.id)), color: filter === String(c.id) ? '#1a1a1a' : '#a3a09a', borderBottom: filter === String(c.id) ? '2px solid #1a1a1a' : '2px solid transparent', paddingBottom: '2px' }}>{c.name}</button>
                ))}
            </div>

            <div>
                {shown.map((t) => (
                    <Link key={t.id} href={`/transaction/${t.id}`} className='row'>
                        <div className='flex items-center' style={{ gap: '11px' }}>
                            <span className='dot' style={{ background: t.type === 'income' ? '#6f7a4e' : categoryColor(t.category, categories) }} />
                            <div>
                                <div style={{ fontSize: '16px' }}>{t.note || 'Untitled'}</div>
                                <div style={{ fontSize: '12px', color: '#a3a09a' }}>
                                    {t.category ? t.category.name : (t.type === 'income' ? 'Income' : 'Uncategorized')} · {fmtDate(t.date)}
                                </div>
                            </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '21px' }}>
                            {t.type === 'income' ? '+' : '−'}${t.amount.toLocaleString('en-US')}
                        </div>
                    </Link>
                ))}
                {shown.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px', padding: '14px 0' }}>No entries yet.</p>}
            </div>
            <div style={{ height: '96px' }} />
            <Nav />
        </div>
    )
}
