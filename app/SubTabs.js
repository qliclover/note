'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeShadow } from './tabStyle'

export const INSIGHTS_TABS = [
    { href: '/stats', label: 'Stats' },
    { href: '/compare', label: 'Compared' },
    { href: '/search', label: 'Search' },
];

export const PLANNING_TABS = [
    { href: '/budgets', label: 'Budgets' },
    { href: '/goals', label: 'Goals' },
    { href: '/recurring', label: 'Recurring' },
];

export const MANAGE_TABS = [
    { href: '/categories', label: 'Categories' },
    { href: '/accounts', label: 'Accounts' },
    { href: '/settings', label: 'Settings' },
];

export default function SubTabs({ tabs }) {
    const pathname = usePathname();
    return (
        <div className='flex items-center' style={{ gap: '18px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '12px 0', fontSize: '14px' }}>
            {tabs.map((t) => {
                const active = pathname === t.href;
                return (
                    <Link key={t.href} href={t.href} style={{
                        textShadow: activeShadow(active),
                        color: active ? 'var(--fg)' : 'var(--muted)',
                        borderBottom: active ? '2px solid var(--fg)' : '2px solid transparent',
                        paddingBottom: '2px',
                    }}>{t.label}</Link>
                );
            })}
        </div>
    );
}
