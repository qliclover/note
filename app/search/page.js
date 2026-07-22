'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Nav from '@/app/Nav'

export default function SearchPage() {
    const [transactions, setTransactions] = useState([]);
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const router = useRouter();

    useEffect(() => {
        fetch('/api/transactions')
            .then((res) => {if (res.status === 401) {router.push('/login'); return null;} return res.json();})
            .then((data) => {if (data) setTransactions(data.transactions);});
    },[router]);

    // filter by keyword and type
    const q = query.trim().toLowerCase();
    const results = transactions.filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (!q) return true;
        const hay = `${t.note || ''} ${t.category ? t.category.name : ''}`.toLowerCase();
        return hay.includes(q);
    });
    const total = results.reduce((s, t) => s + t.amount, 0);

    return (
        <div className="max-w-md mx-auto p-6 pb-24">
            <div className="flex justify-between items-baseline mb-6">
                <h1 className="font-serif text-4xl">Search</h1>
                <Link href='/dashboard' className="text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900">Home</Link>
            </div>

            <input type="text" placeholder="coffee, salary..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent border-b border-neutral-300 py-2 w-full mb-4 focus:outline-none focus:border-neutral-900"/>

            <div className="flex gap-2 mb-6 text-xs uppercase tracking-wide">
                {['all', 'expense', 'income'].map((f) => (
                    <button key={f} onClick={() => setTypeFilter(f)} className={`border rounded-full px-3 py-1 ${typeFilter === f ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-500'}`}>
                        {f}
                    </button>
                ))}
            </div>

            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">{results.length} results · ${total}</p>

            <ul className="flex flex-col"> 
                {results.map((t) => (
                    <li key={t.id} className="border-b border-neutral-200 py-3">
                        <Link href={`/transaction/${t.id}`} className='flex justify-between items-center'>
                            <div className='flex items-center gap-3'>
                                <span className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-[#5f7a5f]' : 'bg-[#a3492f]'}`}></span>
                                <div>
                                <p>{t.note || 'Untitled'}</p>
                                <p className='text-xs uppercase tracking-wide text-neutral-400'>{t.category ? t.category.name : 'Uncategorized'} · {new Date(t.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <span className={`font-serif ${t.type === 'income' ? 'text-[#5f7a5f]' : 'text-[#a3492f]'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
            <Nav />
        </div>
    )
}
