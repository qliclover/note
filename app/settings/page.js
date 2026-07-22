'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/app/Nav'

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

  if (!user) return <p className='p-8 text-neutral-500'>Loading...</p>;

  return (
    <div className='max-w-md mx-auto px-5 pt-5 pb-24'>
      <h1 className='font-serif text-4xl mb-4'>Settings</h1>

      {/* user's card */}
      <div className='flex items-center gap-4 border-b border-neutral-300 pb-4 mb-4'>
        <div className='w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-xl'>
          {(user.name || user.email)[0].toUpperCase()}
        </div>
        <div>
          <p className='font-serif text-xl'>{user.name || 'No name'}</p>
          <p className='text-sm text-neutral-500'>{user.email}</p>
        </div>
      </div>

      <p className='text-xs uppercase tracking-widest text-neutral-500 mb-2'>Preferences</p>
      <div className='flex flex-col mb-4'>
        <Row label='Currency' value='USD $' />
        <Row label='Monthly start day' value='1st' />
        <Row label='Appearance' value='Light' />
      </div>

      <button onClick={handleLogout} className='text-[#a3492f] text-sm'>Log out</button>

      <Nav />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className='flex justify-between border-b border-neutral-200 py-3'>
      <span>{label}</span>
      <span className='text-neutral-500'>{value}</span>
    </div>
  );
}