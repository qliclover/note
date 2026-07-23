'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { colorForIndex } from './categoryColor'
import { activeShadow } from './tabStyle'
import { useData } from './DataContext'
import { receiptSummary } from './receiptSummary'

const AddEntryContext = createContext(null);

export function useAddEntry() {
    return useContext(AddEntryContext);
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

function SmallCameraIcon() {
    return (
        <div style={{ position: 'relative', width: '19px', height: '16px', flex: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '4px', border: '1.2px solid var(--muted)' }} />
            <div style={{ position: 'absolute', top: '-3px', left: '5px', width: '7px', height: '3px', borderRadius: '1px 1px 0 0', border: '1.2px solid var(--muted)', borderBottom: 'none', background: 'var(--sheet-bg)' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '7px', height: '7px', borderRadius: '50%', border: '1.2px solid var(--muted)', transform: 'translate(-50%,-50%)' }} />
        </div>
    );
}

export function AddEntryProvider({ children }) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [note, setNote] = useState('');
    const [scanning, setScanning] = useState(false);
    const [scanError, setScanError] = useState('');
    const { categories, ensureLoaded, refetch } = useData();

    function openAddEntry() {
        setType('expense');
        setAmount('');
        setCategoryId('');
        setNote('');
        setScanError('');
        setOpen(true);
        ensureLoaded();
    }

    async function scanReceipt(e) {
        const file = e.target.files[0];
        e.target.value = '';
        if (!file) return;
        setScanError('');
        setScanning(true);
        try {
            const image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const res = await fetch('/api/receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image }),
            });
            if (!res.ok) throw new Error();
            const { receipt } = await res.json();
            setType('expense');
            setAmount(receipt.total ? String(receipt.total) : '');
            setNote(receiptSummary(receipt));
            const match = categories.find((c) => c.type === 'expense' && c.name.toLowerCase() === (receipt.merchant || '').toLowerCase());
            if (match) setCategoryId(String(match.id));
        } catch {
            setScanError('Could not read that receipt — try again or enter it manually.');
        }
        setScanning(false);
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
        refetch();
    }

    const shownCategories = categories.filter((c) => c.type === type);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (open && !categoryId && shownCategories[0]) setCategoryId(String(shownCategories[0].id));
    }, [open, categoryId, shownCategories]);

    return (
        <AddEntryContext.Provider value={{ openAddEntry, closeAddEntry }}>
            {children}
            {open && (
                <div className="fixed inset-0 z-50" style={{ maxWidth: '448px', margin: '0 auto' }}>
                    <div className="absolute inset-0" style={{ background: 'rgba(26,26,26,.28)' }} onClick={closeAddEntry} />
                    <div className="absolute left-0 right-0 bottom-0" style={{ background: 'var(--sheet-bg)', borderRadius: '24px 24px 0 0', padding: '14px 26px 30px' }}>
                        <div style={{ width: '40px', height: '5px', borderRadius: '5px', background: 'var(--border-2)', margin: '0 auto 16px' }} />
                        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
                            <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '30px' }}>New entry</div>
                            <button onClick={closeAddEntry} style={{ fontSize: '24px', color: 'var(--muted)' }}>×</button>
                        </div>

                        <div className="flex" style={{ gap: '26px', marginBottom: '22px', borderBottom: '1px solid var(--border)' }}>
                            <button onClick={() => setType('expense')} style={{ fontSize: '16px', paddingBottom: '10px', textShadow: activeShadow(type === 'expense'), borderBottom: type === 'expense' ? '2px solid var(--fg)' : '2px solid transparent', color: type === 'expense' ? 'var(--fg)' : 'var(--muted)' }}>Expense</button>
                            <button onClick={() => setType('income')} style={{ fontSize: '16px', paddingBottom: '10px', textShadow: activeShadow(type === 'income'), borderBottom: type === 'income' ? '2px solid var(--fg)' : '2px solid transparent', color: type === 'income' ? 'var(--fg)' : 'var(--muted)' }}>Income</button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '66px', letterSpacing: '-1px', color: amount ? 'var(--fg)' : 'var(--faint)' }}>
                                $<span style={{ color: amount ? 'var(--fg)' : 'var(--faint)' }}>{amount || '0'}</span>
                            </span>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                            <label className="flex items-center justify-center" style={{ gap: '7px', cursor: 'pointer', opacity: scanning ? .5 : 1, display: 'inline-flex' }}>
                                <SmallCameraIcon />
                                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{scanning ? 'Reading receipt…' : 'or scan a receipt'}</span>
                                <input type="file" accept="image/*" capture="environment" onChange={scanReceipt} disabled={scanning} style={{ display: 'none' }} />
                            </label>
                            {scanError && <div style={{ fontSize: '13px', color: 'var(--danger)', marginTop: '8px' }}>{scanError}</div>}
                        </div>

                        {type === 'expense' && (
                            <div className="flex overflow-x-auto" style={{ gap: '20px', marginBottom: '18px', paddingBottom: '2px', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                                {shownCategories.map((c, i) => (
                                    <button key={c.id} onClick={() => setCategoryId(String(c.id))} className="flex items-center flex-none"
                                        style={{ gap: '7px', paddingBottom: '12px', textShadow: activeShadow(categoryId === String(c.id)), borderBottom: categoryId === String(c.id) ? '2px solid var(--fg)' : '2px solid transparent', color: categoryId === String(c.id) ? 'var(--fg)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                                        <span className="dot" style={{ background: colorForIndex(i) }} />{c.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <input type="text" placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)}
                            style={{ display: 'block', width: '100%', border: 'none', borderBottom: '1px solid var(--border-2)', padding: '11px 0', fontSize: '16px', marginBottom: '18px', background: 'transparent', outline: 'none' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '18px' }}>
                            {KEYS.map((k) => (
                                <button key={k} onClick={() => press(k)}
                                    style={{ fontFamily: 'var(--font-serif), serif', height: '52px', borderRadius: '12px', background: 'var(--key-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                                    {k}
                                </button>
                            ))}
                        </div>

                        <button onClick={save} className="btn w-full" style={{ background: 'var(--fg)', color: 'var(--bg)' }}>Save entry</button>
                    </div>
                </div>
            )}
        </AddEntryContext.Provider>
    );
}
