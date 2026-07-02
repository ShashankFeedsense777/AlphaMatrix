import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';

/* ─── animation helpers ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};
const stagger = (gap = 0.06) => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

/* ─── Google Sheet config ────────────────────────────────────── */
const SHEET_ID = '1UwVzMdkDY5cXuelrgiSmfobn7MvCCxRHYI4pRkyJk0k';
// Fetch by sheet name — more reliable than gid across sheet renames
const sheetUrl = (name: string) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;

const SHEET_NAMES = {
  monthly:  'Data for every month ending',
  trend:    'Trend of monthly disposal',
  annual:   'Trend of annual disposal',
} as const;

/* ─── CSV parser ─────────────────────────────────────────────── */
function parseCSV(raw: string): string[][] {
  const rows: string[][] = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === ',' && !inQ) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    rows.push(cells);
  }
  return rows;
}

// Find header row = first row with ≥ 3 non-empty cells
function splitHeaderData(rows: string[][]): { headers: string[]; data: string[][] } {
  let hi = 0;
  for (let i = 0; i < Math.min(6, rows.length); i++) {
    if (rows[i].filter(c => c.length > 0).length >= 3) { hi = i; break; }
  }
  return {
    headers: rows[hi].map(h => h.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()),
    data: rows.slice(hi + 1).filter(r => r.some(c => c.trim().length > 0)),
  };
}

