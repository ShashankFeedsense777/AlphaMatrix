import { useState, useEffect, useCallback } from "react";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HighchartsReact } from "highcharts-react-official";
import Highcharts from "highcharts";

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

  const getTimestamp = (time: string) => {
    if (!selectedDate) return 0;
    const [h, m, s] = time.split(":").map(Number);
    const d = new Date(selectedDate);
    d.setHours(h, m, s, 0);
    return d.getTime();
  };

  const buildOptions = (strikeData: StrikeData): Highcharts.Options => {
    const metricLabel = metric.slice(2).toUpperCase();
    const ceData = strikeData.ce.map((p) => [getTimestamp(p.time), p[metric as keyof GreekPoint]] as [number, number | null]).filter(([, v]) => v !== null);
    const peData = strikeData.pe.map((p) => [getTimestamp(p.time), p[metric as keyof GreekPoint]] as [number, number | null]).filter(([, v]) => v !== null);
    const vLineTime = getTimestamp(timeStr);

    return {
      title: {
        text: `${metricLabel} — CE vs PE | ${expiry} | Strike ${strikeData.strike} | ${selectedDate ? formatDate(selectedDate) : ""}`,
      },
      xAxis: {
        type: "datetime",
        title: { text: "Time" },
        plotLines: [{
          color: "green",
          width: 2,
          dashStyle: "Dash",
          value: vLineTime,
          label: { text: timeStr, align: "left" },
          zIndex: 5,
        }],
      },
      yAxis: { title: { text: metricLabel } },
      legend: { align: "center", verticalAlign: "top" },
      plotOptions: { series: { marker: { enabled: false } } },
      series: [
        { name: "CE", type: "line", color: "royalblue", data: ceData },
        { name: "PE", type: "line", color: "crimson", data: peData },
      ],
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box className="p-6 space-y-6">
        <Typography variant="h4" sx={{fontWeight:700}}>
          Greeks History
        </Typography>

        <Box className="flex gap-4 items-start flex-wrap">
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            slotProps={{ textField: { size: "small" } }}
          />

          <TextField
            label="Expiry"
            size="small"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value.toUpperCase())}
            placeholder="e.g. 07AUG25"
            sx={{ minWidth: 160 }}
          />

          <TextField
            label="Time (HH:MM:SS)"
            size="small"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            placeholder="10:16:00"
            sx={{ minWidth: 150 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Greek Metric</InputLabel>
            <Select value={metric} label="Greek Metric" onChange={(e) => setMetric(e.target.value)}>
              {METRICS.map((m) => (
                <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={fetchData} disabled={loading}>
            {loading ? "Loading..." : "Fetch"}
          </Button>
        </Box>

        {error && <Alert severity="warning">{error}</Alert>}

        {loading && (
          <Box className="flex justify-center py-12"><CircularProgress /></Box>
        )}

        {!loading && data.length === 0 && !error && (
          <Typography color="text.secondary" className="text-center py-12">
            Select inputs and click Fetch.
          </Typography>
        )}

        {data.map((strikeData) => (
          <Box key={strikeData.strike} className="w-full">
            <HighchartsReact highcharts={Highcharts} options={buildOptions(strikeData)} />
          </Box>
        ))}
      </Box>
    </LocalizationProvider>
  );
}
