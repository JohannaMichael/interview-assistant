import { useState, useEffect } from 'react';

function ThemeToggleButton() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        const themeStylesheet = document.getElementById('theme-stylesheet') as HTMLLinkElement | null;
        themeStylesheet?.setAttribute('href', theme === 'light' ? 'light_theme.css' : 'dark_theme.css');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <div className="theme-toggle">
            <button id="themeToggle" className="btn theme-btn" onClick={toggleTheme}>
                {theme === 'light' ? 'Dark 🌙' : 'Light ☀️'}
            </button>
        </div>
    );
}

export default ThemeToggleButton;