/* ─── Excel serial date → month string ──────────────────────── */
function serialToMonth(val: string): string {
  const n = parseFloat(val);
  if (isNaN(n) || n < 40000) return val; // already a string label
  const d = new Date(Math.round((n - 25569) * 864e5));
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

/* ─── Number formatting ──────────────────────────────────────── */
const fmt = (v: string) => {
  const n = parseInt(v.replace(/,/g, ''), 10);
  return isNaN(n) ? v : n.toLocaleString('en-IN');
};
const num = (v: string) => {
  const n = parseInt(v.replace(/,/g, ''), 10);
  return isNaN(n) ? 0 : n;
};

/* ─── Types ──────────────────────────────────────────────────── */
type SheetData = { headers: string[]; data: string[][] };
type TabKey = 'monthly' | 'trend' | 'annual';
type LoadState = 'idle' | 'loading' | 'done' | 'error';

/* ─── Sub-components ─────────────────────────────────────────── */

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: 'saffron' | 'green' | 'red' | 'blue';
  sub?: string;
}> = ({ label, value, icon, accent, sub }) => {
  const cls = {
    saffron: 'border-brand-saffron/20 bg-brand-saffron/5 text-brand-saffron',
    green:   'border-emerald-200 bg-emerald-50 text-emerald-700',
    red:     'border-red-200 bg-red-50 text-red-700',
    blue:    'border-sky-200 bg-sky-50 text-sky-700',
  }[accent];
  return (
    <motion.div variants={fadeUp} className={`rounded-xl border ${cls} p-4 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-75">{label}</p>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-[10px] opacity-55 mt-0.5">{sub}</p>}
    </motion.div>
  );
};

/* Thin horizontal bar to visualise one number against a max */
const MiniBar: React.FC<{ value: number; max: number; accent: string }> = ({ value, max, accent }) => (
  <div className="mt-1.5 h-1 w-full rounded-full bg-gray-200">
    <div
      className={`h-full rounded-full ${accent}`}
      style={{ width: max > 0 ? `${Math.min(100, (value / max) * 100)}%` : '0%' }}
    />
  </div>
);

/* ────────────────────────────────────────────────────────────────
   SHEET 1 — Monthly detail (by source)
   ───────────────────────────────────────────────────────────── */
const MonthlySheet: React.FC<{ sheet: SheetData }> = ({ sheet }) => {
  const { headers, data } = sheet;

  // Grab the month label from title row (row 0 before header)
  const grandRow = data.find(r => (r[1] ?? '').toLowerCase().includes('grand'));

  const totalReceived  = num(grandRow?.[3] ?? '0');
  const totalResolved  = num(grandRow?.[5] ?? '0');
  const totalPending   = num(grandRow?.[6] ?? '0') + num(grandRow?.[7] ?? '0');
  const rate = totalReceived > 0 ? Math.round((totalResolved / totalReceived) * 100) : 100;

  // Source rows (skip "Last Month" carry-forward row and Grand Total)
  const sourceRows = data.filter(r => {
    const src = (r[1] ?? '').toLowerCase();
    return src.length > 0 && !src.includes('last month') && !src.includes('grand');
  });

  return (
    <div className="space-y-6">
      {/* stat strip */}
      <motion.div variants={stagger(0.07)} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Carried Forward" value={fmt(grandRow?.[2] ?? '0')} icon={<Clock size={15}/>} accent="blue" sub="From previous month" />
        <StatCard label="Received" value={fmt(grandRow?.[3] ?? '0')} icon={<BarChart3 size={15}/>} accent="saffron" sub="This month" />
        <StatCard label="Resolved" value={fmt(grandRow?.[5] ?? '0')} icon={<CheckCircle2 size={15}/>} accent="green" sub="Closed this month" />
        <StatCard
          label="Pending" value={fmt(String(totalPending))}
          icon={totalPending === 0 ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
          accent={totalPending === 0 ? 'green' : 'red'}
          sub={totalPending === 0 ? 'All clear' : 'Awaiting resolution'}
        />
      </motion.div>

      {totalPending === 0 && totalReceived === 0 && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0"/>
          <p className="text-sm text-emerald-700">No complaints received this month. Zero pending.</p>
        </motion.div>
      )}

      {/* Source breakdown */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 mb-3 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-brand-saffron inline-block"/>
          Breakdown by source
        </p>
        {/* desktop table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                    {h || `—`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, ri) => {
                const isGrand = (row[1] ?? '').toLowerCase().includes('grand');
                return (
                  <tr key={ri} className={`transition-colors ${isGrand ? 'bg-brand-saffron/[0.05] font-semibold' : 'hover:bg-gray-50'}`}>
                    {headers.map((_, ci) => (
                      <td key={ci} className={`px-4 py-3 text-[12.5px] ${
                        ci === 0 ? 'text-gray-400 font-mono' :
                        ci === 1 ? 'text-gray-800' :
                        isGrand ? 'text-brand-saffron/90 font-mono tabular-nums' :
                        'text-gray-600 font-mono tabular-nums'
                      }`}>
                        {ci === 0 ? (row[ci] || '') : ci === 1 ? (row[ci] || '') : fmt(row[ci] ?? '0')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* mobile cards */}
        <div className="sm:hidden space-y-3">
          {sourceRows.map((row, ri) => (
            <div key={ri} className="rounded-xl border border-gray-200 bg-white shadow-sm p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">{row[1] ?? '—'}</p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                {['Carried Fwd', 'Received', 'Total', 'Resolved', 'Pend <3mo', 'Pend >3mo', 'Avg Days'].map((lbl, i) => (
                  <div key={lbl}>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">{lbl}</p>
                    <p className="font-mono text-xs text-gray-700">{fmt(row[i + 2] ?? '0')}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Resolution rate bar */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700">Resolution Rate this month</p>
          <span className={`text-sm font-bold ${rate >= 90 ? 'text-emerald-600' : rate >= 70 ? 'text-brand-saffron' : 'text-red-600'}`}>
            {rate}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <motion.div
            className={`h-full rounded-full ${rate >= 90 ? 'bg-emerald-500' : rate >= 70 ? 'bg-brand-saffron' : 'bg-red-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <p className="mt-2 text-[11px] text-gray-400">
          {rate === 100 ? 'All complaints resolved — excellent track record.' :
           rate >= 90 ? 'Very high resolution rate.' :
           'Resolution rate needs attention.'}
        </p>
      </motion.div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   SHEET 2 — Monthly disposal trend
   ───────────────────────────────────────────────────────────── */
const TrendSheet: React.FC<{ sheet: SheetData }> = ({ sheet }) => {
  const { headers, data } = sheet;

  const trendRows = data
    .filter(r => !isNaN(parseFloat(r[0])) && r[1] && r[1].trim().length > 0)
    .map(r => ({
      sn:        r[0],
      month:     serialToMonth(r[1]),
      carried:   num(r[2] ?? '0'),
      received:  num(r[3] ?? '0'),
      resolved:  num(r[4] ?? '0'),
      pending:   num(r[5] ?? '0'),
    }));

  const grandRow = data.find(r => (r[1] ?? '').toLowerCase().includes('grand'));
  const totalReceived = num(grandRow?.[3] ?? '0');
  const totalResolved = num(grandRow?.[4] ?? '0');
  const maxReceived = Math.max(...trendRows.map(r => r.received), 1);

  return (
    <div className="space-y-6">
      <motion.div variants={stagger(0.07)} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Months Tracked" value={trendRows.length} icon={<Calendar size={15}/>} accent="blue" sub={`${trendRows[0]?.month} – ${trendRows[trendRows.length - 1]?.month}`} />
        <StatCard label="Total Received" value={fmt(String(totalReceived))} icon={<BarChart3 size={15}/>} accent="saffron" sub="Cumulative" />
        <StatCard label="Total Resolved" value={fmt(String(totalResolved))} icon={<CheckCircle2 size={15}/>} accent="green" sub="Cumulative" />
        <StatCard
          label="Still Pending" value={fmt(grandRow?.[5] ?? '0')}
          icon={num(grandRow?.[5] ?? '0') === 0 ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
          accent={num(grandRow?.[5] ?? '0') === 0 ? 'green' : 'red'}
          sub="End of last period"
        />
      </motion.div>

      {/* Visual bar chart */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-brand-saffron inline-block"/>
          Month-by-month complaints
        </p>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          {trendRows.every(r => r.received === 0) ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <CheckCircle2 size={28} className="text-emerald-500/70"/>
              <p className="text-sm text-gray-500">Zero complaints received across all tracked months.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {trendRows.map((row, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[80px_1fr_48px] sm:grid-cols-[100px_1fr_56px] items-center gap-3"
                >
                  <span className="text-[11px] text-gray-500 truncate">{row.month}</span>
                  <div className="h-5 rounded-md bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-md bg-brand-saffron/70"
                      initial={{ width: 0 }}
                      whileInView={{ width: maxReceived > 0 ? `${(row.received / maxReceived) * 100}%` : '0%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.03 }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-right text-gray-600">{row.received}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Full table */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 mb-3 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-brand-saffron inline-block"/>
          Detailed monthly register
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['SN', 'Month', 'Carried Forward', 'Received', 'Resolved', 'Pending'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trendRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[12px] text-gray-400 font-mono">{row.sn}</td>
                  <td className="px-4 py-3 text-[12.5px] text-brand-saffron/80 font-medium">{row.month}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-gray-600 tabular-nums">{row.carried}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-gray-800 tabular-nums">{row.received}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-emerald-600/80 tabular-nums">{row.resolved}</td>
                  <td className={`px-4 py-3 text-[12.5px] font-mono tabular-nums ${row.pending === 0 ? 'text-emerald-600/70' : 'text-red-600/80'}`}>{row.pending}</td>
                </tr>
              ))}
              {grandRow && (
                <tr className="bg-brand-saffron/[0.05] border-t border-brand-saffron/20 font-semibold">
                  <td className="px-4 py-3 text-[12px] text-gray-400"/>
                  <td className="px-4 py-3 text-[12.5px] text-brand-saffron">Grand Total</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[2] ?? '0')}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[3] ?? '0')}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[4] ?? '0')}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[5] ?? '0')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   SHEET 3 — Annual disposal trend
   ───────────────────────────────────────────────────────────── */
const AnnualSheet: React.FC<{ sheet: SheetData }> = ({ sheet }) => {
  const { data } = sheet;

  const annualRows = data
    .filter(r => r[1] && r[1].trim().length > 0 && !r[1].toLowerCase().includes('grand'))
    .map(r => ({
      sn:       r[0],
      year:     r[1].trim(),
      carried:  num(r[2] ?? '0'),
      received: num(r[3] ?? '0'),
      resolved: num(r[4] ?? '0'),
      pending:  num(r[5] ?? '0'),
    }));

  const grandRow = data.find(r => (r[1] ?? '').toLowerCase().includes('grand'));
  const maxReceived = Math.max(...annualRows.map(r => r.received), 1);
  const totalReceived = annualRows.reduce((a, r) => a + r.received, 0);
  const totalResolved = annualRows.reduce((a, r) => a + r.resolved, 0);
  const rate = totalReceived > 0 ? Math.round((totalResolved / totalReceived) * 100) : 100;

  const currentYear = annualRows.find(r => r.year.includes('2025-26') || r.year.includes('2025'));
  const prevYear    = annualRows.find(r => r.year.includes('2024-25') || r.year.includes('2024'));
  const yoyChange   = currentYear && prevYear && prevYear.received > 0
    ? Math.round(((currentYear.received - prevYear.received) / prevYear.received) * 100) : null;

  return (
    <div className="space-y-6">
      <motion.div variants={stagger(0.07)} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Years Tracked" value={annualRows.length} icon={<Calendar size={15}/>} accent="blue" sub="Financial years" />
        <StatCard label="Lifetime Received" value={fmt(String(totalReceived))} icon={<BarChart3 size={15}/>} accent="saffron" sub="All years combined" />
        <StatCard label="Lifetime Resolved" value={fmt(String(totalResolved))} icon={<CheckCircle2 size={15}/>} accent="green" sub="All years combined" />
        <StatCard
          label="Overall Rate" value={`${rate}%`}
          icon={rate >= 90 ? <TrendingUp size={15}/> : <TrendingDown size={15}/>}
          accent={rate >= 90 ? 'green' : rate >= 70 ? 'saffron' : 'red'}
          sub={rate >= 95 ? 'Excellent' : rate >= 80 ? 'Good' : 'Needs attention'}
        />
      </motion.div>

      {yoyChange !== null && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${
            yoyChange <= 0
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}>
          {yoyChange <= 0 ? <TrendingDown size={18} className="text-emerald-600 shrink-0"/> : <TrendingUp size={18} className="text-amber-600 shrink-0"/>}
          <p className={`text-sm ${yoyChange <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            Complaints {yoyChange <= 0 ? 'decreased' : 'increased'} by{' '}
            <strong>{Math.abs(yoyChange)}%</strong> in FY 2025-26 vs FY 2024-25.
          </p>
        </motion.div>
      )}

      {/* Visual bar chart */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 mb-4 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-brand-saffron inline-block"/>
          Year-on-year complaints received
        </p>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5">
          {annualRows.every(r => r.received === 0) ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <CheckCircle2 size={28} className="text-emerald-500/70"/>
              <p className="text-sm text-gray-500">Zero complaints recorded across all financial years.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {annualRows.map((row, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[72px_1fr_48px] sm:grid-cols-[88px_1fr_56px] items-center gap-3"
                >
                  <span className="text-[11px] text-brand-saffron/70 font-medium truncate">{row.year}</span>
                  <div className="h-5 rounded-md bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full rounded-md bg-brand-saffron/70"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(row.received / maxReceived) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.04 }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-right text-gray-600">{row.received}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Full table */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-gray-500 mb-3 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-brand-saffron inline-block"/>
          Annual disposal register
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['SN', 'Financial Year', 'Carried Forward', 'Received', 'Resolved', 'Pending'].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {annualRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3 text-[12px] text-gray-400 font-mono">{row.sn}</td>
                  <td className="px-4 py-3 text-[12.5px] text-brand-saffron/80 font-medium">{row.year}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-gray-600 tabular-nums">{row.carried}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-gray-800 tabular-nums">{row.received}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-emerald-600/80 tabular-nums">{row.resolved}</td>
                  <td className={`px-4 py-3 text-[12.5px] font-mono tabular-nums ${row.pending === 0 ? 'text-emerald-600/70' : 'text-red-600/80'}`}>{row.pending}</td>
                </tr>
              ))}
              {grandRow && (
                <tr className="bg-brand-saffron/[0.05] border-t border-brand-saffron/20 font-semibold">
                  <td className="px-4 py-3"/>
                  <td className="px-4 py-3 text-[12.5px] text-brand-saffron">Grand Total</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[2] ?? '0')}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[3] ?? '0')}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[4] ?? '0')}</td>
                  <td className="px-4 py-3 text-[12.5px] font-mono text-brand-saffron/80 tabular-nums">{fmt(grandRow[5] ?? '0')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Main page
   ───────────────────────────────────────────────────────────── */

const TABS: { key: TabKey; label: string; short: string; icon: React.ReactNode }[] = [
  { key: 'monthly', label: 'Monthly Snapshot',    short: 'Monthly',  icon: <BarChart3 size={14}/> },
  { key: 'trend',   label: 'Monthly Trend',        short: 'Trend',    icon: <TrendingUp size={14}/> },
  { key: 'annual',  label: 'Annual Disposal',      short: 'Annual',   icon: <Calendar size={14}/> },
];

const ComplaintDetails: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('monthly');
  const [sheets, setSheets] = useState<Partial<Record<TabKey, SheetData>>>({});
  const [loadState, setLoadState] = useState<Record<TabKey, LoadState>>({
    monthly: 'idle', trend: 'idle', annual: 'idle',
  });
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchSheet = useCallback(async (key: TabKey) => {
    setLoadState(prev => ({ ...prev, [key]: 'loading' }));
    try {
      const sheetName = SHEET_NAMES[key];
      const res = await fetch(sheetUrl(sheetName));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (text.startsWith('<!DOCTYPE')) throw new Error('Sheet not publicly accessible.');
      const rows = parseCSV(text);
      const parsed = splitHeaderData(rows);
      setSheets(prev => ({ ...prev, [key]: parsed }));
      setLoadState(prev => ({ ...prev, [key]: 'done' }));
      setLastFetched(new Date());
    } catch {
      setLoadState(prev => ({ ...prev, [key]: 'error' }));
    }
  }, []);

  // Load active tab on mount / tab switch
  useEffect(() => {
    if (loadState[activeTab] === 'idle') fetchSheet(activeTab);
  }, [activeTab, loadState, fetchSheet]);

  const state = loadState[activeTab];
  const data  = sheets[activeTab];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative border-b border-gray-200 px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-saffron/[0.04] to-transparent pointer-events-none"/>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-saffron/20 bg-brand-saffron/10 px-3 py-1.5 mb-5">
            <ShieldAlert size={13} className="text-brand-saffron"/>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-saffron">
              SEBI Mandated Disclosure
            </span>
          </div>
          <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-light text-gray-900 leading-tight mb-3">
            Investor Complaints <span className="font-bold">Details</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xl mx-auto">
            Monthly and annual complaint data disclosed as required under SEBI norms for
            registered stock brokers — sourced live from our public disclosure register.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => fetchSheet(activeTab)} disabled={state === 'loading'}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white shadow-sm px-3.5 py-2 text-[11px] font-semibold text-gray-700 hover:border-brand-saffron/40 hover:text-brand-saffron transition-colors disabled:opacity-40">
              <RefreshCw size={12} className={state === 'loading' ? 'animate-spin' : ''}/>
              Refresh
            </button>
            <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white shadow-sm px-3.5 py-2 text-[11px] font-semibold text-gray-700 hover:border-brand-saffron/40 hover:text-brand-saffron transition-colors">
              <ExternalLink size={12}/> Source Sheet
            </a>
            {lastFetched && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Clock size={11}/>
                {lastFetched.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        {/* Tab bar */}
        <div className="mb-8 grid grid-cols-3 gap-1 rounded-full border border-gray-200 bg-white shadow-sm p-1">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`relative flex min-h-10 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab.key ? 'text-white' : 'text-gray-500 hover:text-gray-800'}`}>
              {activeTab === tab.key && (
                <motion.span layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-brand-saffron shadow-[0_0_20px_rgba(249,115,22,0.25)]"/>
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden">{tab.short}</span>
              {loadState[tab.key] === 'loading' && (
                <Loader2 size={10} className="relative z-10 animate-spin"/>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {state === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 size={32} className="animate-spin text-brand-saffron/60"/>
              <p className="text-sm text-gray-500">Loading from Google Sheets…</p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-400">
                <XCircle size={24}/>
              </div>
              <p className="text-sm text-gray-600 max-w-sm">
                Could not load this sheet. Make sure the Google Sheet is set to{' '}
                <strong className="text-gray-900">&ldquo;Anyone with the link can view&rdquo;</strong>.
              </p>
              <button onClick={() => fetchSheet(activeTab)}
                className="rounded-full border border-brand-saffron/30 bg-brand-saffron/10 px-5 py-2 text-xs font-semibold text-brand-saffron hover:bg-brand-saffron/20 transition-colors">
                Try Again
              </button>
            </motion.div>
          )}

          {state === 'done' && data && (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
              {activeTab === 'monthly' && <MonthlySheet sheet={data}/>}
              {activeTab === 'trend'   && <TrendSheet   sheet={data}/>}
              {activeTab === 'annual'  && <AnnualSheet  sheet={data}/>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-12 border-t border-gray-200 pt-6 pb-4">
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Complaint data is disclosed as mandated by SEBI for registered stock brokers.
            For unresolved grievances, write to{' '}
            <a href="mailto:grievances@alphamatrix.in"
              className="text-brand-saffron/70 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors">
              grievances@alphamatrix.in
            </a>{' '}or visit{' '}
            <a href="https://scores.sebi.gov.in" target="_blank" rel="noopener noreferrer"
              className="text-brand-saffron/70 hover:text-brand-saffron underline-offset-2 hover:underline transition-colors">
              scores.sebi.gov.in
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;