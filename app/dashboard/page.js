'use client'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/app/Nav'
// 長條每一條的顏色（Ledger 沉穩土色系）
const COLORS = ['#a3492f', '#b08968', '#8a9a5b', '#5f7a5f', '#7d6b7d', '#9c8b6e'];

export default function Dashboard() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);        // ★ 分類清單
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [note, setNote] = useState('');
    const [categoryId, setCategoryId] = useState('');        // ★ 選中的分類
    const [newCatName, setNewCatName] = useState('');        // ★ 新分類名稱
    const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));  // ★ 選中月份 "YYYY-MM"
    const router = useRouter();

    // load transaction after add/delete
    async function loadTransactions() {
        const res = await fetch('/api/transactions');
        if (res.status === 401) {
            router.push('/login');
            return;
        }
        const data = await res.json();
        setTransactions(data.transactions);
    }

    // ★ 抓分類清單
    async function loadCategories() {
        const res = await fetch('/api/categories');
        if (res.status === 401) {
            router.push('/login');
            return;
        }
        const data = await res.json();
        setCategories(data.categories);
    }

    // 刻意在頁面載入時抓一次資料，是 useEffect 的正當用途；setState 在 await 之後（非同步）故安全
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
    useEffect(() => { loadTransactions(); loadCategories(); }, []);   // ★ 也載入分類

    async function handleAdd(e) {
        e.preventDefault();
        await fetch('/api/transactions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({amount, type, note, categoryId}),   // ★ 帶上 categoryId
        })
        setAmount('');
        setNote('');
        setCategoryId('');                                            // ★ 清空分類選擇
        loadTransactions();
    }

    async function handleDelete(id) {
        await fetch(`/api/transactions/${id}`, {method: 'DELETE'});
        loadTransactions();
    }

    // ★ 新增分類：用目前上方 type 選的收入/支出當分類類型
    async function handleAddCategory(e) {
        e.preventDefault();
        if (!newCatName) return;
        await fetch('/api/categories', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name: newCatName, type }),
        });
        setNewCatName('');
        loadCategories();   // 建完重抓，下拉立刻多一個選項
    }

    // ★ 刪除分類（用到它的交易會自動變無分類，所以也重抓交易）
    async function handleDeleteCategory(id) {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        loadCategories();
        loadTransactions();
    }

    // ★ 修改分類：用 prompt 問新名稱，再 PUT
    async function handleEditCategory(cat) {
        const name = prompt('New name', cat.name);
        if (!name) return;   // 取消或空白就不改
        await fetch(`/api/categories/${cat.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type: cat.type }),
        });
        loadCategories();
        loadTransactions();
    }

    // ★ 登出：清 cookie 後回首頁
    async function handleLogout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
    }

    // ★ 只留下選中月份的交易（t.date 像 "2026-07-18T..."，前 7 碼就是 "2026-07"）
    const monthTx = transactions.filter(t => t.date.slice(0, 7) === month);

    // calculate income, expense, remaining（都改用當月交易 monthTx）
    const income = monthTx.filter(t=>t.type === 'income').reduce((s,t)=>s + t.amount, 0);
    const expense = monthTx.filter(t=>t.type === 'expense').reduce((s,t)=>s + t.amount, 0);
    const balance = income - expense;

    // 把「支出」依分類加總，整理成長條圖要的格式 [{ name, value }]
    const expenseByCategory = {};
    monthTx
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const key = t.category ? t.category.name : '未分類';
        expenseByCategory[key] = (expenseByCategory[key] || 0) + t.amount;
      });
    const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

   return (
    <div className='max-w-md mx-auto p-6 pb-24'>
      <div className='flex justify-between items-baseline mb-6'>
        <h1 className='font-serif text-3xl'>My Note</h1>
        <div className='flex items-center gap-4 text-xs uppercase tracking-wide text-neutral-500'>
          <Link href='/receipt' className='hover:text-neutral-900'>Scan</Link>
          <button onClick={handleLogout} className='hover:text-[#a3492f]'>Logout</button>
        </div>
      </div>

      {/* ★ 月份選擇：改變它，下面所有數字/圖表/列表都只算這個月 */}
      <div className='mb-6 flex items-center gap-3'>
        <label className='text-xs uppercase tracking-widest text-neutral-500'>Month</label>
        <input type='month' value={month} onChange={(e) => setMonth(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-1 flex-1 focus:outline-none focus:border-neutral-900' />
      </div>

      {/* 結餘摘要 */}
      <div className='border-b border-neutral-300 pb-6 mb-6'>
        <p className='text-xs uppercase tracking-widest text-neutral-500 mb-1'>Balance</p>
        <p className='font-serif text-5xl'>${balance}</p>
        <div className='flex gap-6 mt-3 text-sm'>
          <span className='text-[#5f7a5f]'>+${income} in</span>
          <span className='text-[#a3492f]'>-${expense} out</span>
        </div>
      </div>

      {/* 花費分布長條圖：有支出資料才顯示 */}
      {pieData.length > 0 && (
        <div className='border-b border-neutral-300 pb-6 mb-6'>
          <p className='text-xs uppercase tracking-widest text-neutral-500 mb-4'>Expense by category</p>
          <div className='flex flex-col gap-3'>
            {pieData.map((c, i) => {
              const percent = Math.round((c.value / expense) * 100);
              return (
                <div key={c.name}>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='flex items-center gap-2'>
                      <span className='w-1.5 h-1.5 rounded-full' style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                      {c.name}
                    </span>
                    <span className='text-neutral-500'>{c.value}（{percent}%）</span>
                  </div>
                  <div className='w-full bg-neutral-200 rounded-full h-1.5'>
                    <div
                      className='h-1.5 rounded-full'
                      style={{ width: `${percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 新增分類的小表單 */}
      <form onSubmit={handleAddCategory} className='flex gap-3 mb-4 items-center'>
        <input type='text' placeholder='New category' value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900' />
        <button type='submit' className='bg-neutral-900 text-white rounded-full px-4 py-1.5 text-sm'>+ Cat</button>
      </form>

      {/* 分類管理：每個分類一個標籤，帶 Edit / Del 文字按鈕 */}
      {categories.length > 0 && (
        <div className='flex flex-wrap gap-x-5 gap-y-2 mb-8 text-sm'>
          {categories.map((c) => (
            <span key={c.id} className='inline-flex items-center gap-2'>
              <span>{c.name}</span>
              <button onClick={() => handleEditCategory(c)} className='text-neutral-400 hover:text-neutral-900 text-xs'>edit</button>
              <button onClick={() => handleDeleteCategory(c.id)} className='text-neutral-400 hover:text-[#a3492f] text-xs'>del</button>
            </span>
          ))}
        </div>
      )}

      {/* 新增交易表單 */}
      <form onSubmit={handleAdd} className='flex flex-col gap-4 mb-8'>
        <div className='flex gap-3'>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900'>
            <option value='expense'>Expense</option>
            <option value='income'>Income</option>
          </select>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className='bg-transparent border-b border-neutral-300 py-2 flex-1 focus:outline-none focus:border-neutral-900'>
            <option value=''>No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <input type='number' placeholder='Amount' value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900' required />
        <input type='text' placeholder='Note' value={note}
          onChange={(e) => setNote(e.target.value)}
          className='bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900' />
        <button type='submit' className='bg-neutral-900 text-white rounded-full py-3'>Save entry</button>
      </form>

      {/* 交易列表 — Ledger 風格 */}
      <ul className='flex flex-col'>
        {monthTx.map((t) => (
          <li key={t.id} className='flex justify-between items-center border-b border-neutral-200 py-3'>
              <Link href={`/transaction/${t.id}`} className='flex items-center gap-3 flex-1'>
              <span className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-[#5f7a5f]' : 'bg-[#a3492f]'}`}></span>
              <div>
                <p>{t.note || 'Untitled'}</p>
                <p className='text-xs uppercase tracking-wide text-neutral-400'>{t.category ? t.category.name : 'Uncategorized'}</p>
              </div>
            </Link>
            <div className='flex items-center gap-4'>
              <span className={`font-serif text-lg ${t.type === 'income' ? 'text-[#5f7a5f]' : 'text-[#a3492f]'}`}>
                {t.type === 'income' ? '+' : '-'}${t.amount}
              </span>
              <button onClick={() => handleDelete(t.id)} className='text-neutral-400 hover:text-[#a3492f] text-xs'>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <Nav />
    </div>
  )
}
