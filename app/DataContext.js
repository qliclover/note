'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { symbolFor } from './currency'

const DataContext = createContext(null);

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currency, setCurrency] = useState('USD');
    const [monthStartDay, setMonthStartDay] = useState(1);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();
    const inFlight = useRef(null);

    // Fetch transactions + categories + user prefs once and cache them for the
    // session. Callers that just mutated data should call this to invalidate
    // the cache; callers that only need data available should use
    // ensureLoaded instead, which skips the round-trip if we already have it.
    const refetch = useCallback(() => {
        if (inFlight.current) return inFlight.current;
        const p = (async () => {
            const [txRes, catRes, meRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/categories'),
                fetch('/api/auth/me'),
            ]);
            if (txRes.status === 401 || catRes.status === 401) {
                router.push('/login');
                return;
            }
            const [txData, catData, meData] = await Promise.all([txRes.json(), catRes.json(), meRes.json()]);
            setTransactions(txData.transactions);
            setCategories(catData.categories);
            if (meData.user) {
                setCurrency(meData.user.currency || 'USD');
                setMonthStartDay(meData.user.monthStartDay || 1);
            }
            setLoaded(true);
        })();
        inFlight.current = p;
        p.finally(() => { inFlight.current = null; });
        return p;
    }, [router]);

    const ensureLoaded = useCallback(() => {
        if (!loaded) return refetch();
    }, [loaded, refetch]);

    async function updatePrefs(prefs) {
        await fetch('/api/auth/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs),
        });
        if (prefs.currency !== undefined) setCurrency(prefs.currency);
        if (prefs.monthStartDay !== undefined) setMonthStartDay(prefs.monthStartDay);
    }

    const symbol = symbolFor(currency);

    return (
        <DataContext.Provider value={{ transactions, categories, currency, monthStartDay, symbol, loaded, refetch, ensureLoaded, updatePrefs }}>
            {children}
        </DataContext.Provider>
    );
}
