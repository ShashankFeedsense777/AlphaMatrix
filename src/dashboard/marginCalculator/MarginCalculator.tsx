import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box, Typography, Stack, Paper, MenuItem, Select,
    FormControl, RadioGroup, FormControlLabel, Radio,
    IconButton, Chip, Divider, Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// ─── Types ────────────────────────────────────────────────────────────────────
type Exchange = 'NFO' | 'BFO';
type Segment  = 'Futures' | 'Options';
type Action   = 'B' | 'S';

interface Scrip {
    symbol:   string;
    expiry:   string;
    lotSize:  number;
    price:    number;       // approximate underlying price
    strikePrice?: number;   // for options
}

interface TableRow {
    id:            number;
    exchange:      Exchange;
    scrip:         Scrip;
    segment:       Segment;
    strike:        string;
    quantity:      number;
    action:        Action;
    spanMargin:    number;
    exposure:      number;
    total:         number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SCRIPS: Record<Exchange, Record<Segment, Scrip[]>> = {
    NFO: {
        Futures: [
            { symbol: 'NIFTY',      expiry: '30-Jun-26', lotSize: 75,  price: 24600 },
            { symbol: 'BANKNIFTY',  expiry: '30-Jun-26', lotSize: 30,  price: 52200 },
            { symbol: 'FINNIFTY',   expiry: '30-Jun-26', lotSize: 65,  price: 23800 },
            { symbol: 'MIDCPNIFTY', expiry: '30-Jun-26', lotSize: 75,  price: 12600 },
            { symbol: 'RELIANCE',   expiry: '30-Jun-26', lotSize: 250, price: 2920  },
            { symbol: 'TCS',        expiry: '30-Jun-26', lotSize: 150, price: 4120  },
            { symbol: 'HDFCBANK',   expiry: '30-Jun-26', lotSize: 550, price: 1760  },
            { symbol: 'ICICIBANK',  expiry: '30-Jun-26', lotSize: 700, price: 1310  },
            { symbol: 'SBIN',       expiry: '30-Jun-26', lotSize: 1500,price: 825   },
            { symbol: 'INFY',       expiry: '30-Jun-26', lotSize: 400, price: 1805  },
        ],
        Options: [
            { symbol: 'NIFTY',     expiry: '30-Jun-26', lotSize: 75,  price: 24600, strikePrice: 24500 },
            { symbol: 'BANKNIFTY', expiry: '30-Jun-26', lotSize: 30,  price: 52200, strikePrice: 52000 },
            { symbol: 'FINNIFTY',  expiry: '30-Jun-26', lotSize: 65,  price: 23800, strikePrice: 23800 },
            { symbol: 'RELIANCE',  expiry: '30-Jun-26', lotSize: 250, price: 2920,  strikePrice: 2900  },
            { symbol: 'TCS',       expiry: '30-Jun-26', lotSize: 150, price: 4120,  strikePrice: 4100  },
        ],
    },
    BFO: {
        Futures: [
            { symbol: 'SENSEX',    expiry: '30-Jun-26', lotSize: 10,  price: 80500 },
            { symbol: 'BANKEX',    expiry: '30-Jun-26', lotSize: 15,  price: 57000 },
        ],
        Options: [
            { symbol: 'SENSEX',    expiry: '30-Jun-26', lotSize: 10,  price: 80500, strikePrice: 80000 },
            { symbol: 'BANKEX',    expiry: '30-Jun-26', lotSize: 15,  price: 57000, strikePrice: 57000 },
        ],
    },
};

// ─── Margin engine (SPAN-like approximation) ──────────────────────────────────
// NFO Futures: SPAN ~8%, Exposure ~3%
// NFO Options sell: SPAN ~9%, Exposure ~3%; buy: premium only
const SPAN_RATE: Record<Exchange, Record<Segment, number>> = {
    NFO: { Futures: 0.08,  Options: 0.09  },
    BFO: { Futures: 0.095, Options: 0.105 },
};
const EXP_RATE: Record<Exchange, Record<Segment, number>> = {
    NFO: { Futures: 0.03,  Options: 0.03  },
    BFO: { Futures: 0.035, Options: 0.035 },
};

function computeMargin(
    exchange: Exchange,
    segment:  Segment,
    scrip:    Scrip,
    qty:      number,
    action:   Action,
): { span: number; exposure: number; total: number } {
    const notional    = scrip.price * qty;
    const spanRate    = SPAN_RATE[exchange][segment];
    const expRate     = EXP_RATE[exchange][segment];

    // Options Buy: only premium margin (indicative ~2% of notional)
    if (segment === 'Options' && action === 'B') {
        const premium = notional * 0.02;
        return { span: 0, exposure: 0, total: premium };
    }

    const span     = Math.round(notional * spanRate);
    const exposure = Math.round(notional * expRate);
    return { span, exposure, total: span + exposure };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Styled sub-components ────────────────────────────────────────────────────
const NAVY  = '#0a1628';
const BLUE  = '#1565c0';
const LBLUE = '#e8f0fe';
const BORDER= '#d0d9e8';
const BG    = '#f0f4fa';

const selectSx = {
    bgcolor: '#fff',
    fontSize: 14,
    fontWeight: 600,
    color: NAVY,
    borderRadius: '50px',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER, borderWidth: 1.5 },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8dacd4' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: BLUE, borderWidth: 2 },
    '& .MuiSelect-select': { py: '9px', px: '16px' },
};

// ─── Autocomplete scrip input ─────────────────────────────────────────────────
interface ScripInputProps {
    options: Scrip[];
    value:   string;
    onChange:(s: Scrip) => void;
    error?:  boolean;
}
const ScripInput: React.FC<ScripInputProps> = ({ options, value, onChange, error }) => {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState(value);
    const ref               = useRef<HTMLDivElement>(null);

    useEffect(() => { setQuery(value); }, [value]);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options.filter(o =>
        `${o.symbol} ${o.expiry}`.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Box ref={ref} sx={{ position: 'relative' }}>
            <Box
                component="input"
                value={query}
                placeholder="Search scrip e.g. NIFTY"
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `1.5px solid ${error ? '#d32f2f' : BORDER}`,
                    borderRadius: 50, fontSize: 14, fontWeight: 600,
                    color: NAVY, padding: '9px 18px', outline: 'none',
                    fontFamily: 'inherit', background: '#fff',
                }}
                onMouseEnter={e => { (e.target as HTMLInputElement).style.borderColor = '#8dacd4'; }}
                onMouseLeave={e => { (e.target as HTMLInputElement).style.borderColor = error ? '#d32f2f' : BORDER; }}
            />
            {error && (
                <Typography sx={{ fontSize: 11, color: '#d32f2f', mt: 0.5, ml: 1.5 }}>
                    Please enter symbol
                </Typography>
            )}
            <AnimatePresence>
                {open && filtered.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.13 }}
                        style={{
                            position: 'absolute', top: '110%', left: 0, right: 0,
                            background: '#fff', border: `1px solid ${BORDER}`,
                            borderRadius: 12, zIndex: 200,
                            boxShadow: '0 8px 24px rgba(10,22,40,0.12)',
                            overflow: 'hidden', maxHeight: 260, overflowY: 'auto',
                        }}
                    >
                        {filtered.map((s, i) => (
                            <Box
                                key={i}
                                onMouseDown={() => {
                                    onChange(s);
                                    setQuery(`${s.symbol} ${s.expiry}`);
                                    setOpen(false);
                                }}
                                sx={{
                                    px: 2.5, py: 1.25, cursor: 'pointer', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    '&:hover': { bgcolor: LBLUE },
                                    borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : 'none',
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                        {s.symbol}
                                    </Typography>
                                    <Typography sx={{ fontSize: 11, color: '#6b7fa3' }}>{s.expiry}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 11, color: '#6b7fa3' }}>
                                    Lot: {s.lotSize}
                                </Typography>
                            </Box>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
let nextId = 1;

const MarginCalculator: React.FC = () => {
    const [exchange, setExchange] = useState<Exchange>('NFO');
    const [segment,  setSegment]  = useState<Segment>('Futures');
    const [scrip,    setScrip]    = useState<Scrip | null>(null);
    const [action,   setAction]   = useState<Action>('B');
    const [quantity, setQuantity] = useState<number>(0);
    const [rows,     setRows]     = useState<TableRow[]>([]);
    const [errors,   setErrors]   = useState<{ exchange?: boolean; scrip?: boolean }>({});
    const [segOpen,  setSegOpen]  = useState(false);

    const scripOptions = SCRIPS[exchange]?.[segment] ?? [];
    const lotSize      = scrip?.lotSize ?? (scripOptions[0]?.lotSize ?? 1);

    // combined margin shown in right panel = sum of table rows
    const combined = useMemo(() => {
        if (rows.length === 0 && scrip) {
            // preview of current form inputs
            const qty = quantity > 0 ? quantity : lotSize;
            const { span, exposure, total } = computeMargin(exchange, segment, scrip, qty, action);
            return { span, exposure, total, benefit: 0 };
        }
        const span     = rows.reduce((a, r) => a + r.spanMargin, 0);
        const exposure = rows.reduce((a, r) => a + r.exposure,   0);
        const total    = rows.reduce((a, r) => a + r.total,      0);
        return { span, exposure, total, benefit: 0 };
    }, [rows, scrip, quantity, exchange, segment, action, lotSize]);

    const handleExchangeChange = (val: Exchange) => {
        setExchange(val);
        setScrip(null);
        setQuantity(0);
        setErrors({});
    };

    const handleSegmentChange = (val: Segment) => {
        setSegment(val);
        setScrip(null);
        setQuantity(0);
    };

    const handleAddToTable = () => {
        const newErrors: typeof errors = {};
        if (!scrip) newErrors.scrip = true;
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
        setErrors({});

        const qty = quantity > 0 ? quantity : lotSize;
        const { span, exposure, total } = computeMargin(exchange, segment, scrip!, qty, action);

        const row: TableRow = {
            id:         nextId++,
            exchange,
            scrip:      scrip!,
            segment,
            strike:     scrip?.strikePrice ? String(scrip.strikePrice) : 'N/A',
            quantity:   qty,
            action,
            spanMargin: span,
            exposure,
            total,
        };
        setRows(prev => [...prev, row]);
        // reset form
        setScrip(null);
        setQuantity(0);
    };

    const handleReset = () => {
        setRows([]);
        setScrip(null);
        setQuantity(0);
        setExchange('NFO');
        setSegment('Futures');
        setAction('B');
        setErrors({});
    };

    const handleDelete = (id: number) => {
        setRows(prev => prev.filter(r => r.id !== id));
    };

    const grandTotal = rows.reduce((a, r) => a + r.total, 0);

    // preview combined (live, from form)
    const previewMargin = useMemo(() => {
        if (!scrip) return null;
        const qty = quantity > 0 ? quantity : lotSize;
        return computeMargin(exchange, segment, scrip, qty, action);
    }, [scrip, quantity, exchange, segment, action, lotSize]);

    const displayMargin = rows.length > 0
        ? { span: combined.span, exposure: combined.exposure, total: combined.total }
        : (previewMargin ?? { span: 0, exposure: 0, total: 0 });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: BG, fontFamily: '"Inter", "Roboto", sans-serif' }}>
            {/* ── Header ── */}
            <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${BORDER}`, px: 3, py: 2 }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box sx={{
                        width: 34, height: 34, borderRadius: 2,
                        background: `linear-gradient(135deg, ${BLUE}, #0d47a1)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TrendingUpIcon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>
                        F&O Margin Calculator
                    </Typography>
                </Stack>
            </Box>

            {/* ── Main card ── */}
            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
                <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, overflow: 'hidden', bgcolor: '#fff' }}>
                    {/* Top form area */}
                    <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr auto' },
                            gap: 3,
                            alignItems: 'start',
                        }}>
                            {/* Left inputs */}
                            <Box sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 2,
                                    mb: 2.5,
                                }}>
                                    {/* Exchange */}
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                            Exchange
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={exchange}
                                                onChange={e => handleExchangeChange(e.target.value as Exchange)}
                                                sx={selectSx}
                                            >
                                                <MenuItem value="NFO">NFO</MenuItem>
                                                <MenuItem value="BFO">BFO</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    {/* Segment */}
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                            Segment
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={segment}
                                                open={segOpen}
                                                onOpen={() => setSegOpen(true)}
                                                onClose={() => setSegOpen(false)}
                                                onChange={e => handleSegmentChange(e.target.value as Segment)}
                                                sx={selectSx}
                                            >
                                                <MenuItem value="Futures">Futures</MenuItem>
                                                <MenuItem value="Options">Options</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                {/* Scrip */}
                                <Box sx={{ mb: 2.5 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                        Select Scrip
                                    </Typography>
                                    <ScripInput
                                        options={scripOptions}
                                        value={scrip ? `${scrip.symbol} ${scrip.expiry}` : ''}
                                        onChange={s => { setScrip(s); setQuantity(s.lotSize); setErrors(e => ({ ...e, scrip: false })); }}
                                        error={errors.scrip}
                                    />
                                </Box>

                                {/* Action + Quantity */}
                                <Box sx={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 2,
                                    alignItems: 'center',
                                }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.5, ml: 0.5 }}>
                                            Action
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={action}
                                            onChange={e => setAction(e.target.value as Action)}
                                            sx={{ gap: 1 }}
                                        >
                                            {[
                                                { val: 'B', label: 'Buy' },
                                                { val: 'S', label: 'Sell' },
                                            ].map(({ val, label }) => (
                                                <FormControlLabel
                                                    key={val}
                                                    value={val}
                                                    label={label}
                                                    control={
                                                        <Radio
                                                            size="small"
                                                            sx={{
                                                                color: '#c0c8d8',
                                                                '&.Mui-checked': { color: '#16a34a' },
                                                                p: '6px',
                                                            }}
                                                        />
                                                    }
                                                    sx={{
                                                        mr: 0,
                                                        '& .MuiFormControlLabel-label': {
                                                            fontSize: 14, fontWeight: 700,
                                                            color: action === val ? '#16a34a' : NAVY,
                                                        },
                                                    }}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Box>
                                    <Box>
                                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5, mr: 0.5 }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', ml: 0.5 }}>
                                                Quantity
                                            </Typography>
                                            <Typography sx={{ fontSize: 11, color: '#6b7fa3' }}>
                                                (Lot size {lotSize})
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" sx={{
                                            alignItems: 'center',
                                            border: `1.5px solid ${BORDER}`, borderRadius: '50px',
                                            bgcolor: '#fff', overflow: 'hidden', height: 40,
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => setQuantity(q => Math.max(0, q - lotSize))}
                                                sx={{ borderRadius: 0, px: 1.5, color: NAVY, flexShrink: 0, '&:hover': { bgcolor: LBLUE } }}
                                            >
                                                <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>−</Typography>
                                            </IconButton>
                                            <Box
                                                component="input"
                                                type="number"
                                                value={quantity}
                                                onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                                style={{
                                                    flex: 1, border: 'none', outline: 'none',
                                                    textAlign: 'center', fontSize: 14, fontWeight: 700,
                                                    color: NAVY, background: 'transparent', fontFamily: 'inherit',
                                                    minWidth: 0,
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => setQuantity(q => q + lotSize)}
                                                sx={{ borderRadius: 0, px: 1.5, color: NAVY, flexShrink: 0, '&:hover': { bgcolor: LBLUE } }}
                                            >
                                                <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</Typography>
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                </Box>

                                {/* Buttons */}
                                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                    <Box
                                        component="button"
                                        onClick={handleAddToTable}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: NAVY, color: '#fff', border: 'none',
                                            borderRadius: 50, padding: '10px 22px',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit', letterSpacing: '0.01em',
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a2540'; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = NAVY; }}
                                    >
                                        <AddIcon sx={{ fontSize: 16 }} />
                                        Add to Table
                                    </Box>
                                    <Box
                                        component="button"
                                        onClick={handleReset}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: 'transparent', color: '#6b7fa3',
                                            border: `1.5px solid ${BORDER}`,
                                            borderRadius: 50, padding: '10px 22px',
                                            fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}
                                        onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#8dacd4'; b.style.color = NAVY; }}
                                        onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = BORDER; b.style.color = '#6b7fa3'; }}
                                    >
                                        <RefreshIcon sx={{ fontSize: 15 }} />
                                        Reset Table
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Right: Combined margin requirements */}
                            <Box sx={{ gridColumn: { xs: '1', md: '3 / 5' } }}>
                                <Paper elevation={0} sx={{
                                    borderRadius: 2.5, overflow: 'hidden',
                                    border: `1px solid ${BORDER}`,
                                }}>
                                    <Box sx={{
                                        bgcolor: NAVY, px: 2.5, py: 1.75, textAlign: 'center',
                                    }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
                                            Combined margin requirements
                                        </Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: '#f4f7fc', p: 0 }}>
                                        {[
                                            { label: 'Span',           value: displayMargin.span,     highlight: false },
                                            { label: 'Exposure Margin',value: displayMargin.exposure,  highlight: false },
                                            { label: 'Total Margin',   value: displayMargin.total,    highlight: true  },
                                            { label: 'Margin Benefit', value: 0,                      highlight: false },
                                        ].map((item, i, arr) => (
                                                <Stack
                                                    key={item.label}
                                                    direction="row"
                                                    sx={{
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        px: 2.5,
                                                        py: 1.5,
                                                        borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                                                        bgcolor: item.highlight ? '#e8f0fe' : 'transparent',
                                                    }}
                                            >
                                                <Typography sx={{ fontSize: 13, color: '#3d5275', fontWeight: 500 }}>
                                                    {item.label}
                                                </Typography>
                                                <motion.div
                                                    key={item.value}
                                                    initial={{ opacity: 0.6 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.25 }}
                                                >
                                                    <Typography sx={{
                                                        fontSize: 14, fontWeight: 800,
                                                        color: item.highlight ? BLUE : NAVY,
                                                    }}>
                                                        {item.value === 0 && item.label === 'Margin Benefit'
                                                            ? '₹ 0'
                                                            : `₹ ${fmtINR(item.value)}`}
                                                    </Typography>
                                                </motion.div>
                                            </Stack>
                                        ))}
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: BORDER }} />

                    {/* ── Table ── */}
                    <Box sx={{ overflowX: 'auto' }}>
                        {rows.length === 0 ? (
                            <Box sx={{ py: 5, textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 13, color: '#a0aec0', fontWeight: 500 }}>
                                    No positions added yet. Configure and click "Add to Table".
                                </Typography>
                            </Box>
                        ) : (
                            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <Box component="thead">
                                    <Box component="tr" sx={{ bgcolor: '#f8fafc' }}>
                                        {['Exchange', 'Scrip', 'Segment', 'Strike', 'Qty', 'Span (₹)', 'Exposure (₹)', 'Total (₹)', ''].map(h => (
                                            <Box
                                                key={h}
                                                component="th"
                                                sx={{
                                                    px: 2.5, py: 1.25, textAlign: 'left',
                                                    fontSize: 11, fontWeight: 700, color: '#6b7fa3',
                                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    borderBottom: `1px solid ${BORDER}`,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {h}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    <AnimatePresence>
                                        {rows.map((row, i) => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.18 }}
                                                style={{ borderBottom: `1px solid ${BG}` }}
                                            >
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 700, color: NAVY }}>
                                                    {row.exchange}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                                        {row.scrip.symbol} {row.scrip.expiry}
                                                    </Typography>
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275' }}>
                                                    {row.segment}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275' }}>
                                                    {row.strike}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2 }}>
                                                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                                            {row.quantity}
                                                        </Typography>
                                                        <Chip
                                                            label={row.action}
                                                            size="small"
                                                            sx={{
                                                                height: 20, fontSize: 11, fontWeight: 800,
                                                                bgcolor: row.action === 'B' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                                                                color: row.action === 'B' ? '#16a34a' : '#dc2626',
                                                                border: `1px solid ${row.action === 'B' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
                                                            }}
                                                        />
                                                    </Stack>
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275', fontWeight: 600 }}>
                                                    {row.spanMargin > 0 ? fmtINR(row.spanMargin) : '—'}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275', fontWeight: 600 }}>
                                                    {row.exposure > 0 ? fmtINR(row.exposure) : '—'}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 800, color: NAVY }}>
                                                    {fmtINR(row.total)}
                                                </Box>
                                                <Box component="td" sx={{ px: 2, py: 2 }}>
                                                    <Tooltip title="Remove">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(row.id)}
                                                            sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}
                                                        >
                                                            <DeleteOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Grand Total footer */}
                    <AnimatePresence>
                        {rows.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${BORDER}` }}>
                                    <Box sx={{
                                        display: 'flex', alignItems: 'center', gap: 2,
                                        bgcolor: LBLUE, border: `1.5px solid rgba(21,101,192,0.25)`,
                                        borderRadius: '50px', px: 3, py: 1.25,
                                    }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#3d5275' }}>
                                            Grand Total
                                        </Typography>
                                        <motion.div key={grandTotal} initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                                            <Typography sx={{ fontSize: 16, fontWeight: 900, color: BLUE, letterSpacing: '-0.02em' }}>
                                                ₹ {fmtINR(grandTotal)}
                                            </Typography>
                                        </motion.div>
                                    </Box>
                                </Box>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Paper>

                {/* Disclaimer */}
                <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 2, textAlign: 'center', lineHeight: 1.8 }}>
                    ⚠ Indicative only. Actual margins are determined by NSE/BSE SPAN + Exposure model and may vary with
                    volatility, corporate actions, and exchange circulars. Verify with your broker before placing orders.
                </Typography>
            </Box>
        </Box>
    );
};

export default MarginCalculator;