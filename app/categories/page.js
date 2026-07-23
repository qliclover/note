'use client'
import {useState, useEffect} from 'react'
import Nav from '@/app/Nav'
import SubTabs, { MANAGE_TABS } from '@/app/SubTabs'
import { useData } from '@/app/DataContext'
import { colorForIndex } from '@/app/categoryColor'

export default function CategoriesPage() {
    const { categories, transactions, ensureLoaded, refetch } = useData();
    const [newCatName, setNewCatName] = useState('');
    const [newCatType, setNewCatType] = useState('expense');

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { ensureLoaded(); }, []);

    async function handleAddCategory(e) {
        e.preventDefault();
        if (!newCatName) return;
        await fetch('/api/categories', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newCatName, type: newCatType }),
        });
        setNewCatName('');
        refetch();
    }

    async function handleDeleteCategory(id) {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        refetch();
    }

    function countFor(id) {
        return transactions.filter((t) => t.categoryId === id).length;
    }

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div>
                <div className='lbl'>Manage</div>
                <div className='h1'>Categories</div>
            </div>

            <SubTabs tabs={MANAGE_TABS} />

            <form onSubmit={handleAddCategory} className='flex items-center' style={{ gap: '14px', borderBottom: '1px solid var(--border-2)', paddingBottom: '9px' }}>
                <input type='text' placeholder='New category name' value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{ flex: 1, fontSize: '16px', background: 'transparent', border: 'none', outline: 'none' }} />
                <select value={newCatType} onChange={(e) => setNewCatType(e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--muted)' }}>
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
                                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{n} {n === 1 ? 'entry' : 'entries'}</div>
                            </div>
                            <button onClick={() => handleDeleteCategory(c.id)} style={{ fontSize: '20px', color: 'var(--faint)' }}>×</button>
                        </div>
                    );
                })}
                {categories.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No categories yet.</p>}
            </div>
            <div style={{ height: '80px' }} />
            <Nav />
        </div>
    )
}
