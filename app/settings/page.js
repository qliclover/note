'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'
import SubTabs, { MANAGE_TABS } from '@/app/SubTabs'

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) { router.push('/login'); return; }
        setUser(data.user);
      });
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (!user) return <p className='p-8' style={{ color: '#a3a09a' }}>Loading...</p>;

  return (
    <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SubTabs tabs={MANAGE_TABS} />

      <div className='flex items-center' style={{ gap: '14px' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '26px', background: '#1a1a1a', color: '#faf9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif), serif', fontSize: '24px' }}>
          {(user.name || user.email)[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '26px' }}>{user.name || 'No name'}</div>
          <div style={{ fontSize: '13px', color: '#a3a09a' }}>{user.email}</div>
        </div>
      </div>

      <div>
        <div className='lbl' style={{ marginBottom: '4px' }}>Preferences</div>
        <Row label='Currency' value='USD $ ›' />
        <Row label='Monthly start day' value='1st ›' />
        <Row label='Appearance' value='Light ›' last />
      </div>

      <div>
        <div className='lbl' style={{ marginBottom: '4px' }}>Security &amp; data</div>
        <Row label='Face ID lock' value='On' valueColor='#2f6b52' />
        <Row label='iCloud sync' value='On' valueColor='#2f6b52' />
        <Row label='Export CSV / PDF' value='›' />
        <div className='row' style={{ borderBottom: 'none' }}>
          <button onClick={handleLogout} style={{ color: '#c15b4a' }}>Log out</button>
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
      <span style={{ color: valueColor || '#a3a09a' }}>{value}</span>
    </div>
  );
}
