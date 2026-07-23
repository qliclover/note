'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })

        if (res.ok) {
            router.push('/')
        } else {
            const data = await res.json();
            setError(data.error || 'Registration fail');
        }
    }

    return (
        <div className="max-w-md mx-auto min-h-dvh flex flex-col justify-center" style={{ padding: '0 30px' }}>
            <div className="lbl" style={{ marginBottom: '8px' }}>Nook · Est. 2026</div>
            <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: '44px', letterSpacing: '-.5px', marginBottom: '30px' }}>Create account</h1>
            {error && <p style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '18px' }}>
                <input type="text" placeholder="Name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="field" style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} />
                <input type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field" style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} required />
                <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field" style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} required />
                <button type="submit" className="btn" style={{ background: 'var(--fg)', color: 'var(--bg)', marginTop: '8px' }}>Get started</button>
            </form>
            <Link href="/login" style={{ textAlign: 'center', fontSize: '15px', color: 'var(--muted)', marginTop: '24px' }}>I already have an account</Link>
        </div>
    )
}
