import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box, Typography, Stack, Paper, MenuItem, Select,
    FormControl, RadioGroup, FormControlLabel, Radio,
    IconButton, Chip, Divider, Tooltip, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// ─── Config ─────────────────────────────────────────────────────────────────
// Point this at your FastAPI backend. Never call SmartAPI directly from the
// browser — your backend holds the AngelOne auth token.
const API_BASE = import.meta.env?.VITE_MARGIN_API_BASE ?? 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────
type Exchange    = 'NFO' | 'BFO';
type Segment     = 'Futures' | 'Options';
type Action       = 'BUY' | 'SELL';
type OptionType   = 'CE' | 'PE';

interface UnderlyingMeta {
    symbol:  string;
    lotSize: number;
}

// Static list of underlyings + lot sizes just to populate the "Select Scrip"
// search box. Expiries and strikes are fetched live from the backend
// (which reads them from AngelOne's instrument master), so they're never
// hardcoded or stale.
const UNDERLYINGS: Record<Exchange, UnderlyingMeta[]> = {
    NFO: [
        { symbol: 'NIFTY',      lotSize: 65 },
        { symbol: 'BANKNIFTY',  lotSize: 30 },
        { symbol: 'FINNIFTY',   lotSize: 60 },
        { symbol: 'MIDCPNIFTY', lotSize: 120 },
    ],
    BFO: [
        { symbol: 'SENSEX', lotSize: 20 },
    ],
};

interface TableRow {
    id:           string;
    exchange:     Exchange;
    underlying:   string;
    expiry:       string;
    segment:      Segment;
    strike:       number | null;
    optionType:   OptionType | null;
    quantity:     number;
    action:       Action;
    spanMargin:   number;
    exposure:     number;
    total:        number;
    netPremium:   number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
    n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const makeId = () =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─── Backend calls ──────────────────────────────────────────────────────────
interface MarginLegPayload {
    exchange: Exchange;
    segment: Segment;
    underlying: string;
    expiry: string;
    strike?: number;
    option_type?: OptionType;
    quantity: number;
    action: Action;
}

interface MarginApiResponse {
    net_premium: number;
    span_margin: number;
    exposure_margin: number;
    total_margin: number;
    margin_benefit: number;
}

async function fetchMarginForLegs(legs: MarginLegPayload[]): Promise<MarginApiResponse> {
    const res = await fetch(`${API_BASE}/api/margin/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ legs }),
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Margin API error (${res.status})`);
    }
    return res.json();
}

