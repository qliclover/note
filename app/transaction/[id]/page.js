'use client'
import {useState, useEffect} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Link from 'next/link'

export default function TransactionDetail() {
    const {id} = useParams();
    const router = useRouter();
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
        router.push('/dashboard');
    }

    if (notFound) return <p className='p-8 text-neutral-500'>Not found.</p>;
    if (!tx) return <p className='p-8 text-neutral-500'>Loading...</p>;

    const isIncome = tx.type === 'income';
    const date = new Date(tx.date).toLocaleDateString();

    return (
        <div className='max-w-md mx-auto p-6'>
            <div className='flex justify-between items-baseline'>
                <Link href='/dashboard' className='text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900'>Back</Link>
                <Link href={`/transaction/${id}/edit`} className='text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900'>Edit</Link>
            </div>
            <div className='text-center my-10'>
                <p className='text-xs uppercase tracking-widest text-neutral-500 mb-3'>
                    {tx.category ? tx.category.name:(isIncome ? 'Income' : 'Expense')}
                </p>
                <p className={`font-serif text-5xl ${isIncome ? 'text-[#5f7a5f]' : 'text-[#a3492f]'}`}>
                    {isIncome ? '+' : '-'}${tx.amount}
                </p>
                {tx.note && <p className='text-neutral-600 mt-2'>{tx.note}</p>}
            </div>

            <div className='flex flex-col'>
                <Row label='Date' value={date}/>
                <Row label='Type' value={tx.type}/>
                <Row label='Category' value={tx.category ? tx.category.name : '-'}/>
                <Row label='Note' value={tx.note || '-'}/>
            </div>

            <button onClick={handleDelete}
                className='w-full border border-[#a3492f] text-[#a3492f] rounded-full py-3 mt-10 hover:bg-[#a3492f] hover:text-white'>
                    Delete
                </button>
        </div>
    );
}

function Row({label, value}) {
    return (
        <div className='flex justify-between border-b border-neutral-200 py-3'>
            <span className='text-xs uppercase tracking-wide text-neutral-500'>{label}</span>
            <span>{value}</span>
        </div>
    );
}