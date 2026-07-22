'use client'
import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
    {href: '/dashboard', label: 'Home'},
    {href: '/stats', label: 'Stats'},
    {href: '/search', label: 'Search'},
    {href: '/compare', label: 'Compare'},
];

export default function Nav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-300 bg-[#f4f1ea]">
            <div className="max-w-md mx-auto flex justify-around text-xs uppercase tracking-wide py-4">
                {TABS.map((t) => (
                    <Link key={t.href} href={t.href}
                        className={pathname === t.href ? 'text-neutral-900 font-bold' : 'text-neutral-400 hover:text-neutral-900'}>
                            {t.label}
                        </Link>
                ))}
            </div>
        </nav>
    )
}