"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(true); // Default to dark

    useEffect(() => {
        // Check localStorage or default to dark
        const stored = localStorage.getItem("theme");
        const prefersDark = stored === "dark" || (!stored && true); // Default dark

        setIsDark(prefersDark);
        document.documentElement.classList.toggle("dark", prefersDark);
    }, []);

    const toggleTheme = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        document.documentElement.classList.toggle("dark", newValue);
        localStorage.setItem("theme", newValue ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/80 transition-all"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun className="w-4 h-4 text-orange-400" />
            ) : (
                <Moon className="w-4 h-4 text-gray-600" />
            )}
        </button>
    );
}
