import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box, Typography, Stack, Paper,
} from '@mui/material';
import {
    TrendingUp, TrendingDown, BarChart3, Activity,
    Clock, DollarSign, Zap, RefreshCw,
} from 'lucide-react';

const NAVY   = '#0a1628';
const BLUE   = '#1565c0';
const LBLUE  = '#e8f0fe';
const BORDER = '#d0d9e8';
const BG     = '#f0f4fa';

const dummyVWAPData = {
    current: 18472.35,
    previous: 18421.80,
    high: 18510.20,
    low: 18395.45,
    volume: 1256789,
    turnover: 23214789000,
    change: 50.55,
    changePercent: 0.27,
};

const dummyHistory = [
    { time: '09:15', vwap: 18410.20, price: 18405.50, volume: 45210 },
    { time: '09:30', vwap: 18422.45, price: 18430.10, volume: 82340 },
    { time: '09:45', vwap: 18435.80, price: 18428.90, volume: 110200 },
    { time: '10:00', vwap: 18441.30, price: 18455.60, volume: 142560 },
    { time: '10:15', vwap: 18448.90, price: 18462.30, volume: 175890 },
    { time: '10:30', vwap: 18452.15, price: 18448.75, volume: 198340 },
    { time: '10:45', vwap: 18458.40, price: 18470.10, volume: 221450 },
    { time: '11:00', vwap: 18463.75, price: 18458.20, volume: 245670 },
    { time: '11:15', vwap: 18468.30, price: 18475.80, volume: 268900 },
    { time: '11:30', vwap: 18472.35, price: 18469.40, volume: 289120 },
];

const symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC'];

const fmtINR = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtVolume = (n: number) =>
    n >= 10000000 ? `${(n / 10000000).toFixed(2)}Cr`
        : n >= 100000 ? `${(n / 100000).toFixed(1)}L`
            : n.toLocaleString('en-IN');

