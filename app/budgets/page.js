'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();

  async function loadAll() {
    const res = await fetch('/api/budgets');
    if (res.status === 401) { router.push('/login'); return; }
    setBudgets((await res.json()).budgets);
    setTransactions((await (await fetch('/api/transactions')).json()).transactions);
    setCategories((await (await fetch('/api/categories')).json()).categories);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { loadAll(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!categoryId || !amount) return;
    await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, amount }),
    });
    setCategoryId(''); setAmount('');
    loadAll();
  }

  const month = new Date().toISOString().slice(0, 7);
  // spent on specific cat
  function spentFor(catId) {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === catId && t.date.slice(0, 7) === month)
      .reduce((s, t) => s + t.amount, 0);
  }

  return (
    <div className='max-w-md mx-auto p-6 pb-24'>
      <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>{month}</p>
      <h1 className='font-serif text-4xl mb-8'>Budgets</h1>

      <div className='flex flex-col gap-5 mb-8'>
        {budgets.map((b) => {
          const spent = spentFor(b.categoryId);
          const percent = b.amount ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
          const over = spent > b.amount;
          return (
            <div key={b.id}>
              <div className='flex justify-between text-sm mb-1'>
                <span>{b.category?.name || 'Unknown'}</span>
                <span className={over ? 'text-[#a3492f]' : 'text-neutral-500'}>${spent} / ${b.amount}</span>
              </div>
              <div className='w-full bg-neutral-200 rounded-full h-1.5'>
                <div className='h-1.5 rounded-full' style={{ width: `${percent}%`, backgroundColor: over ? '#a3492f' : '#5f7a5f' }}></div>
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && <p className='text-neutral-500 text-sm'>No budgets yet.</p>}
      </div>

      <form onSubmit={handleAdd} className='flex flex-col gap-3 border-t border-neutral-300 pt-6'>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900'>
          <option value=''>Pick a category</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <input type='number' placeholder='Monthly limit' value={amount} onChange={(e) => setAmount(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900' />
        <button type='submit' className='bg-neutral-900 text-white rounded-full py-3 mt-2'>+ Set budget</button>
      </form>

      <Nav />
    </div>
  );
}