'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

const DataContext = createContext(null);

export function useData() {
    return useContext(DataContext);
}

export function DataProvider({ children }) {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();
    const inFlight = useRef(null);

    // Fetch transactions + categories once and cache them for the session.
    // Callers that just mutated data should call this to invalidate the cache;
    // callers that only need data available should use ensureLoaded instead,
    // which skips the network round-trip if we already have it.
    const refetch = useCallback(() => {
        if (inFlight.current) return inFlight.current;
        const p = (async () => {
            const [txRes, catRes] = await Promise.all([
                fetch('/api/transactions'),
                fetch('/api/categories'),
            ]);
            if (txRes.status === 401 || catRes.status === 401) {
                router.push('/login');
                return;
            }
            const [txData, catData] = await Promise.all([txRes.json(), catRes.json()]);
            setTransactions(txData.transactions);
            setCategories(catData.categories);
            setLoaded(true);
        })();
        inFlight.current = p;
        p.finally(() => { inFlight.current = null; });
        return p;
    }, [router]);

    const ensureLoaded = useCallback(() => {
        if (!loaded) return refetch();
    }, [loaded, refetch]);

    return (
        <DataContext.Provider value={{ transactions, categories, loaded, refetch, ensureLoaded }}>
            {children}
        </DataContext.Provider>
    );
}
