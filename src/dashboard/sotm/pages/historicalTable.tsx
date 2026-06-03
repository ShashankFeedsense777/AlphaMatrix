import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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
  { field: "strike", headerName: "Strike", width: 80, type: "number" },
  { field: "premium", headerName: "Premium", width: 90, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
  { field: "oi", headerName: "OI", width: 100, type: "number" },
  { field: "iv", headerName: "IV", width: 70, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
  { field: "delta", headerName: "Delta", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
  { field: "theta", headerName: "Theta", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
  { field: "gamma", headerName: "Gamma", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(6) ?? "" },
  { field: "vega", headerName: "Vega", width: 70, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
  { field: "decay", headerName: "Decay", width: 80, type: "number", valueFormatter: (v?: number) => v?.toFixed(2) ?? "" },
];

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

  const direction = data ? DIRECTION_MAP[data.direction] ?? null : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <DatePicker
            label="Trading Date"
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            slotProps={{ textField: { size: "small", fullWidth: true } }}
          />

          <TextField
            label="Time (HH:MM:SS)"
            size="small"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            placeholder="09:15:00"
            fullWidth
          />

          <TextField
            label="Strikes"
            type="number"
            size="small"
            value={nStrikes}
            onChange={(e) => setNStrikes(Math.max(1, Number(e.target.value)))}
            slotProps={{ htmlInput: { min: 1 } }}
            fullWidth
          />

          <Button variant="contained" onClick={fetchSnapshot} disabled={loading} sx={{ width:"15%",height: 40, borderRadius: 2, px: 3, bgcolor: "#f97316", "&:hover": { bgcolor: "#ea580c" } }}>
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </Box>
        </motion.div>

        {error && <Alert severity="warning" sx={{ borderRadius: 3 }}>{error}</Alert>}

        {loading && (
          <Box className="flex justify-center rounded-3xl border border-slate-200 bg-white py-16 shadow-sm">
            <CircularProgress />
          </Box>
        )}

        {!loading && data && (
          <>
            <Typography variant="subtitle1" color="text.secondary" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              Snapshot at <strong>{data.time}</strong>
            </Typography>

            <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">N50 Spot</Typography>
                  <Typography variant="h5" sx={{fontWeight:700}}>{data.spot?.toFixed(2) ?? "—"}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">PCR (OI)</Typography>
                  <Typography variant="h5" sx={{fontWeight:700}}>{data.pcr?.toFixed(5) ?? "—"}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Correlation</Typography>
                  <Typography variant="h5" sx={{fontWeight:700}}>{data.correlation?.toFixed(5) ?? "—"}</Typography>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 4, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">Direction</Typography>
                  {direction ? <Chip label={direction.label} color={direction.color} /> : <Typography variant="body2">—</Typography>}
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight:600, color: "#1e293b" }}>Call Options (CE)</Typography>
              <Box className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" sx={{ height: 420 }}>
                <DataGrid rows={enrich(data.ce, "CE")} columns={COLUMNS} pageSizeOptions={[10]} density="compact" disableRowSelectionOnClick />
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight:600, color: "#1e293b" }}>Put Options (PE)</Typography>
              <Box className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm" sx={{ height: 420 }}>
                <DataGrid rows={enrich(data.pe, "PE")} columns={COLUMNS} pageSizeOptions={[10]} density="compact" disableRowSelectionOnClick />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </LocalizationProvider>
  );
}
