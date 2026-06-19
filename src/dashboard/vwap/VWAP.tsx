// VWAP.tsx
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Chip,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Checkbox,
  useTheme,
} from '@mui/material';
import {
  CandlestickChart as CandlestickIcon,
  TableRows as TableIcon,
  Storage as StorageIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Tune,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { motion, AnimatePresence } from 'framer-motion';
import Plot from 'react-plotly.js';
import dayjs from 'dayjs';
import { fetchVwapData } from '../../api/apiCalls';

// ============================================================
// Types — move to a shared types file if fetchVwapData already
// imports these from elsewhere; keep them identical either way.
// ============================================================
export interface VWAPRequestPayload {
  dt_date: string;
  start_time: string;
  end_time: string;
  asset: string;
  freq: number;
  remove_duplicates: boolean;
}

export interface FuturesRow {
  s_symbol: string;
  dt_date: string;
  dt_time: string;
  dt_datetime: string;
  n_open: number;
  n_high: number;
  n_low: number;
  n_close: number;
  n_volume: number;
  n_oi: number;
}

export interface MergedRow extends FuturesRow {
  rolling_vwap: number;
  hl_vol: number;
  upper_vwap: number;
  lower_vwap: number;
  signal: string;
  buy_signal: boolean;
  sell_signal: boolean;
  plot_buy_signal: boolean;
  plot_sell_signal: boolean;
}

export interface VWAPApiResponse {
  futures_data: FuturesRow[];
  merged_data: MergedRow[];
}

// ============================================================
// Helpers
// ============================================================
const fmt = (n: number | null | undefined, digits = 2) =>
  typeof n === 'number' && !Number.isNaN(n) ? n.toFixed(digits) : '—';

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const cell = val === null || val === undefined ? '' : String(val);
          return cell.includes(',') ? `"${cell}"` : cell;
        })
        .join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const withRowId = <T extends Record<string, unknown>>(rows: T[]) =>
  rows.map((r, i) => ({ id: i, ...r }));

function getPreviousTradingDay(): string {
  let d = dayjs().subtract(1, 'day');
  while (d.day() === 0 || d.day() === 6) d = d.subtract(1, 'day');
  return d.format('YYYY-MM-DD');
}

// ============================================================
// Control Panel
// ============================================================
interface ControlPanelProps {
  values: VWAPRequestPayload;
  onChange: (patch: Partial<VWAPRequestPayload>) => void;
  showSignals: boolean;
  onShowSignalsChange: (v: boolean) => void;
  onGenerate: () => void;
  loading: boolean;
}

const NAVY = '#0a1628';
const BORDER = '#d0d9e8';

const LBLUE = '#e8f0fe';

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f8fafc',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    '&:hover': { bgcolor: '#f1f5f9' },
    '&.Mui-focused': {
      bgcolor: '#fff',
      boxShadow: '0 0 0 3px rgba(21,101,192,0.1)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1565c0', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 500, color: '#64748b', '&.Mui-focused': { color: '#1565c0', fontWeight: 600 } },
  '& .MuiInputBase-input': { fontWeight: 600, color: NAVY, py: '10px' },
};

const chipSx = (color: string) => ({
  fontWeight: 700, fontSize: 10, height: 22,
  bgcolor: `rgba(${color},0.1)`,
  color: `rgb(${color})`,
  border: `1px solid rgba(${color},0.3)`,
});

