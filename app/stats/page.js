'use client'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Nav from '@/app/Nav'

const COLORS = ['#a3492f', '#b08968', '#8a9a5b', '#5f7a5f', '#7d6b7d', '#9c8b6e'];

export default function StatsPage() {
    const [transactions, setTransactions] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/transactions')
            .then((res)=>{
                if (res.status === 401) {router.push('/login'); return null;}
                return res.json();
            })
            .then((data)=>{if (data) setTransactions(data.transactions);});
    },[router]);

    // order by total
    const month = new Date().toISOString().slice(0, 7);
    // 只算本月的支出
    const monthExpenses = transactions.filter(t => t.type === 'expense' && t.date.slice(0, 7) === month);
    const spent = monthExpenses.reduce((s, t) => s + t.amount, 0);
    const byCat = {};
    monthExpenses.forEach(t => {
        const key = t.category ? t.category.name: 'Uncategorized';
        byCat[key] = (byCat[key] || 0) + t.amount;
    });
    const cats = Object.entries(byCat)
        .map(([name, value]) => ({name, value}))
        .sort((a, b) => b.value - a.value);
    
        return (
            <div className="max-w-md mx-auto px-5 pt-5 pb-24">
                <div className="flex justify-between items-baseline mb-1">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">{month}</p>
                    <Link href='/dashboard' className="text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900">
                    Home</Link>
                </div>
                <h1 className="font-serif text-4xl mb-4">Statistics</h1>
                <div className="flex justify-between items-baseline border-b border-neutral-300 pb-4 mb-4">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">Spent this month</p>
                    <p className="font-serif text-3xl">${spent}</p>
                </div>

                <div className="flex flex-col gap-4">
                    {cats.map((c, i) => {
                        const percent = spent ? Math.round((c.value / spent) * 100) : 0;
                        return (
                            <div key={c.name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                                        {c.name} <span className="text-neutral-400">{percent}%</span>
                                    </span>
                                    <span className="font-serif">${c.value}</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length]}}></div>
                                </div>
                            </div>
                        )
                    })}
                    {cats.length === 0 && <p className="text-neutral-500 text-sm">No expenses this month.</p>}
                </div>
            <Nav />
            </div>
        )
}