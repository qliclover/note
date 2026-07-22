'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // call Register API
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password})
        })

        if (res.ok) {
            router.push('/')
        } else {
            const data = await res.json();
            setError(data.error || 'Registration fail');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-bold text-center">Register</h1>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <input
                    type="text" placeholder="Name" value = {name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />
                <input 
                    type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2" required
                />
                <input
                    type="password" placeholder="Password" value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2" required
                />
                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">
                    Register
                </button>
            </form>
        </div>
    )
}