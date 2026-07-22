'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAddEntry } from "./AddEntrySheet"

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
        return pathname === href ? { color: '#1a1a1a', fontWeight: 600 } : { color: '#b0ada7', fontWeight: 400 };
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0" style={{ borderTop: '1px solid #eceae5', background: '#faf9f7' }}>
            <div className="max-w-md mx-auto flex items-center justify-between"
                style={{ padding: '16px 26px', paddingBottom: 'calc(30px + env(safe-area-inset-bottom))' }}>
                {TABS_LEFT.map((t) => (
                    <Link key={t.href} href={t.href} style={{ fontSize: '13px', ...tabStyle(t.href) }}>{t.label}</Link>
                ))}
                <button onClick={openAddEntry} aria-label="Add entry"
                    style={{
                        width: '48px', height: '48px', borderRadius: '24px', background: '#1a1a1a', color: '#faf9f7',
                        fontFamily: 'var(--font-serif), serif', fontSize: '30px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', paddingBottom: '3px',
                    }}>
                    +
                </button>
                {TABS_RIGHT.map((t) => (
                    <Link key={t.href} href={t.href} style={{ fontSize: '13px', ...tabStyle(t.href) }}>{t.label}</Link>
                ))}
            </div>
        </nav>
    )
}
