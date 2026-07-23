export function getTheme() {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem('theme') || 'system';
}

export function setTheme(theme) {
    if (theme === 'system') {
        localStorage.removeItem('theme');
        document.documentElement.removeAttribute('data-theme');
    } else {
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
}
