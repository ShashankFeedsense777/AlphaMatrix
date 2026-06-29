import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

type RiskDisclosureModalProps = {
  onAcknowledge: () => void;
};

const RiskDisclosureModal: React.FC<RiskDisclosureModalProps> = ({ onAcknowledge }) => {
  const [checked, setChecked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-3 py-6 sm:px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full max-w-2xl min-h-[55vh] max-h-[88vh] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-red-400/20 bg-[#0b0b0e] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 border-b border-white/8 bg-red-500/5 px-5 sm:px-8 py-5 sm:py-6">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/25 bg-red-500/10 text-red-400">
            <ShieldAlert size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/90 mb-1">
              SEBI Mandated Disclosure
            </p>
            <h2 className="text-lg sm:text-xl font-semibold text-white leading-snug">
              Risk Disclosure on Derivatives
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-4 text-sm leading-relaxed text-white/75">
          <DisclosurePoint>
            <span className="font-bold text-brand-saffron">9 out of 10</span> individual traders in the equity Futures &amp; Options segment incurred net losses.
          </DisclosurePoint>
          <DisclosurePoint>
            On average, loss makers registered a net trading loss close to{' '}
            <span className="font-bold text-brand-saffron">₹50,000</span>.
          </DisclosurePoint>
          <DisclosurePoint>
            Over and above net trading losses, loss makers expended an additional{' '}
            <span className="font-bold text-brand-saffron">28%</span> of net trading losses as transaction costs.
          </DisclosurePoint>
          <DisclosurePoint>
            Those making net trading profits incurred between{' '}
            <span className="font-bold text-brand-saffron">15% to 50%</span> of such profits as transaction costs.
          </DisclosurePoint>

          <div className="mt-2 rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex gap-2.5">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-xs sm:text-[13px] text-white/60 leading-relaxed">
                All investors and the general public are advised not to rely on unsolicited stock tips or investment advice circulated through bulk SMS, websites, and social media platforms. Investors are further advised to exercise appropriate due diligence before dealing in the securities market.
              </p>
            </div>
          </div>

          <p className="pt-1 text-[11px] text-white/30">
            Source: SEBI study on individual investors trading in equity F&amp;O segment.
          </p>
        </div>

        {/* Footer / Acknowledgment */}
        <div className="border-t border-white/8 bg-black/30 px-5 sm:px-8 py-5 sm:py-6">
          <label className="flex items-start gap-3 cursor-pointer select-none mb-4">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-black/40 accent-orange-500"
            />
            <span className="text-xs sm:text-[13px] text-white/70 leading-relaxed">
              I have read and understood the above risk disclosure on equity Futures &amp; Options trading.
            </span>
          </label>
          <button
            type="button"
            disabled={!checked}
            onClick={onAcknowledge}
            className="w-full rounded-xl bg-brand-saffron py-3.5 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-30"
          >
            Proceed to Login →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DisclosurePoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-3">
    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-saffron" />
    <p>{children}</p>
  </div>
);

export default RiskDisclosureModal;