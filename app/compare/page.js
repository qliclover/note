'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/app/Nav'

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
    const prev = new Date(now.getFullYear(),now.getMonth() - 1, 1);
    const prevMonth = prev.toISOString().slice(0,7);

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

    const thisTotal = Object.values(thisCat).reduce((s,v) => s + v, 0);
    const prevTotal = Object.values(prevCat).reduce((s, v) => s + v, 0);
    const diff = thisTotal - prevTotal;

    // all categories in two months
    const allCats = [...new Set([...Object.keys(thisCat), ...Object.keys(prevCat)])];
    const rows = allCats
        .map((name) => ({name, delta: (thisCat[name] || 0) - (prevCat[name] || 0)}))
        .sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));

    return (
        <div className='max-w-md mx-auto p-6 pb-24'>
        <div className='flex justify-between items-baseline mb-1'>
            <p className='text-xs uppercase tracking-widest text-neutral-500'>{prevMonth} → {thisMonth}</p>
            <Link href='/dashboard' className='text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900'>Home</Link>
        </div>
        <h1 className='font-serif text-4xl mb-8'>Compared</h1>

        <div className='border-b border-neutral-300 pb-6 mb-6'>
            <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>You spent this month</p>
            <p className='font-serif text-4xl'>${thisTotal}</p>
            <p className={`text-sm mt-2 ${diff <= 0 ? 'text-[#5f7a5f]' : 'text-[#a3492f]'}`}>
            {diff <= 0 ? '↓' : '↑'} ${Math.abs(diff)} {diff <= 0 ? 'less' : 'more'} than {prevMonth}
            </p>
        </div>

        <p className='text-xs uppercase tracking-widest text-neutral-500 mb-3'>By category</p>
        <div className='flex flex-col'>
            {rows.map((r) => (
            <div key={r.name} className='flex justify-between border-b border-neutral-200 py-3'>
                <span>{r.name}</span>
                <span className={`font-serif ${r.delta <= 0 ? 'text-[#5f7a5f]' : 'text-[#a3492f]'}`}>
                {r.delta <= 0 ? '↓' : '↑'} ${Math.abs(r.delta)}
                </span>
            </div>
            ))}
            {rows.length === 0 && <p className='text-neutral-500 text-sm'>No data to compare.</p>}
        </div>
        <Nav />
        </div>
    );

}