'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAddEntry } from "./AddEntrySheet"
import { activeShadow } from "./tabStyle"

const TABS_LEFT = [
    {href: '/dashboard', label: 'Home'},
    {href: '/stats', label: 'Stats'},
];
const TABS_RIGHT = [
    {href: '/budgets', label: 'Budget'},
    {href: '/categories', label: 'Tags'},
];

export default function Nav() {
    const pathname = usePathname();
    const { openAddEntry } = useAddEntry();

    function tabStyle(href) {
        const active = pathname === href;
        return { color: active ? 'var(--fg)' : 'var(--muted)', textShadow: activeShadow(active) };
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="max-w-md mx-auto flex items-center justify-between"
                style={{ padding: '16px 26px', paddingBottom: 'calc(30px + env(safe-area-inset-bottom))' }}>
                {TABS_LEFT.map((t) => (
                    <Link key={t.href} href={t.href} style={{ fontSize: '13px', ...tabStyle(t.href) }}>{t.label}</Link>
                ))}
                <button onClick={openAddEntry} aria-label="Add entry"
                    style={{
                        position: 'relative', width: '56px', height: '56px', borderRadius: '28px', background: 'var(--fg)',
                        transform: 'translateY(-14px)', boxShadow: '0 8px 20px rgba(26,26,26,.28)',
                        flex: 'none',
                    }}>
                    <span style={{ position: 'absolute', top: '50%', left: '50%', width: '18px', height: '2px', background: 'var(--bg)', transform: 'translate(-50%,-50%)', borderRadius: '1px' }} />
                    <span style={{ position: 'absolute', top: '50%', left: '50%', width: '2px', height: '18px', background: 'var(--bg)', transform: 'translate(-50%,-50%)', borderRadius: '1px' }} />
                </button>
                {TABS_RIGHT.map((t) => (
                    <Link key={t.href} href={t.href} style={{ fontSize: '13px', ...tabStyle(t.href) }}>{t.label}</Link>
                ))}
            </div>
        </nav>
    )
}
