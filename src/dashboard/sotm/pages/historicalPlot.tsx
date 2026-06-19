import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { HighchartsReact } from "highcharts-react-official";
import Highcharts from "highcharts";

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

const selectSx = {
  ...textFieldSx,
  '& .MuiSelect-select': { fontSize: '0.85rem', color: '#1e293b' },
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

const METRICS = [
  { value: "n_delta", label: "Delta" },
  { value: "n_iv", label: "IV" },
  { value: "n_theta", label: "Theta" },
  { value: "n_gamma", label: "Gamma" },
  { value: "n_vega", label: "Vega" },
  { value: "n_rho", label: "Rho" },
];

interface GreekPoint {
  time: string;
  n_iv: number | null;
  n_delta: number | null;
  n_theta: number | null;
  n_gamma: number | null;
  n_vega: number | null;
  n_rho: number | null;
}

interface StrikeData {
  strike: number;
  ce: GreekPoint[];
  pe: GreekPoint[];
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function HistoricalPlot() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [expiry, setExpiry] = useState("");
  const [metric, setMetric] = useState("n_delta");
  const [timeStr, setTimeStr] = useState("10:16:00");
  const [data, setData] = useState<StrikeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasAutoFetched = useRef(false);
  const validateAndFetchExpiry = useCallback(async (date: Date) => {
    const sDate = formatDate(date);
    try {
      const valRes = await fetch(`${API_BASE}/api/validate-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: sDate }),
      });
      const val = await valRes.json();
      if (!val.valid) {
        setError(val.reason);
        setExpiry("");
        return;
      }
      setError("");
      const expRes = await fetch(`${API_BASE}/api/expiry-from-date`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: sDate }),
      });
      const exp = await expRes.json();
      setExpiry(exp.expiry_display);
    } catch {
      setError("Failed to connect to server");
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      validateAndFetchExpiry(selectedDate);
    }
  }, [selectedDate, validateAndFetchExpiry]);

  const fetchData = async () => {
    if (!selectedDate || !expiry) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/greeks-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formatDate(selectedDate),
          expiry,
          metric,
          time: timeStr,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to fetch");
        setData([]);
        return;
      }
      const json: StrikeData[] = await res.json();
      setData(json);
    } catch {
      setError("Failed to connect to server");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expiry && selectedDate && !hasAutoFetched.current) {
      hasAutoFetched.current = true;
      fetchData();
    }
  }, [expiry, selectedDate]);

  const getTimestamp = (time: string) => {
    if (!selectedDate) return 0;
    const [h, m, s] = time.split(":").map(Number);
    const d = new Date(selectedDate);
    d.setHours(h, m, s, 0);
    return d.getTime();
  };

  const buildOptions = (strikeData: StrikeData): Highcharts.Options => {
    const metricLabel = metric.slice(2).toUpperCase();
    const ceData = strikeData.ce.map((p) => [getTimestamp(p.time), p[metric as keyof GreekPoint]] as [number, number | null]).filter(([, v]) => v !== null) as [number, number][];
    const peData = strikeData.pe.map((p) => [getTimestamp(p.time), p[metric as keyof GreekPoint]] as [number, number | null]).filter(([, v]) => v !== null) as [number, number][];
    const vLineTime = getTimestamp(timeStr);

    return {
      chart: { animation: false, style: { fontFamily: 'inherit' } },
      title: {
        text: `${metricLabel} — Strike ${strikeData.strike}`,
        style: { fontSize: '13px', fontWeight: '600', color: '#111' },
      },
      xAxis: {
        type: "datetime",
        title: { text: "Time" },
        labels: { style: { fontSize: '11px' } },
        plotLines: [{
          color: "#22c55e",
          width: 2,
          dashStyle: "Dash",
          value: vLineTime,
          label: { text: timeStr, align: "left", style: { fontSize: '10px', color: '#22c55e' } },
          zIndex: 5,
        }],
      },
      yAxis: { title: { text: metricLabel }, labels: { style: { fontSize: '11px' } } },
      legend: { align: "center", verticalAlign: "top" },
      plotOptions: { series: { marker: { enabled: false }, animation: false } },
      series: [
        { name: "CE", type: "line", color: "#3b82f6", data: ceData },
        { name: "PE", type: "line", color: "#ef4444", data: peData },
      ],
      credits: { enabled: false },
      responsive: {
        rules: [{ condition: { maxWidth: 600 }, chartOptions: { legend: { enabled: false } } }],
      },
    };
  };

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
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Curve snapshot controls</h3>
          </div>

        <Box className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[180px_160px_150px_160px_auto] xl:items-end">
          <TextField
            type="date"
            label="Select Date"
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
            label="Expiry"
            size="small"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value.toUpperCase())}
            placeholder="e.g. 07AUG25"
            fullWidth
            sx={textFieldSx}
          />

          <TextField
            label="Time (HH:MM:SS)"
            size="small"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            placeholder="10:16:00"
            fullWidth
            sx={textFieldSx}
          />

          <FormControl size="small" fullWidth sx={selectSx}>
            <InputLabel>Greek Metric</InputLabel>
            <Select value={metric} label="Greek Metric" onChange={(e) => setMetric(e.target.value)}>
              {METRICS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={fetchData} disabled={loading} sx={buttonSx}>
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </Box>
        </motion.div>

        {error && <Alert severity="warning" sx={{ borderRadius: 3 }}>{error}</Alert>}

        {loading && (
          <Box className="flex justify-center rounded-3xl border border-slate-200 bg-white py-16 shadow-sm"><CircularProgress /></Box>
        )}

        {!loading && data.length === 0 && !error && (
          <Typography color="text.secondary" className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center">
            Select inputs and click Fetch.
          </Typography>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {data.map((strikeData, index) => (
          <motion.div
            key={strikeData.strike}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.28 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <HighchartsReact highcharts={Highcharts} options={buildOptions(strikeData)} />
          </motion.div>
        ))}
        </div>
      </Box>
  );
}
