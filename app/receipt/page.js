'use client'
import { useState } from 'react';
import Link from 'next/link';

export default function ReceiptPage() {
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState('');

    // pick a file, read it into a data url with fileReader
    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
            setReceipt(null);
            setError('');
        };
        reader.readAsDataURL(file);
    }

    // send the image to the ai endpoint
    async function handleScan() {
        if (!image) return;
        setLoading(true);
        setError('');
        const res = await fetch('/api/receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image }),
        });
        setLoading(false);
        if (res.ok) {
            const data = await res.json();
            setReceipt(data.receipt);
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || 'scan failed');
        }
    }

    return (
        <div className='max-w-md mx-auto p-6'>
            <div className='flex justify-between items-baseline mb-8'>
                <h1 className='font-serif text-3xl'>Scan Receipt</h1>
                <Link href='/dashboard' className='text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-900'>Back</Link>
            </div>

            <input type='file' accept='image/*' onChange={handleFile} className='mb-4 block w-full text-sm text-neutral-500' />
            {image && (
                <img src={image} alt='preview' className='w-full rounded-lg border border-neutral-300 mb-4 max-h-72 object-contain' />
            )}

            {image && (
                <button onClick={handleScan} disabled={loading}
                    className='w-full bg-neutral-900 text-white rounded-full py-3 mb-6 disabled:opacity-50'>
                    {loading ? 'Scanning…' : 'Scan with AI'}
                </button>
            )}
            {error && <p className='text-[#a3492f] text-sm mb-4'>{error}</p>}
            {receipt && <ReceiptCard r={receipt} />}
        </div>
    )
}

// render the structured data as a nice electronic receipt
function ReceiptCard({ r }) {
    const cur = r.currency || '';
    const money = (n) => (n == null ? null : `${cur} ${Number(n).toFixed(2)}`);
    return (
        <div className='bg-white shadow-sm rounded-lg p-6 font-mono text-sm'>
            <div className='text-center border-b border-dashed border-neutral-300 pb-3 mb-3'>
                <p className='text-lg font-bold'>{r.merchant}</p>
                {r.date && <p className='text-neutral-500'>{r.date}</p>}
            </div>
            <div className='flex flex-col gap-1 border-b border-dashed border-neutral-300 pb-3 mb-3'>
                {r.items?.map((it, i) => (
                    <div key={i} className='flex justify-between'>
                        <span>{it.name}</span>
                        <span>{money(it.price)}</span>
                    </div>
                ))}
            </div>

            <div className='flex flex-col gap-1'>
                {r.subtotal != null && <Row label='Subtotal' value={money(r.subtotal)} />}
                {r.discount != null && <Row label='Discount' value={`- ${money(r.discount)}`} />}
                {r.tax != null && <Row label='Tax' value={money(r.tax)} />}
                {r.shipping != null && <Row label='Shipping' value={money(r.shipping)} />}
                {r.tips != null && <Row label='Tips' value={money(r.tips)} />}
            </div>

            <div className='flex justify-between border-t border-dashed border-neutral-400 mt-3 pt-3 font-bold text-base'>
                <span>TOTAL</span>
                <span>{money(r.total)}</span>
            </div>
        </div>
    )
}

function Row({ label, value }) {
    return (
        <div className='flex justify-between text-neutral-500'>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}
