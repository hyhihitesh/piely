"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import { signOutAction } from "@/actions/auth";

interface UserMenuProps {
    user: User;
    pseudonym: string;
}

export function UserMenu({ user, pseudonym }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-muted/50 pl-3 pr-4 py-1.5 rounded-full border border-border/50 shadow-sm backdrop-blur-md hover:bg-muted/80 transition-all group cursor-pointer"
            >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold shadow-inner ring-2 ring-transparent group-hover:ring-orange-500/20 transition-all">
                    {pseudonym[0]}
                </div>
                <span className="text-sm font-medium hidden sm:inline-block text-foreground/90">
                    {pseudonym}
                </span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-100 origin-top-right overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
                        <p className="text-sm font-medium text-foreground">{pseudonym}</p>
                        <p className="text-xs text-muted-foreground truncate opacity-80">{user.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="p-1">
                        {/* 
                           Future Placeholders: 
                           - Settings
                           - Billing 
                        */}

                        <form action={signOutAction}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sign out</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
