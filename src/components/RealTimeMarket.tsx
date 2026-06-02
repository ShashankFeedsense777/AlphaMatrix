import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import SectionReveal, { fadeUp, fadeLeft, fadeRight, fadeIn, staggerContainer } from './SectionReveal';

const data = [
  { time: '09:30', market: 4000, alpha: 2400 },
  { time: '10:00', market: 3000, alpha: 1398 },
  { time: '10:30', market: 2000, alpha: 9800 },
  { time: '11:00', market: 2780, alpha: 3908 },
  { time: '11:30', market: 1890, alpha: 4800 },
  { time: '12:00', market: 2390, alpha: 3800 },
  { time: '12:30', market: 3490, alpha: 4300 },
  { time: '13:00', market: 4000, alpha: 5400 },
  { time: '13:30', market: 3000, alpha: 6398 },
  { time: '14:00', market: 5000, alpha: 7800 },
  { time: '14:30', market: 5500, alpha: 8908 },
  { time: '15:00', market: 6890, alpha: 10800 },
  { time: '15:30', market: 7390, alpha: 11800 },
  { time: '16:00', market: 8490, alpha: 13300 },
];

const signals = [
  { ticker: 'NIFTY50', status: 'LONG', pnl: '+2.41%', color: 'text-green-400' },
  { ticker: 'BANKNIFTY', status: 'SHORT', pnl: '-0.82%', color: 'text-red-400' },
  { ticker: 'USDINR', status: 'NEUTRAL', pnl: '+0.07%', color: 'text-gray-400' },
  { ticker: 'CRUDE', status: 'LONG', pnl: '+1.14%', color: 'text-green-400' },
];

const RealTimeMarket: React.FC = () => {
  return (
    <section id="market" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 relative border-t border-white/5" >
      <div className="max-w-7xl mx-auto">

        {/* ── Header row ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 sm:mb-14">
          <SectionReveal variants={fadeLeft}>
            <div className="flex items-center space-x-3 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <p className="text-[11px] sm:text-xs tracking-[0.24em] sm:tracking-[0.3em] text-white uppercase font-semibold">
                Live Performance
              </p>
            </div>
            <h3 className="text-[clamp(2rem,5vw,3rem)] font-light text-white">
              Alpha Generation{' '}
              <span className="text-brand-saffron font-bold">Matrix</span>
            </h3>
          </SectionReveal>

          <SectionReveal variants={fadeRight} className="text-left md:text-right">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
              System Status
            </div>
            <div className="text-green-400 font-mono font-bold tracking-widest text-sm sm:text-lg">
              OPTIMAL / ACTIVE
            </div>
          </SectionReveal>
        </div>

        {/* ── Chart ── */}
        <SectionReveal
          variants={fadeUp}
          className="h-[300px] sm:h-[380px] lg:h-[460px] w-full bg-white/2.5 border border-white/5 rounded-2xl p-3 sm:p-5 lg:p-6 backdrop-blur-sm mb-8 sm:mb-10"
        >
          <ResponsiveContainer width="100%" height="100%" >
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAlpha" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradMarket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b8df5" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#8b8df5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#ffffff30"
                tick={{ fill: '#ffffff40', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#ffffff30"
                tick={{ fill: '#ffffff40', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a0505',
                  border: '1px solid #f9731640',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="market"
                stroke="#8b8df5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradMarket)"
              />
              <Area
                type="monotone"
                dataKey="alpha"
                stroke="#f97316"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradAlpha)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionReveal>

        {/* ── Signal tickers — staggered ── */}
        <motion.div
          className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 mb-12 sm:mb-20"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {signals.map((sig) => (
            <motion.div
              key={sig.ticker}
              variants={fadeUp}
              className="bg-white/3 border border-white/5 rounded-xl p-4 sm:p-5 hover:border-brand-saffron/20 transition-colors duration-300"
            >
              <div className="text-xs text-gray-500 tracking-widest uppercase mb-2">
                {sig.ticker}
              </div>
              <div className="text-white font-mono font-bold text-sm mb-1">
                {sig.status}
              </div>
              <div className={`font-mono text-lg sm:text-xl font-bold ${sig.color}`}>{sig.pnl}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Footer ── */}
        <SectionReveal
          variants={fadeIn}
          className="border-t border-white/10 pt-8 sm:pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left"
        >
          <div className="text-gray-600 text-sm tracking-wide">
            &copy; 2026 Alpha Matrix. All rights reserved.
          </div>
          <button className="mt-4 md:mt-0 text-gray-500 hover:text-white transition-colors text-xs tracking-[0.2em] uppercase underline underline-offset-4 decoration-white/20">
            Secure Employee Portal
          </button>
        </SectionReveal>
      </div>
    </section>
  );
};

export default RealTimeMarket;
