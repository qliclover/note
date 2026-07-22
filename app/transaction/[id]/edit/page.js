'use client'
import { useState } from "react"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditEntry() {
    const {id} = useParams();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [note, setNote] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);

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
        
        fetch('/api/categories')
            .then((res) => res.ok ? res.json() : null)
            .then((data) => {if (data) setCategories(data.categories);});
    }, [id, router]);

    async function handleSave(e) {
        e.preventDefault();
        await fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify({amount, type, note, categoryId}),
        });
        router.push(`/transaction/${id}`);
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="flex justify-between items-baseline mb-8">
                <Link href={`/transaction/${id}`} className="text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900">Cancel</Link>
                <h1 className="font-serif text-2xl">Edit</h1>
                <button onClick={handleSave} className="text-xs uppercase tracking-wide text-[#5f7a5f] hover:text-neutral-900">Save</button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                    <label className="text-xs uppercase tracking-widest text-neutral-500">Amount</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-transparent border-b border-neutral-300 py-2 w-full font-serif text-2xl focus:outline-none focus:border-neutral-900" required/>
                </div>
                <div>
                    <label className="text-xs uppercase tracking-widest text-neutral-500">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="bg-transparent border-b border-neutral-300 py-2 w-full focus:outline-none focus:border-neutral-900">
                        <option value="expense">Expense</option>
                        <option value='income'>Income</option>
                    </select>
                </div>
                
                <div>
                    <label className="text-xs uppercase tracking-widest text-neutral-500">Category</label>
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="bg-transparent border-b border-neutral-300 py-2 w-full focus:outline-none focus:border-neutral-900">
                        <option value="">No category</option>
                        {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                    </select>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-widest text-neutral-500">Note</label>
                    <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="bg-transparent border-b border-neutral-300 py-2 w-full focus:outline-none focus:border-neutral-900"/>
                </div>
                <button type="submit" className="bg-neutral-900 text-white rounded-full py-3 mt-4">Save changes</button>
            </form>
        </div>
    )
}