'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Nav from '../Nav'

export default function RecurringPage() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [nextDate, setNextDate] = useState('');
    const router = useRouter();

    async function load() {
        const res = await fetch('/api/recurring');
        if (res.status === 401) {router.push('/login'); return;}
        const data = await res.json();
        setItems(data.recurrings);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { load(); }, []);

    async function handleAdd(e) {
        e.preventDefault();
        if (!name || !amount) return;
        await fetch('/api/recurring', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, amount, nextDate }),
        });
        setName(''); setAmount(''); setNextDate('');
        load();
    }

    const monthlyTotal = items.filter(r => r.cycle === 'monthly').reduce((s, r) => s + r.amount, 0);

    return (
        <div className='max-w-md mx-auto p-6 pb-24'>
        <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>Automatic</p>
        <h1 className='font-serif text-4xl mb-6'>Recurring</h1>

        <div className='border-b border-neutral-300 pb-6 mb-6'>
            <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>Monthly commitments</p>
            <p className='font-serif text-4xl'>${monthlyTotal.toFixed(2)}<span className='text-base text-neutral-400'>/mo</span></p>
        </div>

        <div className='flex flex-col mb-8'>
            {items.map((r) => (
            <div key={r.id} className='flex justify-between items-center border-b border-neutral-200 py-3'>
                <div>
                <p>{r.name}</p>
                <p className='text-xs uppercase tracking-wide text-neutral-400'>{r.cycle}{r.nextDate ? ' · next ' + r.nextDate : ''}</p>
                </div>
                <span className='font-serif text-lg text-[#a3492f]'>-${r.amount}</span>
            </div>
            ))}
            {items.length === 0 && <p className='text-neutral-500 text-sm'>No recurring items.</p>}
        </div>

        <form onSubmit={handleAdd} className='flex flex-col gap-3 border-t border-neutral-300 pt-6'>
            <input type='text' placeholder='Name (Rent, Netflix...)' value={name} onChange={(e) => setName(e.target.value)}
            className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900' />
            <div className='flex gap-3'>
            <input type='number' placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)}
                className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900' />
            <input type='date' value={nextDate} onChange={(e) => setNextDate(e.target.value)}
                className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900' />
            </div>
            <button type='submit' className='bg-neutral-900 text-white rounded-full py-3 mt-2'>+ Add recurring</button>
        </form>

        <Nav />
        </div>
    );
}