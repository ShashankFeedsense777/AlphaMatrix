import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box, Typography, Stack, Paper, Chip, Slider,
    TextField, InputAdornment, ToggleButton, ToggleButtonGroup,
    Divider, LinearProgress,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

// ─── Types ────────────────────────────────────────────────────────────────────

type InstrumentType = 'equity-futures' | 'index-futures' | 'equity-options' | 'index-options';
type PositionType   = 'buy' | 'sell';
type OptionType     = 'CE' | 'PE';

interface MarginInputs {
    instrument:    InstrumentType;
    position:      PositionType;
    optionType:    OptionType;
    symbol:        string;
    lotSize:       number;
    lots:          number;
    spotPrice:     number;
    strikePrice:   number;
    premium:       number;
    daysToExpiry:  number;
    volatility:    number;
}

interface MarginBreakdown {
    spanMargin:          number;
    exposureMargin:      number;
    premiumMargin:       number;
    totalInitialMargin:  number;
    maintenanceMargin:   number;
    orderMargin:         number;
    totalMargin:         number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORANGE = '#f97316';
const DARK   = '#0f1115';

const POPULAR_SYMBOLS: Record<InstrumentType, { symbol: string; lotSize: number; approxPrice: number }[]> = {
    'index-futures':  [
        { symbol: 'NIFTY',      lotSize: 25,  approxPrice: 24500 },
        { symbol: 'BANKNIFTY',  lotSize: 15,  approxPrice: 52000 },
        { symbol: 'FINNIFTY',   lotSize: 40,  approxPrice: 23500 },
        { symbol: 'MIDCPNIFTY', lotSize: 75,  approxPrice: 12500 },
        { symbol: 'SENSEX',     lotSize: 10,  approxPrice: 80000 },
    ],
    'equity-futures': [
        { symbol: 'RELIANCE',  lotSize: 250,  approxPrice: 2900 },
        { symbol: 'TCS',       lotSize: 150,  approxPrice: 4100 },
        { symbol: 'INFY',      lotSize: 400,  approxPrice: 1800 },
        { symbol: 'HDFCBANK',  lotSize: 550,  approxPrice: 1750 },
        { symbol: 'ICICIBANK', lotSize: 700,  approxPrice: 1300 },
        { symbol: 'SBIN',      lotSize: 1500, approxPrice: 820  },
        { symbol: 'WIPRO',     lotSize: 1500, approxPrice: 570  },
    ],
    'index-options':  [
        { symbol: 'NIFTY',      lotSize: 25,  approxPrice: 24500 },
        { symbol: 'BANKNIFTY',  lotSize: 15,  approxPrice: 52000 },
        { symbol: 'FINNIFTY',   lotSize: 40,  approxPrice: 23500 },
        { symbol: 'MIDCPNIFTY', lotSize: 75,  approxPrice: 12500 },
        { symbol: 'SENSEX',     lotSize: 10,  approxPrice: 80000 },
    ],
    'equity-options': [
        { symbol: 'RELIANCE',  lotSize: 250, approxPrice: 2900 },
        { symbol: 'TCS',       lotSize: 150, approxPrice: 4100 },
        { symbol: 'INFY',      lotSize: 400, approxPrice: 1800 },
        { symbol: 'HDFCBANK',  lotSize: 550, approxPrice: 1750 },
        { symbol: 'ICICIBANK', lotSize: 700, approxPrice: 1300 },
    ],
};

const SPAN_RATES: Record<InstrumentType, number> = {
    'index-futures':  0.08,
    'equity-futures': 0.12,
    'index-options':  0.09,
    'equity-options': 0.135,
};

const EXPOSURE_RATES: Record<InstrumentType, number> = {
    'index-futures':  0.03,
    'equity-futures': 0.05,
    'index-options':  0.03,
    'equity-options': 0.05,
};

// ─── Margin Engine ────────────────────────────────────────────────────────────

function calculateMargin(inputs: MarginInputs): MarginBreakdown {
    const { instrument, position, lotSize, lots, spotPrice, strikePrice, premium, volatility, daysToExpiry } = inputs;
    const totalQty       = lotSize * lots;
    const isOptions      = instrument === 'equity-options' || instrument === 'index-options';
    const isBuyOption    = isOptions && position === 'buy';
    const notionalValue  = spotPrice * totalQty;
    const spanRate       = SPAN_RATES[instrument];
    const exposureRate   = EXPOSURE_RATES[instrument];
    const volMultiplier  = 1 + Math.max(0, (volatility - 15) / 100);
    const dteAdjust      = isOptions ? 1 : Math.max(0.85, 1 - (30 - Math.min(daysToExpiry, 30)) / 300);

    let spanMargin = 0, exposureMargin = 0, premiumMargin = 0;
    if (isBuyOption) {
        premiumMargin = premium * totalQty;
    } else if (isOptions) {
        const strikeBased = strikePrice > 0 ? strikePrice : spotPrice;
        spanMargin        = strikeBased * totalQty * spanRate * volMultiplier * dteAdjust;
        exposureMargin    = notionalValue * exposureRate;
        premiumMargin     = premium * totalQty;
    } else {
        spanMargin     = notionalValue * spanRate * volMultiplier * dteAdjust;
        exposureMargin = notionalValue * exposureRate;
    }

    const totalInitialMargin = spanMargin + exposureMargin + premiumMargin;
    const maintenanceMargin  = totalInitialMargin * 0.75;
    const orderMargin        = totalInitialMargin * 0.1;
    const totalMargin        = totalInitialMargin + orderMargin;
    return { spanMargin, exposureMargin, premiumMargin, totalInitialMargin, maintenanceMargin, orderMargin, totalMargin };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr`
    : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L`
    : `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtFull = (n: number) =>
    `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ─── Shared sx helpers ────────────────────────────────────────────────────────

const sectionLabel = {
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#94a3b8',
    mb: 1,
};

const cardSx = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'grey.200',
    boxShadow: 'none',
    p: 2,
    bgcolor: '#fff',
};

const tfSx = {
    '& .MuiOutlinedInput-root': {
        fontSize: 14,
        fontWeight: 600,
        color: '#0f1115',
        bgcolor: '#fff',
        borderRadius: 2,
        '& fieldset': { borderColor: '#e2e8f0' },
        '&:hover fieldset': { borderColor: '#cbd5e1' },
        '&.Mui-focused fieldset': { borderColor: '#f97316', borderWidth: '1.5px' },
    },
    '& input': { py: '9px' },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MarginCalculator: React.FC = () => {
    const [inputs, setInputs] = useState<MarginInputs>({
        instrument: 'index-futures', position: 'buy', optionType: 'CE',
        symbol: 'NIFTY', lotSize: 25, lots: 1,
        spotPrice: 24500, strikePrice: 24500, premium: 200,
        daysToExpiry: 7, volatility: 15,
    });

    const set = <K extends keyof MarginInputs>(key: K, val: MarginInputs[K]) =>
        setInputs(prev => ({ ...prev, [key]: val }));

    const isOptions   = inputs.instrument === 'equity-options' || inputs.instrument === 'index-options';
    const isBuyOption = isOptions && inputs.position === 'buy';

    const handleInstrumentChange = (_: React.MouseEvent<HTMLElement>, val: string | null) => {
        if (!val) return;
        const inst  = val as InstrumentType;
        const first = POPULAR_SYMBOLS[inst][0];
        setInputs(prev => ({ ...prev, instrument: inst, symbol: first.symbol, lotSize: first.lotSize, spotPrice: first.approxPrice, strikePrice: first.approxPrice }));
    };

    const handleSymbol = (symbol: string) => {
        const match = POPULAR_SYMBOLS[inputs.instrument].find(s => s.symbol === symbol);
        if (match) setInputs(prev => ({ ...prev, symbol, lotSize: match.lotSize, spotPrice: match.approxPrice, strikePrice: match.approxPrice }));
    };

    const margin        = useMemo(() => calculateMargin(inputs), [inputs]);
    const notionalValue = inputs.spotPrice * inputs.lotSize * inputs.lots;
    const leverageRatio = notionalValue > 0 ? notionalValue / Math.max(margin.totalMargin, 1) : 0;
    const marginPct     = notionalValue > 0 ? (margin.totalMargin / notionalValue) * 100 : 0;
    const meterFill     = Math.min(100, marginPct * 4);
    const meterColor    = meterFill < 30 ? '#16a34a' : meterFill < 60 ? '#d97706' : '#dc2626';

    const breakdownItems = [
        { label: 'SPAN Margin',        value: margin.spanMargin,       color: ORANGE,    show: !isBuyOption },
        { label: 'Exposure Margin',    value: margin.exposureMargin,   color: '#6366f1', show: !isBuyOption },
        { label: isBuyOption ? 'Premium Payable' : 'Premium Margin', value: margin.premiumMargin, color: '#0ea5e9', show: isOptions },
        { label: 'Order Margin (10%)', value: margin.orderMargin,      color: '#10b981', show: true },
    ].filter(i => i.show && i.value > 0);

    const positionColor = inputs.position === 'buy' ? '#16a34a' : '#dc2626';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', fontFamily: '"Inter", sans-serif' }}>

            {/* ── Page header ── */}
            <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'grey.200', px: 3.5, py: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 2,
                        bgcolor: ORANGE, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TrendingUp sx={{ color: '#fff', fontSize: 20 }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: DARK, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                            F&O Margin Calculator
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                            NSE · BSE · Indicative
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* ── Two-column body ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 340px' }, minHeight: 'calc(100vh - 69px)' }}>

                {/* ─── LEFT: Inputs ─── */}
                <Box sx={{ p: { xs: 2, md: 3 }, borderRight: { lg: '1px solid' }, borderColor: { lg: 'grey.200' }, bgcolor: '#fff', overflowY: 'auto' }}>
                    <Stack spacing={3} sx={{ maxWidth: 600 }}>

                        {/* Instrument */}
                        <Box>
                            <Typography sx={sectionLabel}>Instrument Type</Typography>
                            <ToggleButtonGroup
                                exclusive fullWidth size="small"
                                value={inputs.instrument}
                                onChange={handleInstrumentChange}
                                sx={{
                                    border: '1px solid', borderColor: 'grey.200', borderRadius: 2, overflow: 'hidden',
                                    '& .MuiToggleButton-root': {
                                        border: 'none', borderRight: '1px solid', borderColor: 'grey.200',
                                        fontSize: 12, fontWeight: 600, textTransform: 'none', color: '#64748b', py: 1,
                                        '&.Mui-selected': { bgcolor: DARK, color: '#fff', '&:hover': { bgcolor: '#1e2330' } },
                                        '&:last-of-type': { borderRight: 'none' },
                                    },
                                }}
                            >
                                <ToggleButton value="index-futures">Index Fut</ToggleButton>
                                <ToggleButton value="equity-futures">Equity Fut</ToggleButton>
                                <ToggleButton value="index-options">Index Opt</ToggleButton>
                                <ToggleButton value="equity-options">Equity Opt</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {/* Position + Option type row */}
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={sectionLabel}>Position</Typography>
                                <ToggleButtonGroup
                                    exclusive fullWidth size="small"
                                    value={inputs.position}
                                    onChange={(_, v) => v && set('position', v as PositionType)}
                                    sx={{
                                        border: '1px solid', borderColor: 'grey.200', borderRadius: 2, overflow: 'hidden',
                                        '& .MuiToggleButton-root': {
                                            border: 'none', borderRight: '1px solid', borderColor: 'grey.200',
                                            fontSize: 12, fontWeight: 700, textTransform: 'none', color: '#64748b', py: 1,
                                            '&:last-of-type': { borderRight: 'none' },
                                            '&.Mui-selected': {
                                                bgcolor: positionColor,
                                                color: '#fff',
                                                '&:hover': { bgcolor: positionColor, filter: 'brightness(0.92)' },
                                            },
                                        },
                                    }}
                                >
                                    <ToggleButton value="buy">Buy / Long</ToggleButton>
                                    <ToggleButton value="sell">Sell / Short</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <AnimatePresence>
                                {isOptions && (
                                    <motion.div
                                        key="opttype"
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 12 }}
                                        transition={{ duration: 0.18 }}
                                        style={{ flex: 1 }}
                                    >
                                        <Typography sx={sectionLabel}>Option Type</Typography>
                                        <ToggleButtonGroup
                                            exclusive fullWidth size="small"
                                            value={inputs.optionType}
                                            onChange={(_, v) => v && set('optionType', v as OptionType)}
                                            sx={{
                                                border: '1px solid', borderColor: 'grey.200', borderRadius: 2, overflow: 'hidden',
                                                '& .MuiToggleButton-root': {
                                                    border: 'none', borderRight: '1px solid', borderColor: 'grey.200',
                                                    fontSize: 12, fontWeight: 700, textTransform: 'none', color: '#64748b', py: 1,
                                                    '&:last-of-type': { borderRight: 'none' },
                                                    '&.Mui-selected': { bgcolor: '#6366f1', color: '#fff', '&:hover': { bgcolor: '#4f46e5' } },
                                                },
                                            }}
                                        >
                                            <ToggleButton value="CE">Call (CE)</ToggleButton>
                                            <ToggleButton value="PE">Put (PE)</ToggleButton>
                                        </ToggleButtonGroup>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Stack>

                        {/* Symbols */}
                        <Box>
                            <Typography sx={sectionLabel}>Symbol</Typography>
                            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                                <AnimatePresence mode="popLayout">
                                    {POPULAR_SYMBOLS[inputs.instrument].map(s => (
                                        <motion.div
                                            key={`${inputs.instrument}-${s.symbol}`}
                                            initial={{ opacity: 0, scale: 0.88 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.88 }}
                                            transition={{ duration: 0.14 }}
                                        >
                                            <Chip
                                                label={s.symbol}
                                                onClick={() => handleSymbol(s.symbol)}
                                                size="small"
                                                sx={{
                                                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                                    border: '1px solid',
                                                    borderColor: inputs.symbol === s.symbol ? ORANGE : 'grey.200',
                                                    bgcolor: inputs.symbol === s.symbol ? 'rgba(249,115,22,0.08)' : '#f8fafc',
                                                    color: inputs.symbol === s.symbol ? ORANGE : '#64748b',
                                                    '&:hover': { bgcolor: 'rgba(249,115,22,0.06)', borderColor: ORANGE },
                                                    height: 30,
                                                }}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </Stack>
                        </Box>

                        {/* Lots + Lot size */}
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={sectionLabel}>Number of Lots</Typography>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={inputs.lots}
                                    onChange={e => set('lots', Math.max(1, parseInt(e.target.value) || 1))}
                                    slotProps={{ htmlInput: { min: 1 } }}
                                    sx={tfSx}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={sectionLabel}>Lot Size</Typography>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={inputs.lotSize}
                                    onChange={e => set('lotSize', Math.max(1, parseInt(e.target.value) || 1))}
                                    slotProps={{ htmlInput: { min: 1 }, input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 12, color: '#94a3b8' }}>qty</Typography></InputAdornment> } }}
                                    sx={tfSx}
                                />
                            </Box>
                        </Stack>

                        {/* Prices */}
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={sectionLabel}>{isOptions ? 'Spot / Underlying' : 'Futures Price'}</Typography>
                                <TextField
                                    fullWidth size="small" type="number"
                                    value={inputs.spotPrice}
                                    onChange={e => set('spotPrice', parseFloat(e.target.value) || 0)}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, color: '#94a3b8' }}>₹</Typography></InputAdornment> } }}
                                    sx={tfSx}
                                />
                            </Box>
                            {isOptions ? (
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={sectionLabel}>Strike Price</Typography>
                                    <TextField
                                        fullWidth size="small" type="number"
                                        value={inputs.strikePrice}
                                        onChange={e => set('strikePrice', parseFloat(e.target.value) || 0)}
                                        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, color: '#94a3b8' }}>₹</Typography></InputAdornment> } }}
                                        sx={tfSx}
                                    />
                                </Box>
                            ) : (
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={sectionLabel}>Contract Value</Typography>
                                    <Box sx={{ border: '1px solid', borderColor: 'rgba(249,115,22,0.25)', bgcolor: 'rgba(249,115,22,0.04)', borderRadius: 2, px: 1.5, py: '9px' }}>
                                        <Typography sx={{ fontSize: 15, fontWeight: 800, color: ORANGE, lineHeight: 1 }}>{fmt(notionalValue)}</Typography>
                                        <Typography sx={{ fontSize: 10, color: '#94a3b8', mt: 0.3 }}>{fmtFull(notionalValue)}</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>

                        {/* Options extras */}
                        <AnimatePresence>
                            {isOptions && (
                                <motion.div
                                    key="opts-extras"
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <Stack direction="row" spacing={2}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={sectionLabel}>Premium</Typography>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                value={inputs.premium}
                                                onChange={e => set('premium', parseFloat(e.target.value) || 0)}
                                                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, color: '#94a3b8' }}>₹</Typography></InputAdornment> } }}
                                                sx={tfSx}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={sectionLabel}>Days to Expiry</Typography>
                                            <TextField
                                                fullWidth size="small" type="number"
                                                value={inputs.daysToExpiry}
                                                onChange={e => set('daysToExpiry', Math.max(0, parseInt(e.target.value) || 0))}
                                                slotProps={{ input: { endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 12, color: '#94a3b8' }}>days</Typography></InputAdornment> } }}
                                                sx={tfSx}
                                            />
                                        </Box>
                                    </Stack>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Volatility */}
                        <Box>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography sx={sectionLabel}>Implied Volatility</Typography>
                                <Typography sx={{
                                    fontSize: 13, fontWeight: 800,
                                    color: inputs.volatility > 25 ? '#dc2626' : inputs.volatility > 18 ? '#d97706' : '#16a34a',
                                }}>
                                    {inputs.volatility}%
                                </Typography>
                            </Stack>
                            <Slider
                                min={8} max={80} step={0.5}
                                value={inputs.volatility}
                                onChange={(_, v) => set('volatility', v as number)}
                                sx={{
                                    color: ORANGE, height: 4,
                                    '& .MuiSlider-thumb': { width: 14, height: 14, '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px rgba(249,115,22,0.15)' } },
                                    '& .MuiSlider-rail': { bgcolor: '#e2e8f0' },
                                }}
                            />
                            <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.5 }}>
                                {['Low 8%', 'Normal 15%', 'High 30%', 'Panic 80%'].map(t => (
                                    <Typography key={t} sx={{ fontSize: 10, color: '#cbd5e1' }}>{t}</Typography>
                                ))}
                            </Stack>
                        </Box>

                        {/* Summary strip */}
                        <Paper elevation={0} sx={{ ...cardSx, bgcolor: '#f8fafc', p: 2 }}>
                            <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'grey.200' }} />} spacing={0}>
                                {[
                                    { label: 'Total Qty',      value: (inputs.lotSize * inputs.lots).toLocaleString('en-IN') },
                                    { label: 'Contract Value', value: fmt(notionalValue) },
                                    { label: 'Leverage',       value: `${leverageRatio.toFixed(1)}×` },
                                ].map(item => (
                                    <Box key={item.label} sx={{ flex: 1, px: 2, '&:first-of-type': { pl: 0 }, '&:last-of-type': { pr: 0 } }}>
                                        <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.4 }}>
                                            {item.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: 16, fontWeight: 800, color: DARK }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>

                    </Stack>
                </Box>

                {/* ─── RIGHT: Results ─── */}
                <Box sx={{ p: { xs: 2, md: 2.5 }, bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1.75, overflowY: 'auto' }}>

                    {/* Total margin hero */}
                    <motion.div key={margin.totalMargin} layout>
                        <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: DARK, overflow: 'hidden', position: 'relative', p: '20px 20px 18px' }}>
                            {/* subtle dot grid */}
                            <Box sx={{
                                position: 'absolute', inset: 0, opacity: 0.035,
                                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }} />
                            <Box sx={{ position: 'relative' }}>
                                <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569', mb: 1 }}>
                                    Total Margin Required
                                </Typography>

                                <motion.div
                                    key={fmt(margin.totalMargin)}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.22 }}
                                >
                                    <Typography sx={{ fontSize: 36, fontWeight: 800, color: ORANGE, lineHeight: 1, letterSpacing: '-0.03em' }}>
                                        {fmt(margin.totalMargin)}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#334155', mt: 0.4, mb: 1.75 }}>
                                        {fmtFull(margin.totalMargin)}
                                    </Typography>
                                </motion.div>

                                <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
                                    <Typography sx={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        Margin / Contract
                                    </Typography>
                                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: meterColor }}>
                                        {marginPct.toFixed(1)}%
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={meterFill}
                                    sx={{
                                        height: 5, borderRadius: 999, bgcolor: '#1e293b',
                                        '& .MuiLinearProgress-bar': { bgcolor: meterColor, borderRadius: 999, transition: 'transform 0.4s ease' },
                                    }}
                                />
                            </Box>
                        </Paper>
                    </motion.div>

                    {/* Breakdown */}
                    <Paper elevation={0} sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
                        <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                            <Typography sx={{ ...sectionLabel, mb: 0 }}>Margin Breakdown</Typography>
                        </Box>
                        <AnimatePresence>
                            {breakdownItems.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15, delay: i * 0.04 }}
                                >
                                    <Stack
                                        direction="row"
                                        sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.25, borderBottom: i < breakdownItems.length - 1 ? '1px solid' : 'none', borderColor: 'grey.50' }}
                                    >
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                                            <Typography sx={{ fontSize: 13, color: '#64748b' }}>{item.label}</Typography>
                                        </Stack>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: DARK }}>{fmt(item.value)}</Typography>
                                    </Stack>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.25, bgcolor: '#f8fafc', borderTop: '1px solid', borderColor: 'grey.200' }}
                        >
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Initial Margin</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 800, color: DARK }}>{fmt(margin.totalInitialMargin)}</Typography>
                        </Stack>
                    </Paper>

                    {/* Maintenance + MTM */}
                    <Stack direction="row" spacing={1.5}>
                        {[
                            { label: 'Maintenance Margin', value: fmt(margin.maintenanceMargin),      sub: '75% of initial',     accent: '#d97706', bg: 'rgba(217,119,6,0.06)',  border: 'rgba(217,119,6,0.2)'  },
                            { label: 'MTM Call Threshold', value: fmt(margin.maintenanceMargin * 0.9), sub: 'Margin call trigger', accent: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)' },
                        ].map(item => (
                            <Box key={item.label} sx={{ flex: 1, bgcolor: item.bg, border: `1px solid ${item.border}`, borderRadius: 3, p: 1.75 }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', mb: 0.75, lineHeight: 1.4 }}>{item.label}</Typography>
                                <Typography sx={{ fontSize: 16, fontWeight: 800, color: item.accent, letterSpacing: '-0.02em', mb: 0.25 }}>{item.value}</Typography>
                                <Typography sx={{ fontSize: 10, color: '#94a3b8' }}>{item.sub}</Typography>
                            </Box>
                        ))}
                    </Stack>

                    {/* Per-lot */}
                    <Paper elevation={0} sx={cardSx}>
                        <Typography sx={{ ...sectionLabel, mb: 1.5 }}>Per Lot</Typography>
                        <Stack direction="row" spacing={2}>
                            {[
                                { label: 'Margin / Lot',    value: fmt(margin.totalMargin / inputs.lots) },
                                { label: 'Break-even Move', value: `${marginPct.toFixed(2)}%` },
                            ].map(item => (
                                <Box key={item.label} sx={{ flex: 1 }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5 }}>{item.label}</Typography>
                                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: DARK }}>{item.value}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Disclaimer */}
                    <Box sx={{ px: 1.5, py: 1.25, bgcolor: '#fff', border: '1px solid', borderColor: 'grey.200', borderRadius: 2 }}>
                        <Typography sx={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.7 }}>
                            ⚠ Indicative only. Actual margins are set by the NSE/BSE SPAN+Exposure model and may vary with volatility, corporate actions, and exchange circulars. Verify with your broker before trading.
                        </Typography>
                    </Box>

                </Box>
            </Box>
        </Box>
    );
};

export default MarginCalculator;