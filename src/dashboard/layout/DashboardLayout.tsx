import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../assets';

type ActiveView =
    | 'live-greeks'
    | 'historical-greeks'
    | 'vwap'
    | 'margin-calculator';

interface NavItem {
    label: string;
    description: string;
    children: { label: string; view: ActiveView; available: boolean }[];
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'State Of The Market',
        description: 'Live and historical options Greeks —\nDelta, Gamma, Theta, Vega — across strikes,\nexpires and instruments in real time',
        children: [
            { label: 'Live Greeks', view: 'live-greeks', available: true },
            { label: 'Historical Greeks', view: 'historical-greeks', available: true },
        ],
    },
    {
        label: 'VWAP',
        description: 'Rolling volume-weighted average price\nwith upper/lower volatility bands and\nauto-generated buy/sell entry signals',
        children: [
            { label: 'VWAP Analysis', view: 'vwap', available: true },
        ],
    },
    {
        label: 'Margin Calculator',
        description: 'SPAN-based margin and exposure across\nF&O buy and sell legs, with live backend\nsync for accurate real-time requirements',
        children: [
            { label: 'F&O Margin Calculator', view: 'margin-calculator', available: true },
        ],
    },
];

const VIEW_PATH: Record<ActiveView, string> = {
    'live-greeks': '/dashboard/live-greeks',
    'historical-greeks': '/dashboard/historical-greeks',
    'vwap': '/dashboard/vwap',
    'margin-calculator': '/dashboard/margin-calculator',
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const activeView: ActiveView | null =
        (Object.entries(VIEW_PATH) as [ActiveView, string][])
            .find(([, path]) => location.pathname.startsWith(path))?.[0] ?? null;

    const handleMouseEnter = (label: string) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpenMenu(label);
    };

    const handleMouseLeave = () => {
        closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
    };

    const handleSelect = (view: ActiveView) => {
        if (!view) return;
        navigate(VIEW_PATH[view]);
        setOpenMenu(null);
    };

    const isOpen = openMenu !== null;
    const openItem = NAV_ITEMS.find(n => n.label === openMenu);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <header className="relative z-50 bg-[#111111]">
                <div className="flex items-center h-[70px] px-4 sm:px-6 gap-4">
                    <div className="flex items-center gap-2.5 mr-2 shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={Logo} alt="AlphaMatrix" className="h-9 w-9 object-contain" />
                        </div>
                        <span className="text-[16px] font-bold uppercase tracking-[0.18em] text-white hidden sm:block">
                            AlphaMatrix
                        </span>
                    </div>
                    <nav className="flex items-center gap-1 flex-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = item.children.some(c => c.view === activeView);
                            const isMenuOpen = openMenu === item.label;

                            return (
                                <div
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => handleMouseEnter(item.label)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <button
                                        type="button"
                                        className={`relative px-3 py-1.5 text-[13px] transition-colors duration-150 rounded-sm ${isMenuOpen || isActive
                                                ? 'text-white'
                                                : 'text-white/55 hover:text-white'
                                            }`}
                                    >
                                        {item.label}
                                        {(isActive || isMenuOpen) && (
                                            <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-white rounded-full" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </nav>

                    <button
                        type="button"
                        title="Logout"
                        className="ml-auto shrink-0 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                        onClick={() => {
                            localStorage.removeItem('loggedIn');
                            navigate('/login', { replace: true });
                        }}
                    >
                        <LogOut size={15} className="text-white" />
                    </button>
                </div>

                <AnimatePresence>
                    {isOpen && openItem && (
                        <motion.div
                            key={openMenu}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute top-full left-0 right-0 border-t border-white/10 overflow-hidden"
                            style={{ background: '#1c1c1c' }}
                            onMouseEnter={() => handleMouseEnter(openMenu!)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="flex gap-14 px-8 sm:px-10 py-6 sm:py-7">
                                <div className="shrink-0 w-48 hidden sm:flex flex-col gap-1.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">
                                        About
                                    </span>
                                    <p className="text-[12.5px] font-normal text-white/70 leading-relaxed whitespace-pre-line">
                                        {openItem.description}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {openItem.children.map((child) => (
                                        <button
                                            key={child.label}
                                            type="button"
                                            disabled={!child.available}
                                            onClick={() => child.available && handleSelect(child.view)}
                                            className={`text-left text-[13px] transition-colors duration-150 w-fit ${child.available
                                                    ? activeView === child.view
                                                        ? 'text-white font-semibold'
                                                        : 'text-white/65 hover:text-white'
                                                    : 'text-white/25 cursor-not-allowed'
                                                }`}
                                        >
                                            {child.label}
                                            {!child.available && (
                                                <span className="ml-2 text-[10px] text-white/30 uppercase tracking-widest">
                                                    — soon
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <div className="relative flex-1">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            key="overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 z-40 bg-black/20"
                            style={{ backdropFilter: 'blur(3px)' }}
                        />
                    )}
                </AnimatePresence>

                <main className="min-h-[calc(100vh-52px)] bg-white">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
