'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/app/DataContext';
import { colorForIndex } from '@/app/categoryColor';

export default function ReceiptPage() {
    const { categories: allCategories, ensureLoaded, refetch } = useData();
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const router = useRouter();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { ensureLoaded(); }, []);

    const categories = allCategories.filter((c) => c.type === 'expense');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => {
        if (!categoryId && categories[0]) setCategoryId(String(categories[0].id));
    }, [categoryId, categories]);

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
            setReceipt(null);
            setSaved(false);
            setError('');
        };
        reader.readAsDataURL(file);
    }

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

    async function handleSave() {
        if (!receipt) return;
        setSaving(true);
        await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: receipt.total,
                type: 'expense',
                note: receipt.merchant,
                categoryId,
            }),
        });
        setSaving(false);
        setSaved(true);
        refetch();
    }

    return (
        <div className='max-w-md mx-auto' style={{ padding: 'calc(20px + env(safe-area-inset-top)) 26px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <div className='flex items-baseline justify-between'>
                <div>
                    <div className='lbl'>Camera to ledger</div>
                    <div className='h1'>Scan receipt</div>
                </div>
                <Link href='/dashboard' style={{ fontSize: '13px', color: '#6a6a6a' }}>Home</Link>
            </div>

            {!image && (
                <label style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    border: '1px dashed #d9d6cf', borderRadius: '12px', padding: '48px 20px', cursor: 'pointer',
                }}>
                    <CameraIcon />
                    <div style={{ fontSize: '15px' }}>Take or choose a photo</div>
                    <div style={{ fontSize: '12px', color: '#a3a09a' }}>We'll read the merchant, items and total</div>
                    <input type='file' accept='image/*' capture='environment' onChange={handleFile} style={{ display: 'none' }} />
                </label>
            )}

            {image && (
                <div>
                    <img src={image} alt='preview' style={{ width: '100%', borderRadius: '12px', border: '1px solid #e6e4df', maxHeight: '280px', objectFit: 'contain', background: '#f0eee8' }} />
                    <label style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: '#6a6a6a', marginTop: '10px', cursor: 'pointer' }}>
                        Choose a different photo
                        <input type='file' accept='image/*' capture='environment' onChange={handleFile} style={{ display: 'none' }} />
                    </label>
                </div>
            )}

            {image && !receipt && (
                <button onClick={handleScan} disabled={loading} className='btn' style={{ background: '#1a1a1a', color: '#faf9f7', opacity: loading ? .6 : 1 }}>
                    {loading ? 'Reading receipt…' : 'Scan with AI'}
                </button>
            )}
            {error && <p style={{ color: '#c15b4a', fontSize: '14px' }}>{error}</p>}

            {receipt && (
                <>
                    <ReceiptCard r={receipt} />

                    {categories.length > 0 && (
                        <div className='flex items-center overflow-x-auto' style={{ gap: '18px', borderTop: '1px solid #e6e4df', borderBottom: '1px solid #e6e4df', padding: '12px 0', fontSize: '14px' }}>
                            {categories.map((c, i) => {
                                const active = categoryId === String(c.id);
                                return (
                                    <button key={c.id} onClick={() => setCategoryId(String(c.id))} className='flex items-center flex-none'
                                        style={{ gap: '7px', paddingBottom: '2px', fontWeight: active ? 600 : 400, borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent', color: active ? '#1a1a1a' : '#a3a09a', whiteSpace: 'nowrap' }}>
                                        <span className='dot' style={{ background: colorForIndex(i) }} />{c.name}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {saved ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#2f6b52', marginBottom: '14px' }}>Saved to your ledger.</p>
                            <button onClick={() => router.push('/dashboard')} className='btn' style={{ border: '1px solid #1a1a1a' }}>Back to Home</button>
                        </div>
                    ) : (
                        <button onClick={handleSave} disabled={saving} className='btn' style={{ background: '#1a1a1a', color: '#faf9f7', opacity: saving ? .6 : 1 }}>
                            {saving ? 'Saving…' : 'Add to ledger'}
                        </button>
                    )}
                </>
            )}
        </div>
    )
}

function ReceiptCard({ r }) {
    const cur = r.currency ? r.currency + ' ' : '$';
    const money = (n) => (n == null ? null : `${cur}${Number(n).toFixed(2)}`);
    return (
        <div style={{ background: '#fff', border: '1px solid #eeece7', borderRadius: '2px', padding: '26px 22px', boxShadow: '0 10px 24px rgba(26,26,26,.06)' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #d9d6cf', paddingBottom: '14px', marginBottom: '14px' }}>
                <div style={{ fontFamily: 'var(--font-serif), serif', fontSize: '26px' }}>{r.merchant}</div>
                {r.date && <div style={{ fontSize: '12px', color: '#a3a09a', marginTop: '2px' }}>{r.date}</div>}
            </div>

            {r.items?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px dashed #d9d6cf', paddingBottom: '14px', marginBottom: '14px', fontSize: '14px' }}>
                    {r.items.map((it, i) => (
                        <div key={i} className='flex justify-between'>
                            <span style={{ color: '#4a4a48' }}>{it.name}</span>
                            <span>{money(it.price)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#a3a09a' }}>
                {r.subtotal != null && <Row label='Subtotal' value={money(r.subtotal)} />}
                {r.discount != null && <Row label='Discount' value={`− ${money(r.discount)}`} />}
                {r.tax != null && <Row label='Tax' value={money(r.tax)} />}
                {r.shipping != null && <Row label='Shipping' value={money(r.shipping)} />}
                {r.tips != null && <Row label='Tips' value={money(r.tips)} />}
            </div>

            <div className='flex items-baseline justify-between' style={{ borderTop: '1px dashed #d9d6cf', marginTop: '14px', paddingTop: '14px' }}>
                <span className='lbl'>Total</span>
                <span style={{ fontFamily: 'var(--font-serif), serif', fontSize: '30px' }}>{money(r.total)}</span>
            </div>
        </div>
    )
}

function CameraIcon() {
    return (
        <div style={{ position: 'relative', width: '48px', height: '40px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '8px', border: '1.5px solid #1a1a1a' }} />
            <div style={{ position: 'absolute', top: '-6px', left: '14px', width: '16px', height: '7px', borderRadius: '2px 2px 0 0', border: '1.5px solid #1a1a1a', borderBottom: 'none', background: '#faf9f7' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '16px', height: '16px', borderRadius: '50%', border: '1.5px solid #1a1a1a', transform: 'translate(-50%,-50%)' }} />
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className='flex justify-between'>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    )
}