const ControlPanel: React.FC<ControlPanelProps> = ({
  values,
  onChange,
  showSignals,
  onShowSignalsChange,
  onGenerate,
  loading,
}) => {

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${BORDER}`,
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Header accent */}
      <Box sx={{ bgcolor: NAVY, px: 3, py: 1.75 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tune sx={{ color: '#fff', fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
            Parameters
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(6, 1fr)',
            },
          }}
        >
          <TextField
            label="Trading Date"
            type="date"
            size="small"
            fullWidth
            sx={textFieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
            value={values.dt_date}
            onChange={(e) => onChange({ dt_date: e.target.value })}
          />
          <TextField
            label="Asset"
            size="small"
            fullWidth
            sx={textFieldSx}
            value={values.asset}
            onChange={(e) => onChange({ asset: e.target.value })}
            placeholder="NIFTY-I.NFO"
          />
          <TextField
            label="Start Time"
            type="time"
            size="small"
            fullWidth
            sx={textFieldSx}
            slotProps={{ htmlInput: { step: 1 }, inputLabel: { shrink: true } }}
            value={values.start_time}
            onChange={(e) => onChange({ start_time: e.target.value })}
          />
          <TextField
            label="End Time"
            type="time"
            size="small"
            fullWidth
            sx={textFieldSx}
            slotProps={{ htmlInput: { step: 1 }, inputLabel: { shrink: true } }}
            value={values.end_time}
            onChange={(e) => onChange({ end_time: e.target.value })}
          />
          <TextField
            label="VWAP Frequency (min)"
            type="number"
            size="small"
            fullWidth
            sx={textFieldSx}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            value={values.freq}
            onChange={(e) => onChange({ freq: Math.max(1, Number(e.target.value) || 1) })}
          />

          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <motion.div whileTap={{ scale: 0.96 }} style={{ width: '100%' }}>
              <Button
                onClick={onGenerate}
                disabled={loading}
                variant="contained"
                fullWidth
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <PlayArrowIcon />
                  )
                }
                sx={{
                  borderRadius: '12px', fontWeight: 700, letterSpacing: 0.3,
                  boxShadow: 'none', bgcolor: "#f97316", color: '#fff',
                  py: 1.25, textTransform: 'none', fontSize: 13, height: 40,
                  '&:hover': { bgcolor: '#d6650f', boxShadow: '0 4px 12px rgba(10,22,40,0.2)' },
                  '&:disabled': { bgcolor: '#94a3b8' },
                }}
              >
                {loading ? 'Loading…' : 'Generate'}
              </Button>
            </motion.div>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5, borderColor: '#e2e8f0' }} />

        <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap' }}>
          <FormControlLabel
            control={
              <Switch
                checked={values.remove_duplicates}
                onChange={(e) => onChange({ remove_duplicates: e.target.checked })}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase': { color: '#94a3b8' },
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#1565c0' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'rgba(21,101,192,0.3)', opacity: '1 !important' },
                  '& .MuiSwitch-track': { bgcolor: '#cbd5e1', opacity: '1 !important' },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                Hide consecutive signals
              </Typography>
            }
          />
          <FormControlLabel
            control={
              <Switch
                checked={showSignals}
                onChange={(e) => onShowSignalsChange(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase': { color: '#94a3b8' },
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#1565c0' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'rgba(21,101,192,0.3)', opacity: '1 !important' },
                  '& .MuiSwitch-track': { bgcolor: '#cbd5e1', opacity: '1 !important' },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                Show buy/sell signals
              </Typography>
            }
          />
        </Stack>
      </Box>
    </Paper>
  );
};

// ============================================================
// KPI strip
// ============================================================
const KpiStrip: React.FC<{ merged: MergedRow[] }> = ({ merged }) => {
  if (!merged.length) return null;

  const buys = merged.filter((r) => r.plot_buy_signal).length;
  const sells = merged.filter((r) => r.plot_sell_signal).length;
  const last = merged[merged.length - 1];
  const first = merged[0];
  const change = last.n_close - first.n_open;
  const changePct = (change / first.n_open) * 100;
  const isUp = change >= 0;

  const items = [
    { label: 'Candles', value: merged.length.toLocaleString(), icon: <ShowChart fontSize="small" /> },
    {
      label: 'Last Close',
      value: fmt(last.n_close),
      icon: isUp ? (
        <TrendingUp fontSize="small" sx={{ color: '#16a34a' }} />
      ) : (
        <TrendingDown fontSize="small" sx={{ color: '#dc2626' }} />
      ),
      accent: isUp ? '#16a34a' : '#dc2626',
      sub: `${isUp ? '+' : ''}${fmt(change)} (${fmt(changePct)}%)`,
    },
    {
      label: 'Buy Signals',
      value: buys,
      accent: '#16a34a',
    },
    {
      label: 'Sell Signals',
      value: sells,
      accent: '#dc2626',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        mb: 2,
      }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              border: `1px solid ${BORDER}`,
              bgcolor: '#fff',
            }}
          >
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.5 }}>
              {item.icon}
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5 }}>
                {item.label.toUpperCase()}
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: item.accent ?? 'text.primary' }}
            >
              {item.value} {item.sub && (
                <Typography variant="caption" sx={{ color: item.accent }}>
                  {item.sub}
                </Typography>
              )}
            </Typography>

          </Paper>
        </motion.div>
      ))}
    </Box>
  );
};

// ============================================================
// Chart panel
// ============================================================
const ChartPanel: React.FC<{ merged: MergedRow[]; asset: string; showSignals: boolean }> = ({
  merged,
  asset,
  showSignals,
}) => {
  const { data, layout } = useMemo(() => {
    const x = merged.map((d) => d.dt_datetime);
    const open = merged.map((d) => d.n_open);
    const high = merged.map((d) => d.n_high);
    const low = merged.map((d) => d.n_low);
    const close = merged.map((d) => d.n_close);
    const vwap = merged.map((d) => d.rolling_vwap);
    const upper = merged.map((d) => d.upper_vwap);
    const lower = merged.map((d) => d.lower_vwap);

    const traces: any[] = [
      {
        type: 'candlestick',
        x,
        open,
        high,
        low,
        close,
        name: asset,
        increasing: { line: { color: '#22c55e' }, fillcolor: '#22c55e' },
        decreasing: { line: { color: '#ef4444' }, fillcolor: '#ef4444' },
        whiskerwidth: 0.6,
      } as any,
      {
        type: 'scatter',
        mode: 'lines',
        x,
        y: vwap,
        name: 'Rolling VWAP',
        line: { color: '#f97316', width: 2.5, shape: 'hv' },
      },
      // Invisible lower band line (anchor for fill)
      {
        type: 'scatter',
        mode: 'lines',
        x,
        y: lower,
        line: { color: 'rgba(0,0,0,0)' },
        showlegend: false,
        hoverinfo: 'skip',
        name: 'VWAP Band',
      },
      // Upper band, filled to previous trace
      {
        type: 'scatter',
        mode: 'lines',
        x,
        y: upper,
        fill: 'tonexty',
        fillcolor: 'rgba(59, 130, 246, 0.12)',
        line: { color: 'rgba(0,0,0,0)' },
        showlegend: false,
        hoverinfo: 'skip',
        name: 'VWAP Band',
      },
    ];

    if (showSignals) {
      const buys = merged.filter((d) => d.plot_buy_signal);
      const sells = merged.filter((d) => d.plot_sell_signal);
      const range = Math.max(...high) - Math.min(...low);
      const offset = range * 0.003;

      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: 'BUY',
        x: buys.map((d) => d.dt_datetime),
        y: buys.map((d) => d.n_low - offset),
        marker: {
          symbol: 'triangle-up', size: 14, color: '#16a34a',
          line: { color: '#ffffff', width: 1.5 },
        },
      });
      traces.push({
        type: 'scatter',
        mode: 'markers',
        name: 'SELL',
        x: sells.map((d) => d.dt_datetime),
        y: sells.map((d) => d.n_high + offset),
        marker: {
          symbol: 'triangle-down', size: 14, color: '#dc2626',
          line: { color: '#ffffff', width: 1.5 },
        },
      });
    }

    const layout: any = {
      title: { text: `${asset} · VWAP Dashboard`, font: { size: 14, color: '#1e293b', weight: 700 } },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      font: { color: '#334155', family: '"Inter", "Roboto", sans-serif' },
      height: 720,
      dragmode: 'pan',
      hovermode: 'x unified',
      hoverlabel: {
        font: { color: '#fff' },
        bgcolor: '#1e293b',
        bordercolor: '#334155',
      },
      xaxis: {
        rangeslider: { visible: false },
        showgrid: false,
        showspikes: true,
        spikesnap: 'cursor',
        spikemode: 'across',
        tickfont: { color: '#475569', size: 11, weight: 600 },
        title: { text: 'Time', font: { color: '#64748b', size: 12, weight: 600 } },
      },
      yaxis: {
        side: 'right',
        showgrid: true,
        gridcolor: 'rgba(148,163,184,0.2)',
        gridwidth: 1,
        showspikes: true,
        spikesnap: 'cursor',
        spikemode: 'across',
        tickfont: { color: '#475569', size: 11, weight: 600 },
        title: { text: 'Price', font: { color: '#64748b', size: 12, weight: 600 } },
      },
      margin: { l: 60, r: 60, t: 50, b: 40 },
      legend: { orientation: 'h', y: 1.06, x: 0, font: { color: '#334155', size: 12 } },
    };

    return { data: traces, layout };
  }, [merged, asset, showSignals]);

  return (
    <Box sx={{ width: '100%' }}>
      <Plot
        data={data}
        layout={layout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{
          scrollZoom: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
        }}
      />
    </Box>
  );
};

// ============================================================
// Generic data table panel
// ============================================================
const DataTablePanel: React.FC<{
  rows: Record<string, unknown>[];
  columns: GridColDef[];
  filename: string;
}> = ({ rows, columns, filename }) => {
  const gridRows = useMemo(() => withRowId(rows), [rows]);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon fontSize="small" />}
          onClick={() => downloadCsv(filename, rows)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Download CSV
        </Button>
      </Stack>
      <Box sx={{ height: 600 }}>
        <DataGrid
          rows={gridRows}
          columns={columns}
          density="compact"
          disableRowSelectionOnClick
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
          }}
          sx={{
            borderRadius: 2,
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#F0F8FF',
              borderBottom: '2px solid #b8d4e8',
            },
            '& .MuiDataGrid-columnHeader': {
              bgcolor: '#F0F8FF',
              fontSize: 12,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 800,
              color: NAVY,
            },
            '& .MuiDataGrid-cell': { fontSize: 12, color: '#3d5275', display: 'flex', alignItems: 'center' },
          }}
        />
      </Box>
    </Box>
  );
};

// ============================================================
// Empty state
// ============================================================
const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={{ display: 'flex' }}
  >
    <Stack
      spacing={1.5}
      sx={{ alignItems: 'center', justifyContent: 'center', py: 10, width: '100%' }}
    >
      <CandlestickIcon sx={{ fontSize: 44, opacity: 0.25 }} />
      <Typography variant="body2" color="text.secondary">
        Set your parameters above and click <b>Generate</b> to load the VWAP analysis.
      </Typography>
    </Stack>
  </motion.div>
);

// ============================================================
// Main component
// ============================================================
const TAB_CHART = 0;
const TAB_FUTURES = 1;
const TAB_MERGED = 2;

const VWAP: React.FC = () => {
  const theme = useTheme();

  const [params, setParams] = useState<VWAPRequestPayload>({
    dt_date: getPreviousTradingDay(),
    start_time: '09:15:00',
    end_time: '15:30:00',
    asset: 'NIFTY-I.NFO',
    freq: 5,
    remove_duplicates: true,
  });

  const [showSignals, setShowSignals] = useState(true);
  const [tab, setTab] = useState(TAB_CHART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VWAPApiResponse | null>(null);

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParamChange = useCallback(
    (patch: Partial<VWAPRequestPayload>) => setParams((p) => ({ ...p, ...patch })),
    []
  );

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVwapData(params);
      setResult(data as unknown as VWAPApiResponse);
      setTab(TAB_CHART);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ?? err?.message ?? 'Failed to fetch VWAP data.'
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  const futuresColumns: GridColDef[] = useMemo(
    () => [
      { field: 's_symbol', headerName: 'Symbol', width: 120, renderCell: (p) => <Typography sx={{ fontWeight: 700, fontSize: 12, color: NAVY}}>{p.value as string}</Typography> },
      { field: 'dt_date', headerName: 'Date', width: 120 },
      { field: 'dt_time', headerName: 'Time', width: 100 },
      {
        field: 'dt_datetime',
        headerName: 'Datetime',
        flex: 1,
        minWidth: 120,
        valueFormatter: (v) => (v ? dayjs(v as string).format('DD MMM YYYY  HH:mm:ss') : ''),
      },
      { field: 'n_open', headerName: 'Open', width: 95, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_high', headerName: 'High', width: 95, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_low', headerName: 'Low', width: 95, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_close', headerName: 'Close', width: 95, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_volume', headerName: 'Volume', width: 110, type: 'number' },
      { field: 'n_oi', headerName: 'OI', width: 100, type: 'number' },
    ],
    []
  );

  const mergedColumns: GridColDef[] = useMemo(
    () => [
      { field: 's_symbol', headerName: 'Symbol', width: 105, renderCell: (p) => <Typography sx={{ fontWeight: 700, fontSize: 12, color: NAVY }}>{p.value as string}</Typography> },
      { field: 'dt_date', headerName: 'Date', width: 105 },
      { field: 'dt_time', headerName: 'Time', width: 95 },
      {
        field: 'dt_datetime',
        headerName: 'Datetime',
        flex: 1,
        minWidth: 180,
        valueFormatter: (v) => (v ? dayjs(v as string).format('DD MMM YYYY  HH:mm:ss') : ''),
      },
      { field: 'n_open', headerName: 'Open', width: 85, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_high', headerName: 'High', width: 85, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_low', headerName: 'Low', width: 85, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_close', headerName: 'Close', width: 85, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'n_volume', headerName: 'Volume', width: 95, type: 'number' },
      { field: 'n_oi', headerName: 'OI', width: 90, type: 'number' },
      { field: 'rolling_vwap', headerName: 'VWAP', width: 95, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'upper_vwap', headerName: 'Upper Band', width: 105, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'lower_vwap', headerName: 'Lower Band', width: 105, type: 'number', valueFormatter: (v) => fmt(v) },
      { field: 'hl_vol', headerName: 'HL Vol', width: 85, type: 'number', valueFormatter: (v) => fmt(v) },
      {
        field: 'signal',
        headerName: 'Signal',
        width: 95,
        renderCell: (params) => {
          const val = params.value as string;
          if (val === 'BUY') return <Chip label="BUY" size="small" sx={chipSx('22,163,74')} />;
          if (val === 'SELL') return <Chip label="SELL" size="small" sx={chipSx('220,38,38')} />;
          return <Chip label="HOLD" size="small" sx={chipSx('156,163,175')} />;
        },
      },
      {
        field: 'buy_signal',
        headerName: 'Buy Sig',
        width: 85,
        renderCell: (params) =>
          <Checkbox
            checked={!!params.value}
            size="small"
            icon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, border: '2px solid #cbd5e1', bgcolor: '#f8fafc' }} />}
            checkedIcon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</Box>}
            sx={{ p: 0 }}
          />,
      },
      {
        field: 'sell_signal',
        headerName: 'Sell Sig',
        width: 85,
        renderCell: (params) =>
          <Checkbox
            checked={!!params.value}
            size="small"
            icon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, border: '2px solid #cbd5e1', bgcolor: '#f8fafc' }} />}
            checkedIcon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</Box>}
            sx={{ p: 0 }}
          />,
      },
      {
        field: 'plot_buy_signal',
        headerName: 'Plot Buy',
        width: 90,
        renderCell: (params) =>
          <Checkbox
            checked={!!params.value}
            size="small"
            icon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, border: '2px solid #cbd5e1', bgcolor: '#f8fafc' }} />}
            checkedIcon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</Box>}
            sx={{ p: 0 }}
          />,
      },
      {
        field: 'plot_sell_signal',
        headerName: 'Plot Sell',
        width: 90,
        renderCell: (params) =>
          <Checkbox
            checked={!!params.value}
            size="small"
            icon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, border: '2px solid #cbd5e1', bgcolor: '#f8fafc' }} />}
            checkedIcon={<Box sx={{ width: 18, height: 18, borderRadius: 0.5, bgcolor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</Box>}
            sx={{ p: 0 }}
          />,
      },
    ],
    []
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
      {/* Header */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CandlestickIcon sx={{ color: '#1565c0' }} />
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: NAVY, letterSpacing: '-0.02em' }}>
            VWAP Dashboard
          </Typography>
        </Stack>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Chip
              size="small"
              label={params.asset}
              sx={{
                fontWeight: 700,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(34,211,238,0.12)' : undefined,
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.primary.main}40`,
              }}
            />
          </motion.div>
        )}
      </Stack>

      {/* Controls */}
      <Box sx={{ mb: 2.5 }}>
        <ControlPanel
          values={params}
          onChange={handleParamChange}
          showSignals={showSignals}
          onShowSignalsChange={setShowSignals}
          onGenerate={handleGenerate}
          loading={loading}
        />
      </Box>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <KpiStrip merged={result.merged_data} />

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              sx={{
                px: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 48 },
              }}
            >
              <Tab icon={<ShowChart fontSize="small" />} iconPosition="start" label="Chart" />
              <Tab icon={<TableIcon fontSize="small" />} iconPosition="start" label="Futures Data" />
              <Tab icon={<StorageIcon fontSize="small" />} iconPosition="start" label="Merged VWAP Data" />
            </Tabs>

            <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
              <AnimatePresence mode="wait">
                {tab === TAB_CHART && (
                  <motion.div
                    key="chart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChartPanel
                      merged={result.merged_data}
                      asset={params.asset}
                      showSignals={showSignals}
                    />
                  </motion.div>
                )}
                {tab === TAB_FUTURES && (
                  <motion.div
                    key="futures"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DataTablePanel
                      rows={result.futures_data as unknown as Record<string, unknown>[]}
                      columns={futuresColumns}
                      filename={`Futures Data - ${new Date(params.dt_date).toISOString().split('T')[0]}.csv`}
                    />
                  </motion.div>
                )}
                {tab === TAB_MERGED && (
                  <motion.div
                    key="merged"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DataTablePanel
                      rows={result.merged_data as unknown as Record<string, unknown>[]}
                      columns={mergedColumns}
                      filename={`Merged VWAP Data - ${new Date(params.dt_date).toISOString().split('T')[0]}.csv`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </Paper>
        </motion.div>
      ) : (
        !loading && (
          <Paper
            elevation={0}
            sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
          >
            <EmptyState />
          </Paper>
        )
      )}
    </Box>
  );
};

export default VWAP;