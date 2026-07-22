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

  if (loading) return <p className="p-8 text-neutral-500">Loading...</p>;

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center p-8">
      {user ? (
        // 已登入
        <>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Welcome back</p>
          <h1 className="font-serif text-4xl mb-10">Hello, {user.name || user.email}</h1>
          <Link href="/dashboard" className="bg-neutral-900 text-white rounded-full py-3 text-center mb-3">
            Go to My Note
          </Link>
          <button onClick={handleLogout} className="text-center text-sm text-neutral-500 hover:text-[#a3492f]">
            Logout
          </button>
        </>
      ) : (
        // 未登入：Ledger 開場
        <>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-6">Ledger · Est 2026</p>
          <h1 className="font-serif text-5xl leading-tight mb-5">
            Keep a<br />
            <em>beautiful</em><br />
            record.
          </h1>
          <p className="text-neutral-600 leading-relaxed mb-12">
            Every dollar, set in type.<br />
            Calm, considered, yours.
          </p>
          <Link href="/register" className="bg-neutral-900 text-white rounded-full py-3 text-center mb-3">
            Get started
          </Link>
          <Link href="/login" className="text-center text-sm text-neutral-500 hover:text-neutral-900">
            I already have an account
          </Link>
        </>
      )}
    </div>
  );
}