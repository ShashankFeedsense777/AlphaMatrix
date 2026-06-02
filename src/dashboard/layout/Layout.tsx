import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, ChevronDown } from 'lucide-react';
import LiveGreeks from '../sotm/GreeksLive';
import HistoricalGreeks from '../sotm/GreeksHistorical';
import { Logo } from '../../assets';

// ── Types ──────────────────────────────────────────────────────────
type ActiveView =
  | 'live-greeks'
  | 'historical-greeks'
  | 'vwap'
  | 'margin-calculator'
  | null;

interface NavItem {
  label: string;
  children: { label: string; view: ActiveView; available: boolean }[];
}

// ── Nav config ─────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    label: 'State of the Market',
    children: [
      { label: 'Live Greeks',       view: 'live-greeks',       available: true },
      { label: 'Historical Greeks', view: 'historical-greeks', available: true },
    ],
  },
  {
    label: 'VWAP',
    children: [
      { label: 'VWAP Analysis', view: 'vwap', available: false },
    ],
  },
  {
    label: 'Margin Calculator',
    children: [
      { label: 'Margin Calculator', view: 'margin-calculator', available: false },
    ],
  },
];

// ── Component renderer ─────────────────────────────────────────────
const ViewRenderer: React.FC<{ view: ActiveView }> = ({ view }) => {
  switch (view) {
    case 'live-greeks':       return <LiveGreeks />;
    case 'historical-greeks': return <HistoricalGreeks />;
    default:                  return null;
  }
};

// ── Layout ─────────────────────────────────────────────────────────
const Layout: React.FC = () => {
  const [activeView, setActiveView]   = useState<ActiveView>(null);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [activeLabel, setActiveLabel] = useState<string>('');

  const handleSelect = (view: ActiveView, label: string) => {
    setActiveView(view);
    setActiveLabel(label);
    setOpenMenu(null);
  };

  const isDropdownOpen = openMenu !== null;

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col">

      {/* ── Navbar ── */}
      <header className="relative z-50">
        <div
          className="flex items-center h-14 px-5 gap-6 border-b border-white/8"
          style={{ background: '#0d0d11' }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mr-4 shrink-0">
            <img src={Logo} alt="Alpha Matrix" className="h-8 w-8 object-contain" />
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-white">
              Alpha Matrix
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const isOpen = openMenu === item.label;
              const isActive = item.children.some(c =>
                c.view === activeView
              );

              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenMenu(isOpen ? null : item.label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150 ${
                      isOpen || isActive
                        ? 'text-white bg-white/8'
                        : 'text-white/55 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200 opacity-60 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Active underline */}
                  {isActive && !isOpen && (
                    <div className="absolute bottom-0 left-3 right-3 h-px bg-brand-saffron rounded-full" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right — current view label + logout */}
          <div className="flex items-center gap-3 shrink-0">
            {activeView && (
              <span className="text-[11px] text-white/30 font-light tracking-wider hidden sm:block">
                {activeLabel}
              </span>
            )}
            <button
              type="button"
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold text-white/50 hover:text-white hover:bg-white/8 border border-white/8 transition-colors duration-150"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* ── Mega dropdown panel ── */}
        <AnimatePresence>
          {openMenu && (() => {
            const item = NAV_ITEMS.find(n => n.label === openMenu)!;
            return (
              <motion.div
                key={openMenu}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-0 right-0 border-b border-white/8"
                style={{ background: '#0d0d11' }}
              >
                <div className="max-w-7xl mx-auto px-5 py-5 flex gap-10 items-start">
                  {/* Section label */}
                  <div className="shrink-0 w-48">
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-saffron mb-1">
                      {openMenu}
                    </p>
                    <p className="text-xs text-white/25 font-light leading-relaxed">
                      Select a view to load
                    </p>
                  </div>

                  {/* Options */}
                  <div className="flex gap-3 flex-wrap">
                    {item.children.map((child) => (
                      <button
                        key={child.label}
                        type="button"
                        disabled={!child.available}
                        onClick={() => child.available && handleSelect(child.view, child.label)}
                        className={`relative group flex flex-col gap-1 px-5 py-3.5 rounded-xl border text-left transition-all duration-200 min-w-[160px] ${
                          child.available
                            ? activeView === child.view
                              ? 'border-brand-saffron/50 bg-brand-saffron/8 text-white'
                              : 'border-white/8 bg-white/3 hover:border-white/20 hover:bg-white/6 text-white/75 hover:text-white'
                            : 'border-white/5 bg-white/[0.015] text-white/25 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-[13px] font-semibold tracking-wide">
                          {child.label}
                        </span>
                        {!child.available && (
                          <span className="text-[9px] uppercase tracking-[0.2em] text-brand-saffron/50 font-bold">
                            Coming Soon
                          </span>
                        )}
                        {activeView === child.view && (
                          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-saffron" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </header>

      {/* ── Backdrop blur when dropdown open ── */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-14 z-40 backdrop-blur-sm bg-black/30"
            onClick={() => setOpenMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main
        className={`flex-1 relative z-10 transition-[filter] duration-200 ${
          isDropdownOpen ? 'blur-sm pointer-events-none' : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {activeView ? (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              <ViewRenderer view={activeView} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4"
            >
              <img src={Logo} alt="Alpha Matrix" className="h-14 w-14 opacity-20" />
              <p className="text-sm text-white/20 font-light tracking-widest uppercase">
                Select a view from the menu
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;