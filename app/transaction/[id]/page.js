'use client'
import {useState, useEffect} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Link from 'next/link'
import { useData } from '@/app/DataContext'

export default function TransactionDetail() {
    const {id} = useParams();
    const router = useRouter();
    const { symbol, refetch } = useData();
    const [tx, setTx] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch(`/api/transactions/${id}`)
            .then((res) => {
                if (res.status === 401) {router.push('/login'); return null;}
                if (res.status === 404) {setNotFound(true); return null;}
                return res.json();
            })
            .then((data) => {if (data) setTx(data.transaction);});
    }, [id, router]);

    async function handleDelete() {
        await fetch(`/api/transactions/${id}`, {method: 'DELETE'});
        refetch();
        router.push('/dashboard');
    }

    async function handleDuplicate() {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ amount: tx.amount, type: tx.type, note: tx.note, categoryId: tx.categoryId || '' }),
        });
        const data = await res.json();
        refetch();
        router.push(`/transaction/${data.transaction.id}`);
    }

    if (notFound) return <p className='p-8' style={{ color: 'var(--muted)' }}>Not found.</p>;
    if (!tx) return <p className='p-8' style={{ color: 'var(--muted)' }}>Loading...</p>;

    const isIncome = tx.type === 'income';
    const date = new Date(tx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: '100dvh' }}>
            <div className='flex justify-between'>
                <Link href='/dashboard' style={{ fontSize: '15px', color: 'var(--muted)' }}>‹ Back</Link>
                <Link href={`/transaction/${id}/edit`} style={{ fontSize: '15px', color: 'var(--muted)' }}>Edit</Link>
            </div>

            <div style={{ textAlign: 'center', padding: '14px 0' }}>
                <div className='flex items-center justify-center' style={{ gap: '8px', marginBottom: '10px' }}>
                    <span className='dot' style={{ background: isIncome ? '#6f7a4e' : '#a5735a' }} />
                    <span className='lbl'>{tx.category ? tx.category.name : (isIncome ? 'Income' : 'Expense')}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '64px', letterSpacing: '-1px' }}>
                    {isIncome ? '+' : '−'}{symbol}{tx.amount}
                </div>
                <div style={{ fontSize: '15px', color: 'var(--muted)', marginTop: '6px' }}>{tx.note || (isIncome ? 'Income' : 'Expense')}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }}>
                <Row label='Date' value={date} />
                <Row label='Category' value={tx.category ? tx.category.name : '-'} />
                <Row label='Note' value={tx.note || '-'} last />
            </div>

            <div style={{ flex: 1 }} />
            <div className='flex' style={{ gap: '12px', paddingBottom: '14px' }}>
                <button onClick={handleDuplicate} className='btn flex-1' style={{ border: '1px solid var(--fg)' }}>Duplicate</button>
                <button onClick={handleDelete} className='btn flex-1' style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Delete</button>
            </div>
        </div>
    );
}

function Row({label, value, last}) {
    return (
        <div className='row' style={last ? { borderBottom: 'none' } : undefined}>
            <span style={{ color: 'var(--muted)' }}>{label}</span>
            <span>{value}</span>
        </div>
    );
}