async function fetchExpiries(exchange: Exchange, underlying: string, segment: Segment): Promise<string[]> {
    const params = new URLSearchParams({ exchange, underlying, segment });
    const res = await fetch(`${API_BASE}/api/instruments/search?${params}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (segment === 'Options') {
        // backend returns [expiry, strike] tuples for options; collapse to unique expiries
        return Array.from(new Set((data as [string, number][]).map(d => d[0])));
    }
    return data as string[];
}

async function fetchStrikes(exchange: Exchange, underlying: string, expiry: string): Promise<number[]> {
    const params = new URLSearchParams({ exchange, underlying, segment: 'Options' });
    const res = await fetch(`${API_BASE}/api/instruments/search?${params}`);
    if (!res.ok) return [];
    const data: [string, number][] = await res.json();
    return Array.from(new Set(data.filter(([exp]) => exp === expiry).map(([, strike]) => strike))).sort((a, b) => a - b);
}

// ─── Theme tokens (kept from existing app identity) ──────────────────────────
const NAVY   = '#0a1628';
const BLUE   = '#1565c0';
const LBLUE  = '#e8f0fe';
const BORDER = '#d0d9e8';
const BG     = '#f0f4fa';

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

// ─── Scrip (underlying) autocomplete ──────────────────────────────────────────
interface ScripInputProps {
    options: UnderlyingMeta[];
    value: string;
    onChange: (u: UnderlyingMeta) => void;
    error?: boolean;
}
const ScripInput: React.FC<ScripInputProps> = ({ options, value, onChange, error }) => {
    const [open, setOpen]   = useState(false);
    const [query, setQuery] = useState(value);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => { setQuery(value); }, [value]);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options.filter(o => o.symbol.toLowerCase().includes(query.toLowerCase()));

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
                                key={s.symbol}
                                onMouseDown={() => { onChange(s); setQuery(s.symbol); setOpen(false); }}
                                sx={{
                                    px: 2.5, py: 1.25, cursor: 'pointer', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    '&:hover': { bgcolor: LBLUE },
                                    borderBottom: i < filtered.length - 1 ? `1px solid ${BG}` : 'none',
                                }}
                            >
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.symbol}</Typography>
                                <Typography sx={{ fontSize: 11, color: '#6b7fa3' }}>Lot: {s.lotSize}</Typography>
                            </Box>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MarginCalculator: React.FC = () => {
    const [exchange, setExchange]     = useState<Exchange>('NFO');
    const [segment, setSegment]       = useState<Segment>('Options');
    const [underlying, setUnderlying] = useState<UnderlyingMeta | null>(null);
    const [expiry, setExpiry]         = useState<string>('');
    const [expiryOptions, setExpiryOptions] = useState<string[]>([]);
    const [strike, setStrike]         = useState<number | null>(null);
    const [strikeOptions, setStrikeOptions] = useState<number[]>([]);
    const [optionType, setOptionType] = useState<OptionType>('PE');
    const [action, setAction]         = useState<Action>('BUY');
    const [quantity, setQuantity]     = useState<number>(0);
    const [rows, setRows]             = useState<TableRow[]>([]);
    const [errors, setErrors]         = useState<{ scrip?: boolean; expiry?: boolean; strike?: boolean }>({});

    const [livePreview, setLivePreview] = useState<MarginApiResponse | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const [tableLoading, setTableLoading] = useState(false);
    const [tableError, setTableError] = useState<string | null>(null);

    const lotSize = underlying?.lotSize ?? (UNDERLYINGS[exchange][0]?.lotSize ?? 1);

    // ── fetch expiries when underlying/segment changes ──
    useEffect(() => {
        if (!underlying) { setExpiryOptions([]); return; }
        fetchExpiries(exchange, underlying.symbol, segment).then(setExpiryOptions);
    }, [exchange, underlying, segment]);

    // ── fetch strikes when expiry changes (Options only) ──
    useEffect(() => {
        if (!underlying || !expiry || segment !== 'Options') { setStrikeOptions([]); return; }
        fetchStrikes(exchange, underlying.symbol, expiry).then(setStrikeOptions);
    }, [exchange, underlying, expiry, segment]);

    const buildCurrentLeg = useCallback((): MarginLegPayload | null => {
        if (!underlying || !expiry) return null;
        if (segment === 'Options' && (strike === null || !optionType)) return null;
        const qty = quantity > 0 ? quantity : lotSize;
        return {
            exchange,
            segment,
            underlying: underlying.symbol,
            expiry,
            ...(segment === 'Options' ? { strike: strike!, option_type: optionType } : {}),
            quantity: qty,
            action,
        };
    }, [underlying, expiry, segment, strike, optionType, quantity, lotSize, exchange, action]);

    // ── live preview of current form, debounced ──
    useEffect(() => {
        const leg = buildCurrentLeg();
        if (!leg) { setLivePreview(null); setPreviewError(null); return; }

        let cancelled = false;
        setPreviewLoading(true);
        setPreviewError(null);
        const handle = setTimeout(() => {
            fetchMarginForLegs([leg])
                .then(res => { if (!cancelled) setLivePreview(res); })
                .catch(err => { if (!cancelled) { setPreviewError(err.message); setLivePreview(null); } })
                .finally(() => { if (!cancelled) setPreviewLoading(false); });
        }, 450); // debounce so we don't hammer SmartAPI (10 req/s limit) on every keystroke

        return () => { cancelled = true; clearTimeout(handle); };
    }, [buildCurrentLeg]);

    const handleExchangeChange = (val: Exchange) => {
        setExchange(val);
        setUnderlying(null);
        setExpiry('');
        setStrike(null);
        setQuantity(0);
        setErrors({});
    };

    const handleSegmentChange = (val: Segment) => {
        setSegment(val);
        setExpiry('');
        setStrike(null);
        setQuantity(0);
    };

    const recalcTableTotals = async (legRows: TableRow[]): Promise<TableRow[]> => {
        // Re-derive each row's margin via the API (basket call), then
        // re-attach to rows in the same order.
        if (legRows.length === 0) return legRows;
        const legs: MarginLegPayload[] = legRows.map(r => ({
            exchange: r.exchange,
            segment: r.segment,
            underlying: r.underlying,
            expiry: r.expiry,
            ...(r.segment === 'Options' ? { strike: r.strike!, option_type: r.optionType! } : {}),
            quantity: r.quantity,
            action: r.action,
        }));
        // NOTE: SmartAPI's batch endpoint returns BASKET-level totals, not
        // per-leg breakdowns. For a per-row Span/Exposure display (as in the
        // AngelOne UI table), call the endpoint once per leg individually,
        // and separately once for the whole basket to get the true combined
        // total (which differs from the sum of legs whenever cross-margining
        // / hedge benefit applies).
        const perLeg = await Promise.all(legs.map(leg => fetchMarginForLegs([leg])));
        return legRows.map((r, i) => ({
            ...r,
            spanMargin: perLeg[i].span_margin,
            exposure: perLeg[i].exposure_margin,
            total: perLeg[i].total_margin,
            netPremium: perLeg[i].net_premium,
        }));
    };

    const [basketTotal, setBasketTotal] = useState<MarginApiResponse | null>(null);

    const refreshBasketTotal = async (legRows: TableRow[]) => {
        if (legRows.length === 0) { setBasketTotal(null); return; }
        const legs: MarginLegPayload[] = legRows.map(r => ({
            exchange: r.exchange,
            segment: r.segment,
            underlying: r.underlying,
            expiry: r.expiry,
            ...(r.segment === 'Options' ? { strike: r.strike!, option_type: r.optionType! } : {}),
            quantity: r.quantity,
            action: r.action,
        }));
        try {
            const total = await fetchMarginForLegs(legs);
            setBasketTotal(total);
        } catch (e) {
            // basket total is best-effort; per-row totals still display
            setBasketTotal(null);
        }
    };

    const handleAddToTable = async () => {
        const newErrors: typeof errors = {};
        if (!underlying) newErrors.scrip = true;
        if (!expiry) newErrors.expiry = true;
        if (segment === 'Options' && strike === null) newErrors.strike = true;
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
        setErrors({});

        const leg = buildCurrentLeg();
        if (!leg) return;

        setTableLoading(true);
        setTableError(null);
        try {
            const result = await fetchMarginForLegs([leg]);
            const row: TableRow = {
                id: makeId(),
                exchange,
                underlying: underlying!.symbol,
                expiry,
                segment,
                strike,
                optionType: segment === 'Options' ? optionType : null,
                quantity: leg.quantity,
                action,
                spanMargin: result.span_margin,
                exposure: result.exposure_margin,
                total: result.total_margin,
                netPremium: result.net_premium,
            };
            const nextRows = [...rows, row];
            setRows(nextRows);
            await refreshBasketTotal(nextRows);

            // reset form
            setUnderlying(null);
            setExpiry('');
            setStrike(null);
            setQuantity(0);
        } catch (e: any) {
            setTableError(e.message ?? 'Failed to fetch margin from AngelOne');
        } finally {
            setTableLoading(false);
        }
    };

    const handleReset = () => {
        setRows([]);
        setBasketTotal(null);
        setUnderlying(null);
        setExpiry('');
        setStrike(null);
        setQuantity(0);
        setExchange('NFO');
        setSegment('Options');
        setAction('BUY');
        setErrors({});
        setTableError(null);
    };

    const handleDelete = async (id: string) => {
        const nextRows = rows.filter(r => r.id !== id);
        setRows(nextRows);
        await refreshBasketTotal(nextRows);
    };

    const grandTotal = basketTotal?.total_margin ?? rows.reduce((a, r) => a + r.total, 0);

    // Right panel shows: basket total if rows exist, else live preview of the form.
    const displayMargin = rows.length > 0
        ? {
            net_premium: basketTotal?.net_premium ?? rows.reduce((a, r) => a + r.netPremium, 0),
            span_margin: basketTotal?.span_margin ?? rows.reduce((a, r) => a + r.spanMargin, 0),
            exposure_margin: basketTotal?.exposure_margin ?? rows.reduce((a, r) => a + r.exposure, 0),
            total_margin: basketTotal?.total_margin ?? rows.reduce((a, r) => a + r.total, 0),
            margin_benefit: basketTotal?.margin_benefit ?? 0,
        }
        : (livePreview ?? { net_premium: 0, span_margin: 0, exposure_margin: 0, total_margin: 0, margin_benefit: 0 });

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: BG, fontFamily: '"Inter", "Roboto", sans-serif' }}>
            {/* Header */}
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

            <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
                <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, overflow: 'hidden', bgcolor: '#fff' }}>
                    <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr auto' },
                            gap: 3,
                            alignItems: 'start',
                        }}>
                            {/* Left inputs */}
                            <Box sx={{ gridColumn: { xs: '1', md: '1 / 3' } }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2.5 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                            Exchange
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select value={exchange} onChange={e => handleExchangeChange(e.target.value as Exchange)} sx={selectSx}>
                                                <MenuItem value="NFO">NFO</MenuItem>
                                                <MenuItem value="BFO">BFO</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                            Segment
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select value={segment} onChange={e => handleSegmentChange(e.target.value as Segment)} sx={selectSx}>
                                                <MenuItem value="Futures">Futures</MenuItem>
                                                <MenuItem value="Options">Options</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 2.5 }}>
                                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                        Select Scrip
                                    </Typography>
                                    <ScripInput
                                        options={UNDERLYINGS[exchange]}
                                        value={underlying?.symbol ?? ''}
                                        onChange={u => {
                                            setUnderlying(u);
                                            setQuantity(u.lotSize);
                                            setExpiry('');
                                            setStrike(null);
                                            setErrors(e => ({ ...e, scrip: false }));
                                        }}
                                        error={errors.scrip}
                                    />
                                </Box>

                                {/* Expiry + Option Type row (mirrors AngelOne layout) */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: segment === 'Options' ? '1fr 1fr' : '1fr', gap: 2, mb: 2.5 }}>
                                    <Box >
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                            Expiry
                                        </Typography>
                                        <FormControl fullWidth size="small" >
                                            <Select
                                                value={expiry}
                                                onChange={e => { setExpiry(e.target.value); setStrike(null); setErrors(er => ({ ...er, expiry: false })); }}
                                                displayEmpty
                                                sx={selectSx}
                                                disabled={!underlying || expiryOptions.length === 0}
                                                
                                            >
                                                <MenuItem value="" disabled >
                                                    {underlying ? 'Select expiry' : 'Select scrip first'}
                                                </MenuItem>
                                                {expiryOptions.map(exp => (
                                                    <MenuItem key={exp}  value={exp}>{exp}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {errors.expiry && (
                                            <Typography sx={{ fontSize: 11, color: '#d32f2f', mt: 0.5, ml: 1.5 }}>
                                                Please select expiry
                                            </Typography>
                                        )}
                                    </Box>
                                    {segment === 'Options' && (
                                        <Box>
                                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                                Option Type
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                                <Select value={optionType} onChange={e => setOptionType(e.target.value as OptionType)} sx={selectSx}>
                                                    <MenuItem value="CE">CALL</MenuItem>
                                                    <MenuItem value="PE">PUT</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    )}
                                </Box>

                                {/* Strike (Options only) */}
                                {segment === 'Options' && (
                                    <Box sx={{ mb: 2.5 }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.75, ml: 0.5 }}>
                                            Strike
                                        </Typography>
                                        <FormControl fullWidth size="small">
                                            <Select
                                                value={strike ?? ''}
                                                onChange={e => { setStrike(Number(e.target.value)); setErrors(er => ({ ...er, strike: false })); }}
                                                displayEmpty
                                                sx={selectSx}
                                                disabled={!expiry || strikeOptions.length === 0}
                                            >
                                                <MenuItem value="" disabled>
                                                    {expiry ? 'Select strike' : 'Select expiry first'}
                                                </MenuItem>
                                                {strikeOptions.map(s => (
                                                    <MenuItem key={s} value={s}>{s}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {errors.strike && (
                                            <Typography sx={{ fontSize: 11, color: '#d32f2f', mt: 0.5, ml: 1.5 }}>
                                                Please select strike
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {/* Action + Quantity */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'center' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', mb: 0.5, ml: 0.5 }}>
                                            Action
                                        </Typography>
                                        <RadioGroup row value={action} onChange={e => setAction(e.target.value as Action)} sx={{ gap: 1 }}>
                                            {[{ val: 'BUY', label: 'Buy' }, { val: 'SELL', label: 'Sell' }].map(({ val, label }) => (
                                                <FormControlLabel
                                                    key={val}
                                                    value={val}
                                                    label={label}
                                                    control={<Radio size="small" sx={{ color: '#c0c8d8', '&.Mui-checked': { color: '#16a34a' }, p: '6px' }} />}
                                                    sx={{ mr: 0, '& .MuiFormControlLabel-label': { fontSize: 14, fontWeight: 700, color: action === val ? '#16a34a' : NAVY } }}
                                                />
                                            ))}
                                        </RadioGroup>
                                    </Box>
                                    <Box>
                                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5, mr: 0.5 }}>
                                            <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6b7fa3', ml: 0.5 }}>Quantity</Typography>
                                            <Typography sx={{ fontSize: 11, color: '#6b7fa3' }}>(Lot size {lotSize})</Typography>
                                        </Stack>
                                        <Stack direction="row" sx={{ alignItems: 'center', border: `1.5px solid ${BORDER}`, borderRadius: '50px', bgcolor: '#fff', overflow: 'hidden', height: 40 }}>
                                            <IconButton size="small" onClick={() => setQuantity(q => Math.max(0, q - lotSize))} sx={{ borderRadius: 0, px: 1.5, color: NAVY, flexShrink: 0, '&:hover': { bgcolor: LBLUE } }}>
                                                <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>−</Typography>
                                            </IconButton>
                                            <Box
                                                component="input"
                                                type="number"
                                                value={quantity}
                                                onChange={e => {
                                                    const raw = Math.max(0, parseInt(e.target.value) || 0);
                                                    // snap to nearest multiple of lot size — NSE/BSE reject non-multiples
                                                    const snapped = Math.round(raw / lotSize) * lotSize;
                                                    setQuantity(snapped);
                                                }}
                                                style={{ flex: 1, border: 'none', outline: 'none', textAlign: 'center', fontSize: 14, fontWeight: 700, color: NAVY, background: 'transparent', fontFamily: 'inherit', minWidth: 0 }}
                                            />
                                            <IconButton size="small" onClick={() => setQuantity(q => q + lotSize)} sx={{ borderRadius: 0, px: 1.5, color: NAVY, flexShrink: 0, '&:hover': { bgcolor: LBLUE } }}>
                                                <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>+</Typography>
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                </Box>

                                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                    <Box
                                        component="button"
                                        onClick={handleAddToTable}
                                        disabled={tableLoading}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            background: NAVY, color: '#fff', border: 'none',
                                            borderRadius: 50, padding: '10px 22px',
                                            fontSize: 13, fontWeight: 700, cursor: tableLoading ? 'wait' : 'pointer',
                                            fontFamily: 'inherit', letterSpacing: '0.01em', opacity: tableLoading ? 0.7 : 1,
                                        }}
                                    >
                                        {tableLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <AddIcon sx={{ fontSize: 16 }} />}
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
                                    >
                                        <RefreshIcon sx={{ fontSize: 15 }} />
                                        Reset Table
                                    </Box>
                                </Stack>

                                {tableError && (
                                    <Typography sx={{ fontSize: 12, color: '#d32f2f', mt: 1.5 }}>{tableError}</Typography>
                                )}
                            </Box>

                            {/* Right: Combined margin requirements */}
                            <Box sx={{ gridColumn: { xs: '1', md: '3 / 5' } }}>
                                <Paper elevation={0} sx={{ borderRadius: 2.5, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
                                    <Box sx={{ bgcolor: NAVY, px: 2.5, py: 1.75, textAlign: 'center' }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.01em' }}>
                                            Combined Margin Requirements
                                        </Typography>
                                    </Box>
                                    <Box sx={{ bgcolor: '#f4f7fc', p: 0, position: 'relative' }}>
                                        {previewLoading && rows.length === 0 && (
                                            <Box sx={{ position: 'absolute', top: 10, right: 14 }}>
                                                <CircularProgress size={14} />
                                            </Box>
                                        )}
                                        {[
                                            { label: 'Net Premium',     value: displayMargin.net_premium,     highlight: false, signed: true },
                                            { label: 'Span Margin',     value: displayMargin.span_margin,     highlight: false, signed: false },
                                            { label: 'Exposure Margin', value: displayMargin.exposure_margin, highlight: false, signed: false },
                                            { label: 'Total',           value: displayMargin.total_margin,    highlight: true,  signed: false },
                                        ].map((item, i, arr) => (
                                            <Stack
                                                key={item.label}
                                                direction="row"
                                                sx={{
                                                    justifyContent: 'space-between', alignItems: 'center',
                                                    px: 2.5, py: 1.5,
                                                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                                                    bgcolor: item.highlight ? '#e8f0fe' : 'transparent',
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 13, color: '#3d5275', fontWeight: 500 }}>{item.label}</Typography>
                                                <motion.div key={item.value} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
                                                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: item.highlight ? BLUE : NAVY }}>
                                                        {item.signed && item.value < 0 ? '-' : ''}₹{fmtINR(Math.abs(item.value))}
                                                    </Typography>
                                                </motion.div>
                                            </Stack>
                                        ))}
                                    </Box>
                                </Paper>
                                {previewError && rows.length === 0 && (
                                    <Typography sx={{ fontSize: 11, color: '#d32f2f', mt: 1, ml: 0.5 }}>{previewError}</Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ borderColor: BORDER }} />

                    {/* Table */}
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
                                        {['Exchange', 'Scrip', 'Segment', 'Strike', 'Type', 'Qty', 'Span (₹)', 'Exposure (₹)', 'Total (₹)', ''].map(h => (
                                            <Box key={h} component="th" sx={{ px: 2.5, py: 1.25, textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7fa3', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}>
                                                {h}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box component="tbody">
                                    <AnimatePresence>
                                        {rows.map(row => (
                                            <motion.tr
                                                key={row.id}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.18 }}
                                                style={{ borderBottom: `1px solid ${BG}` }}
                                            >
                                                <Box component="td" sx={{ px: 2.5, py: 2, fontWeight: 700, color: NAVY }}>{row.exchange}</Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2 }}>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>
                                                        {row.underlying} {row.expiry}
                                                    </Typography>
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275' }}>{row.segment}</Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275' }}>{row.strike ?? 'N/A'}</Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2, color: '#3d5275' }}>
                                                    {row.optionType ? (row.optionType === 'CE' ? 'CALL' : 'PUT') : '—'}
                                                </Box>
                                                <Box component="td" sx={{ px: 2.5, py: 2 }}>
                                                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{row.quantity}</Typography>
                                                        <Chip
                                                            label={row.action === 'BUY' ? 'B' : 'S'}
                                                            size="small"
                                                            sx={{
                                                                height: 20, fontSize: 11, fontWeight: 800,
                                                                bgcolor: row.action === 'BUY' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)',
                                                                color: row.action === 'BUY' ? '#16a34a' : '#dc2626',
                                                                border: `1px solid ${row.action === 'BUY' ? 'rgba(22,163,74,0.3)' : 'rgba(220,38,38,0.3)'}`,
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
                                                        <IconButton size="small" onClick={() => handleDelete(row.id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.08)' } }}>
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

                    <AnimatePresence>
                        {rows.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                                <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${BORDER}` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: LBLUE, border: `1.5px solid rgba(21,101,192,0.25)`, borderRadius: '50px', px: 3, py: 1.25 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#3d5275' }}>Grand Total</Typography>
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

                <Typography sx={{ fontSize: 11, color: '#94a3b8', mt: 2, textAlign: 'center', lineHeight: 1.8 }}>
                    Margins are fetched live from AngelOne's Margin Calculator API and reflect actual SPAN + Exposure
                    requirements at time of request. They may still change with volatility, corporate actions, and
                    exchange circulars before order placement.
                </Typography>
            </Box>
        </Box>
    );
};

export default MarginCalculator;