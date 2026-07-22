'use client'
import { useState } from "react"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { activeShadow } from "@/app/tabStyle"
import { useData } from "@/app/DataContext"

export default function EditEntry() {
    const {id} = useParams();
    const router = useRouter();
    const { categories, ensureLoaded, refetch } = useData();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [note, setNote] = useState('');
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        fetch(`/api/transactions/${id}`)
            .then((res) => {if (res.status === 401) {router.push('/login'); return null;} return res.json();})
            .then((data) => {
                if (data && data.transaction) {
                    const t = data.transaction;
                    setAmount(String(t.amount));
                    setType(t.type);
                    setNote(t.note || '');
                    setCategoryId(t.categoryId ? String(t.categoryId) : '');
                }
            });
        ensureLoaded();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, router]);

    async function handleSave(e) {
        e.preventDefault();
        await fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({amount, type, note, categoryId}),
        });
        refetch();
        router.push(`/transaction/${id}`);
    }

    return (
        <div className="max-w-md mx-auto" style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div className="flex items-center justify-between">
                <Link href={`/transaction/${id}`} style={{ fontSize: '15px', color: '#6a6a6a' }}>Cancel</Link>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '24px' }}>Edit</div>
                <button onClick={handleSave} style={{ fontSize: '15px', fontWeight: 600 }}>Save</button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col" style={{ gap: '22px' }}>
                <div className="field">
                    <div className="flabel">Amount</div>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                        style={{ fontFamily: 'var(--font-serif), serif', fontSize: '38px', background: 'transparent', border: 'none', outline: 'none', width: '100%' }} required />
                </div>

                <div className="field">
                    <div className="flabel">Type</div>
                    <div className="flex" style={{ gap: '20px', fontSize: '16px' }}>
                        <button type="button" onClick={() => setType('expense')} style={{ textShadow: activeShadow(type === 'expense'), borderBottom: type === 'expense' ? '2px solid #1a1a1a' : '2px solid transparent', paddingBottom: '2px', color: type === 'expense' ? '#1a1a1a' : '#a3a09a' }}>Expense</button>
                        <button type="button" onClick={() => setType('income')} style={{ textShadow: activeShadow(type === 'income'), borderBottom: type === 'income' ? '2px solid #1a1a1a' : '2px solid transparent', paddingBottom: '2px', color: type === 'income' ? '#1a1a1a' : '#a3a09a' }}>Income</button>
                    </div>
                </div>

                <div className="field">
                    <div className="flabel">Category</div>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                        style={{ fontSize: '16px', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}>
                        <option value="">No category</option>
                        {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                </div>

                <div className="field">
                    <div className="flabel">Note</div>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                        style={{ fontSize: '16px', background: 'transparent', border: 'none', outline: 'none', width: '100%' }} />
                </div>

                <button type="submit" className="btn" style={{ background: '#1a1a1a', color: '#faf9f7', marginTop: '8px' }}>Save changes</button>
            </form>
        </div>
    )
}
