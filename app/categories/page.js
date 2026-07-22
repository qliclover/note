'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import { colorForIndex } from '@/app/categoryColor'

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState('expense');
    const router = useRouter();

    async function loadCategories() {
        const res = await fetch('/api/categories');
        if (res.status === 401) {
            router.push('/login');
            return;
        }
        const data = await res.json();
        setCategories(data.categories);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => {
        loadCategories();
        fetch('/api/transactions').then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) setTransactions(d.transactions); });
    }, []);

    async function handleAddCategory(e) {
        e.preventDefault();
        if (!newCatName) return;
        await fetch('/api/categories', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newCatName, type: newCatType }),
        });
        setNewCatName('');
        loadCategories();
    }

    async function handleDeleteCategory(id) {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        loadCategories();
    }

    function countFor(id) {
        return transactions.filter((t) => t.categoryId === id).length;
    }

    return (
        <div className='max-w-md mx-auto' style={{ padding: '62px 26px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
                <div className='lbl'>Manage</div>
                <div className='h1'>Categories</div>
            </div>

            <form onSubmit={handleAddCategory} className='flex items-center' style={{ gap: '14px', borderBottom: '1px solid #d9d6cf', paddingBottom: '9px' }}>
                <input type='text' placeholder='New category name' value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{ flex: 1, fontSize: '16px', background: 'transparent', border: 'none', outline: 'none' }} />
                <select value={newCatType} onChange={(e) => setNewCatType(e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#a3a09a' }}>
                    <option value='expense'>Expense</option>
                    <option value='income'>Income</option>
                </select>
                <button type='submit' style={{ fontSize: '15px', fontWeight: 600 }}>Add</button>
            </form>

            <div>
                {categories.map((c, i) => {
                    const n = countFor(c.id);
                    return (
                        <div key={c.id} className='row'>
                            <span className='dot' style={{ width: '10px', height: '10px', background: colorForIndex(i) }} />
                            <div style={{ flex: 1, marginLeft: '12px' }}>
                                <div style={{ fontSize: '16px' }}>{c.name}</div>
                                <div style={{ fontSize: '12px', color: '#a3a09a' }}>{n} {n === 1 ? 'entry' : 'entries'}</div>
                            </div>
                            <button onClick={() => handleDeleteCategory(c.id)} style={{ fontSize: '20px', color: '#c0bdb5' }}>×</button>
                        </div>
                    );
                })}
                {categories.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px' }}>No categories yet.</p>}
            </div>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    )
}
