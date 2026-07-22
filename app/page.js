'use client'
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  if (loading) return <p className="p-8" style={{ color: '#a3a09a' }}>Loading...</p>;

  return (
    <div className="max-w-md mx-auto min-h-dvh flex flex-col" style={{ padding: '0 30px' }}>
      {user ? (
        <div className="flex-1 flex flex-col justify-center" style={{ gap: '30px' }}>
          <p className="lbl">Welcome back</p>
          <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: '44px', letterSpacing: '-.5px', lineHeight: 1 }}>
            Hello, {user.name || user.email}
          </h1>
          <div className="flex flex-col" style={{ gap: '16px' }}>
            <Link href="/dashboard" className="btn" style={{ background: '#1a1a1a', color: '#faf9f7' }}>
              Go to My Note
            </Link>
            <button onClick={handleLogout} style={{ textAlign: 'center', fontSize: '15px', color: '#6a6a6a' }}>
              Logout
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col justify-center" style={{ gap: '30px' }}>
            <div className="lbl">Ledger · Est. 2026</div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '60px', lineHeight: .98, letterSpacing: '-.5px' }}>
                Keep a<br />beautiful<br /><span style={{ fontStyle: 'italic' }}>record.</span>
              </div>
              <div style={{ fontSize: '16px', color: '#6a6a6a', marginTop: '18px', lineHeight: 1.5 }}>
                Every dollar, set in type.<br />Calm, considered, yours.
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e6e4df', borderBottom: '1px solid #e6e4df', padding: '18px 0' }}>
              <div className="lbl">This month</div>
              <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '44px', letterSpacing: '-.5px', marginTop: '2px' }}>
                $3,924<span style={{ fontStyle: 'italic', color: '#8a8783' }}>.90</span>
              </div>
              <div style={{ fontSize: '13px', color: '#6a6a6a', marginTop: '6px' }}>+$4,200 in · −$275.10 out</div>
            </div>
          </div>
          <div className="flex flex-col" style={{ paddingBottom: '44px', gap: '16px' }}>
            <Link href="/register" className="btn" style={{ background: '#1a1a1a', color: '#faf9f7' }}>
              Get started
            </Link>
            <Link href="/login" style={{ textAlign: 'center', fontSize: '15px', color: '#6a6a6a' }}>
              I already have an account
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
