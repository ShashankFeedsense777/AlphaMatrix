import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import LiveGreeks from '../sotm/GreeksLive';
import HistoricalGreeks from '../sotm/GreeksHistorical';
import VWAP from '../vwap/VWAP';
import MarginCalculator from '../marginCalculator/MarginCalculator';
import { Logo } from '../../assets';
import { useNavigate } from 'react-router-dom';

type ActiveView =
    | 'live-greeks'
    | 'historical-greeks'
    | 'vwap'
    | 'margin-calculator'
    | null;

interface NavItem {
    label: string;
    description: string;
    children: { label: string; view: ActiveView; available: boolean }[];
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'State Of The Market',
        description: 'State of the market\nlittle overview',
        children: [
            { label: 'Live Greeks', view: 'live-greeks', available: true },
            { label: 'Historical Greeks', view: 'historical-greeks', available: true },
        ],
    },
    {
        label: 'VWAP',
        description: 'Volume weighted\naverage price',
        children: [
            { label: 'VWAP Analysis', view: 'vwap', available: true },
        ],
    },
    {
        label: 'Margin Calculator',
        description: 'Margin & exposure\ncalculator',
        children: [
            { label: 'Margin Calculator', view: 'margin-calculator', available: true },
        ],
    },
];

const ViewRenderer: React.FC<{ view: ActiveView }> = ({ view }) => {
    switch (view) {
        case 'live-greeks': return <LiveGreeks />;
        case 'historical-greeks': return <HistoricalGreeks />;
        case 'vwap': return <VWAP />;
        case 'margin-calculator': return <MarginCalculator />;
        default: return null;
    }
};

const Layout: React.FC = () => {
    const [activeView, setActiveView] = useState<ActiveView>('live-greeks');
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const navigate = useNavigate();

    const handleMouseEnter = (label: string) => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        setOpenMenu(label);
    };

    const handleMouseLeave = () => {
        // Small delay so moving from nav item → dropdown doesn't flicker
        closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
    };

    const handleSelect = (view: ActiveView) => {
        if (!view) return;
        setActiveView(view);
        setOpenMenu(null);
    };

    const isOpen = openMenu !== null;
    const openItem = NAV_ITEMS.find(n => n.label === openMenu);

    return (
        <div className="min-h-screen flex flex-col bg-white">

            {/* ── Navbar ─────────────────────────────────────────── */}
            <header className="relative z-50 bg-[#111111]">
                <div className="flex items-center h-[70px] px-4 sm:px-6 gap-4">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mr-2 shrink-0">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <img src={Logo} alt="AlphaMatrix" className="h-9 w-9 object-contain" />
                        </div>
                        <span className="text-[16px] font-bold uppercase tracking-[0.18em] text-white hidden sm:block">
                            AlphaMatrix
                        </span>
                    </div>

                    {/* Nav items */}
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

                    {/* Logout */}
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

                {/* ── Dropdown — absolute, does NOT push content ── */}
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
                            <div className="flex gap-12 px-6 sm:px-8 py-5 sm:py-6">
                                <div className="shrink-0 w-44 hidden sm:block">
                                    <p className="text-[13px] font-bold text-white leading-snug whitespace-pre-line">
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

            {/* ── Overlay blur on main content when dropdown open ── */}
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

                {/* ── Main content ── */}
                <main className="min-h-[calc(100vh-52px)] bg-white">
                    <AnimatePresence mode="wait">
                        {activeView ? (
                            <motion.div
                                key={activeView}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                            >
                                <ViewRenderer view={activeView} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-[calc(100vh-52px)] gap-3"
                            >
                                <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center">
                                    <img src={Logo} alt="" className="h-6 w-6 object-contain opacity-30" />
                                </div>
                                <p className="text-sm text-gray-400 tracking-widest uppercase font-light">
                                    Select a view from the menu
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Layout;
