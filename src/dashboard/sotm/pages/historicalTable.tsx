import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { DollarSign, Percent, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Box,
  TextField,
  Button,
} from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    bgcolor: '#f8fafc',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#2563eb', borderWidth: '1.5px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(37,99,235,0.1)' },
  },
  '& .MuiInputLabel-root': { fontSize: '0.82rem', color: '#64748b' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' },
  '& .MuiOutlinedInput-input': { fontSize: '0.85rem', color: '#1e293b' },
};

const buttonSx = {
  height: 40,
  borderRadius: '12px',
  px: 3,
  width: 'max-content',
  bgcolor: '#f97316',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.82rem',
  boxShadow: '0 1px 3px rgba(249,115,22,0.25)',
  '&:hover': { bgcolor: '#ea580c', boxShadow: '0 2px 6px rgba(249,115,22,0.35)' },
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface GreekRow {
  id: string;
  position: string;
  strike: number;
  premium: number;
  oi: number;
  iv: number;
  delta: number;
  theta: number;
  gamma: number;
  vega: number;
  decay: number;
}

interface SnapshotData {
  time: string;
  spot: number;
  pcr: number;
  correlation: number;
  direction: number;
  ce: GreekRow[];
  pe: GreekRow[];
}

const COLUMNS: GridColDef[] = [
  { field: "position", headerName: "Position", width: 90 },
  { field: "strike", headerName: "Strike", width: 80, type: "number", headerAlign: "center", align: "center" },
  { field: "premium", headerName: "Premium", width: 90, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
  { field: "oi", headerName: "OI", width: 100, type: "number", headerAlign: "right", align: "right" },
  { field: "iv", headerName: "IV", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "", headerAlign: "right", align: "right" },
  { field: "delta", headerName: "Delta", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "", headerAlign: "right", align: "right" },
  { field: "theta", headerName: "Theta", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "", headerAlign: "right", align: "right" },
  { field: "gamma", headerName: "Gamma", width: 90, type: "number", valueFormatter: (v?: number) => v?.toFixed(6) ?? "", headerAlign: "right", align: "right" },
  { field: "vega", headerName: "Vega", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "", headerAlign: "right", align: "right" },
  { field: "decay", headerName: "Decay", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "", headerAlign: "right", align: "right" },
];

const dataGridSx = {
  border: 'none',
  '& .MuiDataGrid-columnHeaders': {
    bgcolor: '#f0f8ff',
    borderBottom: '1.5px solid #dce8f0',
    borderRadius: '12px 12px 0 0',
    minHeight: '44px !important',
    maxHeight: '44px !important',
  },
  '& .MuiDataGrid-columnHeader': {
    '&:hover': { bgcolor: '#e6f2ff' },
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 800,
    fontSize: '0.72rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: '#1e293b',
  },
  '& .MuiDataGrid-row': {
    transition: 'background-color 0.15s',
    '&:hover': { bgcolor: '#f8fafc' },
    '&:nth-of-type(even)': { bgcolor: '#fafbfc' },
  },
  '& .MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    py: 0.5,
    fontSize: '0.82rem',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: '1.5px solid #e2e8f0',
    borderRadius: '0 0 12px 12px',
  },
};

const DIRECTION_MAP: Record<number, { label: string; color: "success" | "error" | "default" }> = {
  0: { label: "Neutral / Range-Bound", color: "default" },
  1: { label: "Bullish", color: "success" },
  [-1]: { label: "Bearish", color: "error" },
};

function enrich(rows: GreekRow[], type: string): GreekRow[] {
  return rows.map((r, i) => ({ ...r, id: `${type}-${r.position}-${i}` }));
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HistoricalTable() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [timeStr, setTimeStr] = useState("09:15:00");
  const [nStrikes, setNStrikes] = useState(2);
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasAutoFetched = useRef(false);

  const fetchSnapshot = async () => {
    if (!selectedDate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/greeks-snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formatDate(selectedDate),
          time: timeStr,
          n_strikes: nStrikes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to fetch");
        setData(null);
        return;
      }
      const json: SnapshotData = await res.json();
      setData(json);
    } catch {
      setError("Failed to connect to server");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasAutoFetched.current) {
      hasAutoFetched.current = true;
      fetchSnapshot();
    }
  }, []);

  const direction = data ? DIRECTION_MAP[data.direction] ?? null : null;

  return (
      <Box className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-600">Historical Filters</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Snapshot table controls</h3>
          </div>

        <Box className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[180px_150px_110px_auto] lg:items-end">
          <TextField
            type="date"
            label="Trading Date"
            value={selectedDate ? formatDate(selectedDate) : ''}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedDate(val ? new Date(val + 'T00:00:00') : null);
            }}
            size="small"
            fullWidth
            sx={textFieldSx}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Time (HH:MM:SS)"
            size="small"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            placeholder="09:15:00"
            fullWidth
            sx={textFieldSx}
          />

          <TextField
            label="Strikes"
            type="number"
            size="small"
            value={nStrikes}
            onChange={(e) => setNStrikes(Math.max(1, Number(e.target.value)))}
            slotProps={{ htmlInput: { min: 1 } }}
            fullWidth
            sx={textFieldSx}
          />

          <Button variant="contained" onClick={fetchSnapshot} disabled={loading} sx={buttonSx}>
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </Box>
        
        </motion.div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm text-rose-700 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <Minus size={14} />
            </div>
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-2 h-3 w-16 rounded bg-slate-100" />
                  <div className="h-6 w-20 rounded bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" style={{ height: 420 }}>
              <div className="mb-4 flex gap-4">
                {[...Array(10)].map((_, j) => (<div key={j} className="h-3 flex-1 rounded bg-slate-100" />))}
              </div>
              {[...Array(8)].map((_, j) => (<div key={j} className="mb-3 h-3 w-full rounded bg-slate-50" />))}
            </div>
          </div>
        )}

        {!loading && data && (
          <>
            {/* <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Activity size={15} />
              </div>
              <p className="text-sm text-slate-500">
                Snapshot at <span className="font-semibold text-slate-900">{data.time}</span>
              </p>
            </div> */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'N50 Spot', value: data.spot?.toFixed(2) ?? '—', icon: DollarSign, gradient: 'from-blue-50 to-indigo-50/60', iconColor: '#3b82f6' },
                { label: 'PCR (OI)', value: data.pcr?.toFixed(5) ?? '—', icon: Percent, gradient: 'from-violet-50 to-purple-50/60', iconColor: '#8b5cf6' },
                { label: 'Correlation', value: data.correlation?.toFixed(5) ?? '—', icon: Activity, gradient: 'from-cyan-50 to-teal-50/60', iconColor: '#06b6d4' },
                { label: 'Direction', value: direction?.label ?? '—', icon: direction?.label === 'Bullish' ? TrendingUp : direction?.label === 'Bearish' ? TrendingDown : Minus, gradient: 'from-amber-50 to-orange-50/60', iconColor: direction?.label === 'Bullish' ? '#22c55e' : direction?.label === 'Bearish' ? '#ef4444' : '#94a3b8' },
              ].map(({ label, value, icon: Icon, gradient, iconColor }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} border border-slate-200/70 p-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                    <Icon size={18} style={{ color: iconColor }} strokeWidth={1.8} />
                  </div>
                  <p className="mt-2 text-lg font-bold tracking-tight" style={{ color: label === 'Direction' ? iconColor : '#0f172a' }}>
                    {value}
                  </p>
                </motion.div>
              ))}
            </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <div>
    <div className="mb-3 flex items-center gap-2.5">
      <div className="h-4 w-1 rounded-full bg-emerald-500" />
      <p className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800">
        Call Options (CE)
      </p>
    </div>

    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ height: "min(420px, 70vh)" }}
    >
      <DataGrid
        rows={enrich(data.ce, "CE")}
        columns={COLUMNS}
        sx={dataGridSx}
        pageSizeOptions={[10]}
        density="compact"
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
      />
    </div>
  </div>

  <div>
    <div className="mb-3 flex items-center gap-2.5">
      <div className="h-4 w-1 rounded-full bg-rose-500" />
      <p className="text-sm font-bold uppercase tracking-[0.08em] text-slate-800">
        Put Options (PE)
      </p>
    </div>

    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ height: "min(420px, 70vh)" }}
    >
      <DataGrid
        rows={enrich(data.pe, "PE")}
        columns={COLUMNS}
        sx={dataGridSx}
        pageSizeOptions={[10]}
        density="compact"
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
      />
    </div>
  </div>
</div>
          </>
        )}
      </Box>
  );
}
