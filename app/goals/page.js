'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import SubTabs, { PLANNING_TABS } from '@/app/SubTabs'
import { useData } from '@/app/DataContext'

export default function GoalsPage() {
    const { symbol } = useData();
    const [goals, setGoals] = useState([]);
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [saved, setSaved] = useState('');
    const router = useRouter();

    async function loadGoals() {
        const res = await fetch('/api/goals');
        if (res.status === 401) { router.push('/login'); return; }
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, target, saved }),
        });
        setName(''); setTarget(''); setSaved('');
        loadGoals();
    }

    async function handleEdit(g) {
        const savedValue = prompt('Saved so far', g.saved);
        if (savedValue == null || savedValue === '') return;
        const targetValue = prompt('Target amount', g.target);
        if (targetValue == null || targetValue === '') return;
        await fetch(`/api/goals/${g.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saved: savedValue, target: targetValue }),
        });
        loadGoals();
    }

    async function handleDelete(id) {
        await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        loadGoals();
    }

    const barColors = ['var(--success)', '#5e6b73', '#a5735a', '#7a5c66'];

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <div className='lbl'>Toward the future</div>
                <div className='h1'>Goals</div>
            </div>

            <SubTabs tabs={PLANNING_TABS} />

            {goals.map((g, i) => {
                const percent = g.target ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
                const color = barColors[i % barColors.length];
                return (
                    <div key={g.id} style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <div className='flex items-baseline justify-between'>
                            <div style={{ fontSize: '17px' }}>{g.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{g.targetDate || 'Ongoing'}</div>
                        </div>
                        <button onClick={() => handleEdit(g)} style={{ display: 'block', textAlign: 'left', fontFamily: 'var(--font-serif), serif', fontSize: '34px', margin: '6px 0 10px' }}>
                            {symbol}{g.saved.toLocaleString('en-US')} <span style={{ fontSize: '18px', color: 'var(--muted)' }}>/ {symbol}{g.target.toLocaleString('en-US')}</span>
                        </button>
                        <div style={{ height: '6px', borderRadius: '6px', background: 'var(--track)' }}>
                            <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: '6px' }} />
                        </div>
                        <div className='flex items-center justify-between' style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{percent}% saved</div>
                            <button onClick={() => handleDelete(g.id)} style={{ fontSize: '12px', color: 'var(--faint)' }}>Remove</button>
                        </div>
                    </div>
                );
            })}
            {goals.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No goals yet.</p>}

            <form onSubmit={handleAdd} className='flex flex-col' style={{ gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <input type='text' placeholder='Goal name' value={name} onChange={(e) => setName(e.target.value)}
                    className='field' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                <div className='flex' style={{ gap: '12px' }}>
                    <input type='number' placeholder='Target' value={target} onChange={(e) => setTarget(e.target.value)}
                        className='field flex-1' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                    <input type='number' placeholder='Saved' value={saved} onChange={(e) => setSaved(e.target.value)}
                        className='field flex-1' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                </div>
                <button type='submit' className='btn' style={{ border: '1px solid var(--fg)', marginTop: '6px' }}>+ New goal</button>
            </form>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    );
}
