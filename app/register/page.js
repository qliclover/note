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
        <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center p-8">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Ledger · Est 2026</p>
            <h1 className="font-serif text-4xl mb-8">Create account</h1>
            {error && <p className="text-[#a3492f] text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <input type="text" placeholder="Name" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900" />
                <input type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900" required />
                <input type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-b border-neutral-300 py-2 focus:outline-none focus:border-neutral-900" required />
                <button type="submit" className="bg-neutral-900 text-white rounded-full py-3 mt-2">Get started</button>
            </form>
            <Link href="/login" className="text-center text-sm text-neutral-500 hover:text-neutral-900 mt-6">I already have an account</Link>
        </div>
    )
}
