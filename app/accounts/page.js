'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'

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

  // 淨值 = 所有帳戶餘額加總（含負的）
  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className='max-w-md mx-auto p-6 pb-24'>
      <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>Where your money lives</p>
      <h1 className='font-serif text-4xl mb-8'>Accounts</h1>

      <div className='border-b border-neutral-300 pb-6 mb-6'>
        <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>Net worth</p>
        <p className='font-serif text-5xl'>${netWorth.toFixed(2)}</p>
      </div>

      <div className='flex flex-col mb-8'>
        {accounts.map((a) => (
          <div key={a.id} className='flex justify-between items-center border-b border-neutral-200 py-3'>
            <div>
              <p>{a.name}</p>
              <p className='text-xs uppercase tracking-wide text-neutral-400'>{a.type}</p>
            </div>
            <span className={`font-serif text-lg ${a.balance < 0 ? 'text-[#a3492f]' : ''}`}>
              ${a.balance.toFixed(2)}
            </span>
          </div>
        ))}
        {accounts.length === 0 && <p className='text-neutral-500 text-sm'>No accounts yet.</p>}
      </div>

      <form onSubmit={handleAdd} className='flex flex-col gap-3 border-t border-neutral-300 pt-6'>
        <input type='text' placeholder='Account name' value={name} onChange={(e) => setName(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900' />
        <div className='flex gap-3'>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900'>
            <option value='cash'>Cash</option>
            <option value='bank'>Bank</option>
            <option value='credit'>Credit</option>
          </select>
          <input type='number' placeholder='Balance' value={balance} onChange={(e) => setBalance(e.target.value)}
            className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900' />
        </div>
        <button type='submit' className='bg-neutral-900 text-white rounded-full py-3 mt-2'>+ Add account</button>
      </form>

      <Nav />
    </div>
  );
}