'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import SubTabs, { MANAGE_TABS } from '@/app/SubTabs'

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [type, setType] = useState('bank');
  const router = useRouter();

  async function load() {
    const res = await fetch('/api/accounts');
    if (res.status === 401) { router.push('/login'); return; }
    setAccounts((await res.json()).accounts);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name) return;
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, balance }),
    });
    setName(''); setBalance(''); setType('bank');
    load();
  }

  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div className='lbl'>Where your money lives</div>
        <div className='h1'>Accounts</div>
      </div>

      <SubTabs tabs={MANAGE_TABS} />

      <div style={{ borderBottom: '1px solid #e6e4df', paddingBottom: '16px' }}>
        <div style={{ fontSize: '13px', color: '#9a9791' }}>Net worth</div>
        <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '48px', letterSpacing: '-1px' }}>${netWorth.toFixed(2)}</div>
      </div>

      <div>
        {accounts.map((a) => (
          <div key={a.id} className='row'>
            <div>
              <div style={{ fontSize: '16px' }}>{a.name}</div>
              <div style={{ fontSize: '12px', color: '#a3a09a' }}>{a.type}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '21px', color: a.balance < 0 ? '#c15b4a' : '#1a1a1a' }}>
              {a.balance < 0 ? '−' : ''}${Math.abs(a.balance).toFixed(2)}
            </div>
          </div>
        ))}
        {accounts.length === 0 && <p style={{ color: '#a3a09a', fontSize: '14px' }}>No accounts yet.</p>}
      </div>

      <form onSubmit={handleAdd} className='flex flex-col' style={{ gap: '12px', borderTop: '1px solid #e6e4df', paddingTop: '20px' }}>
        <input type='text' placeholder='Account name' value={name} onChange={(e) => setName(e.target.value)}
          className='field' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
        <div className='flex' style={{ gap: '12px' }}>
          <select value={type} onChange={(e) => setType(e.target.value)} className='field flex-1'
            style={{ background: 'transparent', outline: 'none', fontSize: '16px' }}>
            <option value='cash'>Cash</option>
            <option value='bank'>Bank</option>
            <option value='credit'>Credit</option>
          </select>
          <input type='number' placeholder='Balance' value={balance} onChange={(e) => setBalance(e.target.value)}
            className='field flex-1' style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
        </div>
        <button type='submit' className='btn' style={{ border: '1px solid #1a1a1a', marginTop: '6px' }}>+ Add account</button>
      </form>
      <div style={{ height: '80px' }} />
      <Nav />
    </div>
  );
}
