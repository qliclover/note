'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import SubTabs, { MANAGE_TABS } from '@/app/SubTabs'
import { useData } from '@/app/DataContext'
import { getTheme, setTheme } from '@/app/theme'

const THEME_CYCLE = ['system', 'light', 'dark'];
const THEME_LABEL = { system: 'System', light: 'Light', dark: 'Dark' };

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [theme, setThemeState] = useState('system');
  const { transactions } = useData();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) { router.push('/login'); return; }
        setUser(data.user);
      });
    setThemeState(getTheme());
  }, [router]);

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
    setThemeState(next);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  function exportCSV() {
    const header = ['Date', 'Type', 'Category', 'Note', 'Amount'];
    const rows = transactions.map((t) => [
      t.date.slice(0, 10), t.type, t.category?.name || '', t.note || '', t.amount,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nook-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const win = window.open('', '_blank');
    if (!win) return;
    const rows = transactions.map((t) => `
      <tr>
        <td>${t.date.slice(0, 10)}</td>
        <td>${t.type}</td>
        <td>${t.category?.name || ''}</td>
        <td>${(t.note || '').replace(/</g, '&lt;')}</td>
        <td style="text-align:right">${t.type === 'income' ? '+' : '−'}$${t.amount.toFixed(2)}</td>
      </tr>`).join('');
    win.document.write(`<!DOCTYPE html><html><head><title>Nook — Transactions</title><style>
      body{font-family:-apple-system,system-ui,sans-serif;padding:40px;color:#1a1a1a}
      h1{font-family:Georgia,serif;font-size:28px;margin:0 0 4px}
      p{color:#6a6a6a;margin:0 0 20px;font-size:13px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{padding:8px 6px;border-bottom:1px solid #e6e4df;text-align:left}
      th{text-transform:uppercase;letter-spacing:.05em;font-size:11px;color:#a3a09a}
    </style></head><body>
      <h1>Nook</h1>
      <p>Transaction export — ${new Date().toLocaleDateString()}</p>
      <table><thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  if (!user) return <p className='p-8' style={{ color: 'var(--muted)' }}>Loading...</p>;

  return (
    <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SubTabs tabs={MANAGE_TABS} />

      <div className='flex items-center' style={{ gap: '14px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '26px', background: 'var(--fg)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif), serif', fontSize: '24px' }}>
          {(user.name || user.email)[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '26px' }}>{user.name || 'No name'}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{user.email}</div>
        </div>
      </div>

      <div>
        <div className='lbl' style={{ marginBottom: '4px' }}>Preferences</div>
        <Row label='Currency' value='USD $' />
        <Row label='Monthly start day' value='1st' />
        <button onClick={cycleTheme} className='row' style={{ width: '100%', borderBottom: 'none', background: 'none', border: 'none', textAlign: 'left' }}>
          <span>Appearance</span>
          <span style={{ color: 'var(--muted)' }}>{THEME_LABEL[theme]} ›</span>
        </button>
      </div>

      <div>
        <div className='lbl' style={{ marginBottom: '4px' }}>Data</div>
        <div className='row'>
          <span>Export</span>
          <span className='flex items-center' style={{ gap: '16px' }}>
            <button onClick={exportCSV} style={{ fontSize: '14px', color: 'var(--fg)' }}>CSV</button>
            <button onClick={exportPDF} style={{ fontSize: '14px', color: 'var(--fg)' }}>PDF</button>
          </span>
        </div>
        <div className='row' style={{ borderBottom: 'none' }}>
          <button onClick={handleLogout} style={{ color: 'var(--danger)' }}>Log out</button>
          <span />
        </div>
      </div>
      <div style={{ height: '80px' }} />
      <Nav />
    </div>
  );
}

function Row({ label, value, valueColor, last }) {
  return (
    <div className='row' style={last ? { borderBottom: 'none' } : undefined}>
      <span>{label}</span>
      <span style={{ color: valueColor || 'var(--muted)' }}>{value}</span>
    </div>
  );
}
