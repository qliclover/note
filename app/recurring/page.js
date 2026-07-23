'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Nav from '../Nav'
import SubTabs, { PLANNING_TABS } from '../SubTabs'

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

    async function handleEdit(r) {
        const value = prompt('Amount', r.amount);
        if (value == null || value === '') return;
        await fetch(`/api/recurring/${r.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: value }),
        });
        load();
    }

    async function handleDelete(id) {
        await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
        load();
    }

    function daysUntil(dateStr) {
        if (!dateStr) return null;
        const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
        if (diff < 0) return null;
        if (diff === 0) return 'today';
        if (diff === 1) return 'tomorrow';
        return `in ${diff} days`;
    }

    const monthlyTotal = items.filter(r => r.cycle === 'monthly').reduce((s, r) => s + r.amount, 0);

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <div className='lbl'>Automatic</div>
                <div className='h1'>Recurring</div>
            </div>

            <SubTabs tabs={PLANNING_TABS} />

            <div style={{ borderBottom: '1px solid #e6e4df', paddingBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#9a9791' }}>Monthly commitments</div>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '40px' }}>
                    ${monthlyTotal.toFixed(2)}<span style={{ fontSize: '18px', color: '#a3a09a' }}>/mo</span>
                </div>
            </div>

            <div>
                {items.map((r) => (
                    <div key={r.id} className='row'>
                        <div>
                            <div style={{ fontSize: '16px' }}>{r.name}</div>
                            <div style={{ fontSize: '12px', color: '#a3a09a' }}>{r.cycle}{r.nextDate ? ' · ' + r.nextDate : ''}</div>
                        </div>
                        <div className='flex items-center' style={{ gap: '14px' }}>
                            <button onClick={() => handleEdit(r)} style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '19px' }}>−${r.amount}</div>
                                {daysUntil(r.nextDate) && <div style={{ fontSize: '11px', color: '#a3a09a' }}>{daysUntil(r.nextDate)}</div>}
                            </button>
                            <button onClick={() => handleDelete(r.id)} style={{ fontSize: '18px', color: '#c0bdb5' }}>×</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px' }}>No recurring items.</p>}
            </div>

            <form onSubmit={handleAdd} className='flex flex-col' style={{ gap: '12px', borderTop: '1px solid #e6e4df', paddingTop: '20px' }}>
                <input type='text' placeholder='Name (Rent, Netflix...)' value={name} onChange={(e) => setName(e.target.value)}
                    className='field' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                <div className='flex' style={{ gap: '12px' }}>
                    <input type='number' placeholder='Amount' value={amount} onChange={(e) => setAmount(e.target.value)}
                        className='field flex-1' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                    <input type='date' value={nextDate} onChange={(e) => setNextDate(e.target.value)}
                        className='field flex-1' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                </div>
                <button type='submit' className='btn' style={{ background: '#1a1a1a', color: '#faf9f7', marginTop: '6px' }}>+ Add recurring</button>
            </form>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    );
}
