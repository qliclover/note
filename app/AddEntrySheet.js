'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { colorForIndex } from './categoryColor'
import { activeShadow } from './tabStyle'

const AddEntryContext = createContext(null);

export function useAddEntry() {
    return useContext(AddEntryContext);
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

export function AddEntryProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [note, setNote] = useState('');

    function openAddEntry() {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setNote('');
        setOpen(true);
        fetch('/api/categories')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data) return;
                setCategories(data.categories);
                setCategoryId((prev) => prev || (data.categories[0] ? String(data.categories[0].id) : ''));
            });
    }

    function closeAddEntry() {
        setOpen(false);
    }

    function press(k) {
        setAmount((a) => {
            if (k === '⌫') return a.slice(0, -1);
            if (k === '.' && a.includes('.')) return a;
            if (a.replace('.', '').length >= 8) return a;
            return a + k;
        });
    }

    async function save() {
        const amt = parseFloat(amount);
        if (!amt || amt <= 0) return;
        await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amt, type, note, categoryId: type === 'income' ? '' : categoryId }),
        });
        setOpen(false);
        window.location.reload();
    }

    const shownCategories = categories.filter((c) => c.type === type);

    return (
        <AddEntryContext.Provider value={{ openAddEntry, closeAddEntry }}>
            {children}
            {open && (
                <div className="fixed inset-0 z-50" style={{ maxWidth: '448px', margin: '0 auto' }}>
                    <div className="absolute inset-0" style={{ background: 'rgba(26,26,26,.28)' }} onClick={closeAddEntry} />
                    <div className="absolute left-0 right-0 bottom-0" style={{ background: '#f4f2ee', borderRadius: '24px 24px 0 0', padding: '14px 26px 30px' }}>
                        <div style={{ width: '40px', height: '5px', borderRadius: '5px', background: '#d9d6cf', margin: '0 auto 16px' }} />
                        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
                            <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '30px' }}>New entry</div>
                            <button onClick={closeAddEntry} style={{ fontSize: '24px', color: '#a3a09a' }}>×</button>
                        </div>

                        <div className="flex" style={{ gap: '26px', marginBottom: '22px', borderBottom: '1px solid #e2dfd8' }}>
                            <button onClick={() => setType('expense')} style={{ fontSize: '16px', paddingBottom: '10px', textShadow: activeShadow(type === 'expense'), borderBottom: type === 'expense' ? '2px solid #1a1a1a' : '2px solid transparent', color: type === 'expense' ? '#1a1a1a' : '#a3a09a' }}>Expense</button>
                            <button onClick={() => setType('income')} style={{ fontSize: '16px', paddingBottom: '10px', textShadow: activeShadow(type === 'income'), borderBottom: type === 'income' ? '2px solid #1a1a1a' : '2px solid transparent', color: type === 'income' ? '#1a1a1a' : '#a3a09a' }}>Income</button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                            <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '66px', letterSpacing: '-1px', color: amount ? '#1a1a1a' : '#c9c5bc' }}>
                                $<span style={{ color: amount ? '#1a1a1a' : '#c9c5bc' }}>{amount || '0'}</span>
                            </span>
                        </div>

                        {type === 'expense' && (
                            <div className="flex overflow-x-auto" style={{ gap: '20px', marginBottom: '18px', paddingBottom: '2px', borderBottom: '1px solid #e2dfd8', fontSize: '14px' }}>
                                {shownCategories.map((c, i) => (
                                    <button key={c.id} onClick={() => setCategoryId(String(c.id))} className="flex items-center flex-none"
                                        style={{ gap: '7px', paddingBottom: '12px', textShadow: activeShadow(categoryId === String(c.id)), borderBottom: categoryId === String(c.id) ? '2px solid #1a1a1a' : '2px solid transparent', color: categoryId === String(c.id) ? '#1a1a1a' : '#a3a09a', whiteSpace: 'nowrap' }}>
                                        <span className="dot" style={{ background: colorForIndex(i) }} />{c.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <input type="text" placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)}
                            style={{ display: 'block', width: '100%', border: 'none', borderBottom: '1px solid #d9d6cf', padding: '11px 0', fontSize: '16px', marginBottom: '18px', background: 'transparent', outline: 'none' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '18px' }}>
                            {KEYS.map((k) => (
                                <button key={k} onClick={() => press(k)}
                                    style={{ fontFamily: 'var(--font-serif), serif', height: '52px', borderRadius: '12px', background: '#ece9e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                                    {k}
                                </button>
                            ))}
                        </div>

                        <button onClick={save} className="btn w-full" style={{ background: '#1a1a1a', color: '#faf9f7' }}>Save entry</button>
                    </div>
                </div>
            )}
        </AddEntryContext.Provider>
    );
}
