'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import SubTabs, { PLANNING_TABS } from '@/app/SubTabs'
import { categoryColor } from '@/app/categoryColor'

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
  const monthLabel = new Date(month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  function spentFor(catId) {
    return transactions
      .filter(t => t.type === 'expense' && t.categoryId === catId && t.date.slice(0, 7) === month)
      .reduce((s, t) => s + t.amount, 0);
  }

  return (
    <div className='max-w-md mx-auto' style={{ padding: '62px 26px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <div className='lbl'>{monthLabel}</div>
        <div className='h1'>Budgets</div>
      </div>

      <SubTabs tabs={PLANNING_TABS} />

      <div>
        {budgets.map((b) => {
          const spent = spentFor(b.categoryId);
          const percent = b.amount ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
          const over = spent > b.amount;
          const color = categoryColor(b.category, categories);
          return (
            <div key={b.id} style={{ padding: '18px 0', borderTop: '1px solid #e6e4df' }}>
              <div className='flex items-center justify-between' style={{ marginBottom: '9px' }}>
                <div className='flex items-center' style={{ gap: '9px' }}>
                  <span className='dot' style={{ background: color }} />
                  {b.category?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: '13px', color: over ? '#c15b4a' : '#a3a09a' }}>
                  <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '18px', color: over ? '#c15b4a' : '#1a1a1a' }}>${spent}</span> / ${b.amount}
                </div>
              </div>
              <div style={{ height: '4px', borderRadius: '4px', background: '#eeece7' }}>
                <div style={{ height: '100%', width: `${percent}%`, background: over ? '#c15b4a' : color, borderRadius: '4px' }} />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px' }}>No budgets yet.</p>}
      </div>

      <form onSubmit={handleAdd} className='flex flex-col' style={{ gap: '12px', borderTop: '1px solid #e6e4df', paddingTop: '20px' }}>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className='field'
          style={{ background: 'transparent', outline: 'none', fontSize: '16px' }}>
          <option value=''>Pick a category</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>
        <input type='number' placeholder='Monthly limit' value={amount} onChange={(e) => setAmount(e.target.value)}
          className='field' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
        <button type='submit' className='btn' style={{ background: '#1a1a1a', color: '#faf9f7', marginTop: '6px' }}>+ Set budget</button>
      </form>
      <div style={{ height: '80px' }} />
      <Nav />
    </div>
  );
}
