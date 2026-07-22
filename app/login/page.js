'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (res.ok) {
            router.push('/')
        } else {
            const data = await res.json();
            setError(data.error || 'Login fail');
        }
    }

    return (
        <div className="max-w-md mx-auto min-h-dvh flex flex-col justify-center" style={{ padding: '0 30px' }}>
            <div className="lbl" style={{ marginBottom: '8px' }}>Welcome back</div>
            <h1 style={{ fontFamily: 'var(--font-serif), serif', fontSize: '44px', letterSpacing: '-.5px', marginBottom: '30px' }}>Sign in</h1>
            {error && <p style={{ color: '#c15b4a', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '18px' }}>
                <input type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field" style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} required />
                <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field" style={{ background: 'transparent', outline: 'none', fontSize: '16px' }} required />
                <button type="submit" className="btn" style={{ background: '#1a1a1a', color: '#faf9f7', marginTop: '8px' }}>Sign in</button>
            </form>
            <Link href="/register" style={{ textAlign: 'center', fontSize: '15px', color: '#6a6a6a', marginTop: '24px' }}>Create an account</Link>
        </div>
    )
}
