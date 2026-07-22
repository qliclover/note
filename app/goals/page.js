'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [saved, setSaved] = useState('');
    const router =useRouter();

    async function loadGoals() {
        const res = await fetch('/api/goals');
        if (res.status === 401) {router.push('/login'); return;}
        const data = await res.json();
        setGoals(data.goals);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { loadGoals(); }, []);

    async function handleAdd(e) {
        e.preventDefault();
        if (!name || !target) return;
        await fetch('/api/goals', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body:JSON.stringify({name,target,saved}),
        });
        setName(''); setTarget(''); setSaved('');
        loadGoals();
    }

    return (
        <div className='max-w-md mx-auto p-6 pb-24'>
        <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>Toward the future</p>
        <h1 className='font-serif text-4xl mb-8'>Goals</h1>

        <div className='flex flex-col gap-6 mb-8'>
            {goals.map((g) => {
            const percent = g.target ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
            return (
                <div key={g.id}>
                <div className='flex justify-between items-baseline mb-1'>
                    <span className='font-serif text-lg'>{g.name}</span>
                    <span className='text-xs uppercase tracking-wide text-neutral-500'>{g.targetDate || 'Ongoing'}</span>
                </div>
                <p className='font-serif text-2xl mb-1'>${g.saved} <span className='text-neutral-400 text-base'>/ ${g.target}</span></p>
                <div className='w-full bg-neutral-200 rounded-full h-1.5'>
                    <div className='h-1.5 rounded-full bg-[#5f7a5f]' style={{ width: `${percent}%` }}></div>
                </div>
                <p className='text-xs text-neutral-500 mt-1'>{percent}%</p>
                </div>
            );
            })}
            {goals.length === 0 && <p className='text-neutral-500 text-sm'>No goals yet.</p>}
        </div>

        {/* new goal */}
        <form onSubmit={handleAdd} className='flex flex-col gap-3 border-t border-neutral-300 pt-6'>
            <input type='text' placeholder='Goal name' value={name} onChange={(e) => setName(e.target.value)}
            className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900' />
            <div className='flex gap-3'>
            <input type='number' placeholder='Target' value={target} onChange={(e) => setTarget(e.target.value)}
                className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900' />
            <input type='number' placeholder='Saved' value={saved} onChange={(e) => setSaved(e.target.value)}
                className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900' />
            </div>
            <button type='submit' className='bg-neutral-900 text-white rounded-full py-3 mt-2'>+ New goal</button>
        </form>

        <Nav />
        </div>
    );
}