const VWAP: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');
    const isUp = dummyVWAPData.change >= 0;

    const stats = [
        { label: 'VWAP', value: fmtINR(dummyVWAPData.current), sub: `₹${fmtINR(dummyVWAPData.change)} (${dummyVWAPData.changePercent}%)`, up: isUp, icon: Activity },
        { label: 'Day High', value: fmtINR(dummyVWAPData.high), icon: TrendingUp, color: '#16a34a' },
        { label: 'Day Low', value: fmtINR(dummyVWAPData.low), icon: TrendingDown, color: '#dc2626' },
        { label: 'Volume', value: fmtVolume(dummyVWAPData.volume), icon: BarChart3 },
        { label: 'Turnover', value: `₹${fmtINR(dummyVWAPData.turnover)}`, icon: DollarSign },
    ];

    return (
        <Box sx={{ minHeight: '100%', bgcolor: '#f7f8fb', fontFamily: '"Inter", "Roboto", sans-serif', pb: 3 }}>
            <Box sx={{ px: '16px', py: '24px', '@media (min-width: 640px)': { px: '32px' }, '@media (min-width: 1024px)': { px: '40px' } }}>
                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Paper elevation={0} sx={{
                        mb: 3, px: { xs: 2.5, md: 3 }, py: 3,
                        borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: '#fff',
                        backgroundImage: `radial-gradient(ellipse at 20% 40%, rgba(21,101,192,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 60%, rgba(22,163,74,0.04) 0%, transparent 50%)`,
                    }}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{
                                width: 32, height: 32, borderRadius: 1.5,
                                background: `linear-gradient(135deg, ${BLUE}, #0d47a1)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Activity size={16} style={{ color: '#fff' }} />
                            </Box>
                            <Typography sx={{
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                                color: '#6b7fa3', border: `1px solid ${BORDER}`, borderRadius: '50px',
                                px: 1.5, py: 0.5, lineHeight: 1.6,
                            }}>
                                Live Analytics
                            </Typography>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
                            <Box>
                                <Typography sx={{ fontSize: 28, fontWeight: 600, color: NAVY, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                                    Volume Weighted Average Price
                                </Typography>
                                <Typography sx={{ fontSize: 13, color: '#6b7fa3', mt: 0.5, fontWeight: 400, maxWidth: 480 }}>
                                    Real-time VWAP tracker — compare trade prices against the volume-weighted benchmark across major indices and stocks.
                                </Typography>
                            </Box>
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                border: `1.5px solid ${BORDER}`, borderRadius: '50px',
                                px: 2, py: 0.75, bgcolor: '#f8fafc',
                                alignSelf: { xs: 'stretch', sm: 'auto' },
                                minWidth: 140,
                            }}>
                                <Zap size={14} style={{ color: '#6b7fa3', flexShrink: 0 }} />
                                <Box
                                    component="select"
                                    value={selectedSymbol}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSymbol(e.target.value)}
                                    sx={{
                                        border: 'none', outline: 'none', bgcolor: 'transparent',
                                        fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: 'inherit',
                                        cursor: 'pointer', width: '100%',
                                    }}
                                >
                                    {['NIFTY', 'BANKNIFTY', 'FINNIFTY', ...symbols].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>
                </motion.div>

                {/* ── Stats Grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 }}
                >
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
                        gap: 2, mb: 3,
                    }}>
                        {stats.map((stat) => (
                            <Paper key={stat.label} elevation={0} sx={{
                                borderRadius: 2.5, border: `1px solid ${BORDER}`, bgcolor: '#fff',
                                p: 2.5, boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
                            }}>
                                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#6b7fa3' }}>
                                        {stat.label}
                                    </Typography>
                                    <stat.icon size={14} style={{ color: (stat as any).color || '#6b7fa3', flexShrink: 0 }} />
                                </Stack>
                                <Typography sx={{ fontSize: 18, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                    {stat.value}
                                </Typography>
                                {'sub' in stat && (
                                    <Typography sx={{ fontSize: 11, fontWeight: 600, color: (stat as any).up ? '#16a34a' : '#dc2626', mt: 0.25 }}>
                                        {(stat as any).sub}
                                    </Typography>
                                )}
                            </Paper>
                        ))}
                    </Box>
                </motion.div>

                {/* ── Main Content: Chart + Table ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' }, gap: 3 }}>
                    {/* Chart Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.12 }}
                    >
                        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,22,40,0.04)' }}>
                            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                    VWAP vs Price
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: BLUE }} />
                                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#6b7fa3' }}>VWAP</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#f97316' }} />
                                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#6b7fa3' }}>Price</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                            <Box sx={{ p: 2.5 }}>
                                <Box sx={{ width: '100%', height: 280, borderRadius: 2, bgcolor: '#fafcff', position: 'relative', overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                                    {[0, 1, 2, 3, 4].map(i => (
                                        <Box key={i} sx={{ position: 'absolute', left: 0, right: 0, top: `${20 + i * 15}%`, borderTop: `1px dashed rgba(10,22,40,0.06)`, zIndex: 0 }} />
                                    ))}
                                    <svg width="100%" height="100%" viewBox="0 0 200 280" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                                        <defs>
                                            <linearGradient id="vwapGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={`${BLUE}30`} />
                                                <stop offset="100%" stopColor={`${BLUE}02`} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0 240 Q20 230 40 200 Q60 170 80 160 Q100 140 120 120 Q140 100 160 80 Q180 60 200 55" fill="none" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" />
                                        <path d="M0 240 Q20 230 40 200 Q60 170 80 160 Q100 140 120 120 Q140 100 160 80 Q180 60 200 55 L200 280 L0 280 Z" fill="url(#vwapGrad)" />
                                        <path d="M0 230 Q20 225 40 210 Q60 195 80 190 Q100 165 120 135 Q140 115 160 95 Q180 70 200 65" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" />
                                    </svg>
                                    <Box sx={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', px: 2, zIndex: 2 }}>
                                        {['09:15', '09:45', '10:15', '10:45', '11:30'].map(t => (
                                            <Typography key={t} sx={{ fontSize: 9, fontWeight: 500, color: '#94a3b8' }}>{t}</Typography>
                                        ))}
                                    </Box>
                                </Box>
                                <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
                                    {['1D', '1W', '1M', '3M', '1Y'].map(p => (
                                        <Box key={p} component="button" sx={{
                                            border: 'none', bgcolor: p === '1D' ? LBLUE : 'transparent',
                                            color: p === '1D' ? BLUE : '#6b7fa3',
                                            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                                            borderRadius: '50px', px: 2, py: 0.5, cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}>{p}</Box>
                                    ))}
                                </Stack>
                            </Box>
                        </Paper>
                    </motion.div>

                    {/* History Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.16 }}
                    >
                        <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,22,40,0.04)' }}>
                            <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                    Price History
                                </Typography>
                                <RefreshCw size={14} style={{ color: '#6b7fa3', cursor: 'pointer' }} />
                            </Box>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                    <Box component="thead">
                                        <Box component="tr" sx={{ bgcolor: '#f8fafc' }}>
                                            {['Time', 'VWAP (₹)', 'Price (₹)', 'Volume'].map(h => (
                                                <Box key={h} component="th" sx={{
                                                    px: 2, py: 1.25, textAlign: 'left',
                                                    fontSize: 10, fontWeight: 700, color: '#6b7fa3',
                                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
                                                }}>{h}</Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    <Box component="tbody">
                                        {dummyHistory.slice().reverse().map((row, i) => (
                                            <motion.tr
                                                key={row.time}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.15, delay: i * 0.015 }}
                                                style={{ borderBottom: `1px solid ${BG}` }}
                                            >
                                                <Box component="td" sx={{ px: 2, py: 1.5, fontWeight: 600, color: '#6b7fa3', whiteSpace: 'nowrap' }}>
                                                    <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle', opacity: 0.5 }} />
                                                    {row.time}
                                                </Box>
                                                <Box component="td" sx={{ px: 2, py: 1.5, fontWeight: 700, color: NAVY }}>
                                                    {fmtINR(row.vwap)}
                                                </Box>
                                                <Box component="td" sx={{ px: 2, py: 1.5, fontWeight: 700, color: row.price >= row.vwap ? '#16a34a' : '#dc2626' }}>
                                                    {fmtINR(row.price)}
                                                </Box>
                                                <Box component="td" sx={{ px: 2, py: 1.5, fontWeight: 600, color: '#3d5275' }}>
                                                    {fmtVolume(row.volume)}
                                                </Box>
                                            </motion.tr>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box>

                {/* ── Bottom Section: Symbol VWAP Table ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Paper elevation={0} sx={{ mt: 3, borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 1px 3px rgba(10,22,40,0.04)' }}>
                        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}` }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                Sector-wise VWAP Comparison
                            </Typography>
                        </Box>
                        <Box sx={{ overflowX: 'auto' }}>
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                <Box component="thead">
                                    <Box component="tr" sx={{ bgcolor: '#f8fafc' }}>
                                        {['Symbol', 'VWAP (₹)', 'LTP (₹)', 'Volume', 'Turnover (Cr)', 'Deviation'].map(h => (
                                            <Box key={h} component="th" sx={{
                                                px: 2.5, py: 1.5, textAlign: 'left',
                                                fontSize: 10, fontWeight: 700, color: '#6b7fa3',
                                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                                borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
                                            }}>{h}</Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    {symbols.map((sym, i) => {
                                        const vwap = 18000 + Math.random() * 2000;
                                        const ltp = vwap + (Math.random() - 0.5) * 100;
                                        const vol = Math.floor(500000 + Math.random() * 5000000);
                                        const dev = ((ltp - vwap) / vwap * 100);
                                        return (
                                            <motion.tr
                                                key={sym}
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.15, delay: i * 0.025 }}
                                                style={{ borderBottom: `1px solid ${BG}` }}
                                            >
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 700, color: NAVY }}>{sym}</Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 700, color: NAVY }}>{fmtINR(vwap)}</Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 700, color: dev >= 0 ? '#16a34a' : '#dc2626' }}>
                                                    {fmtINR(ltp)}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 600, color: '#3d5275' }}>{fmtVolume(vol)}</Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 600, color: '#3d5275' }}>
                                                    {(vol * ltp / 10000000).toFixed(1)}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2 }}>
                                                    <Box sx={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                        px: 1.25, py: 0.35, borderRadius: '50px',
                                                        bgcolor: dev >= 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                                                        color: dev >= 0 ? '#16a34a' : '#dc2626',
                                                        fontWeight: 700, fontSize: 11,
                                                    }}>
                                                        {dev >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                                                        {dev >= 0 ? '+' : ''}{dev.toFixed(2)}%
                                                    </Box>
                                                </Box>
                                            </motion.tr>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                </motion.div>

                <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 2.5, textAlign: 'center', lineHeight: 1.8 }}>
                    VWAP is calculated as the ratio of the cumulative trade value (price × volume) to the cumulative volume over a given time window.
                    Data shown is for illustrative purposes and may be delayed.
                </Typography>
            </Box>
        </Box>
    );
};

export default VWAP;
