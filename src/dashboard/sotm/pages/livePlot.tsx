import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { socketClient, SocketStatus } from '../../../utils/socketClient';

Highcharts.setOptions({
  time: { timezone: 'Asia/Kolkata' },
});

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LIVE_GREEKS_EVENTS = ['greeks:live'];

const METRICS = [
  { value: 'n_delta', label: 'Delta' },
  { value: 'n_iv',    label: 'IV'    },
  { value: 'n_theta', label: 'Theta' },
  { value: 'n_gamma', label: 'Gamma' },
  { value: 'n_vega',  label: 'Vega'  },
  { value: 'n_rho',   label: 'Rho'   },
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

type LiveGreeksPayload = StrikeData[] | StrikeData | { data?: StrikeData[] | StrikeData };

const STATUS_DOT: Record<SocketStatus, string> = {
  idle:        'bg-gray-400',
  connecting:  'bg-yellow-400 animate-pulse',
  open:   'bg-green-500',
  closed:'bg-red-500',
  error:       'bg-red-600',
};

export default function LivePlot() {
  const { todayRaw, today } = useMemo(() => {
    const d = new Date();
    const raw = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const fmt = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return { todayRaw: raw, today: fmt };
  }, []);

  const [expiry, setExpiry]             = useState('');
  const [metric, setMetric]             = useState('n_delta');
  const [data, setData]                 = useState<StrikeData[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('idle');

  const validateAndFetchExpiry = useCallback(async (date: string) => {
    try {
      const [valRes, expRes] = await Promise.all([
        fetch(`${API_BASE}/api/validate-date`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date }),
        }),
        fetch(`${API_BASE}/api/expiry-from-date`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date }),
        }),
      ]);
      const val = await valRes.json();
      if (!val.valid) { setError(val.reason); setExpiry(''); return; }
      setError('');
      const exp = await expRes.json();
      setExpiry(exp.expiry_display);
    } catch {
      setError('Failed to connect to server');
    }
  }, []);

  const normalizeLivePayload = useCallback((payload: LiveGreeksPayload): StrikeData[] => {
    const raw: any = Array.isArray(payload) ? payload : 'data' in payload && payload.data ? payload.data : payload;
    return Array.isArray(raw) ? raw : [raw];
  }, []);

  const mergeStrikeData = useCallback((current: StrikeData[], next: StrikeData[]) => {
    const map = new Map(current.map(i => [i.strike, i]));
    next.forEach(n => {
      const c = map.get(n.strike);
      map.set(n.strike, {
        strike: n.strike,
        ce: n.ce?.length ? n.ce : c?.ce ?? [],
        pe: n.pe?.length ? n.pe : c?.pe ?? [],
      });
    });
    return Array.from(map.values()).sort((a, b) => a.strike - b.strike);
  }, []);

  useEffect(() => { validateAndFetchExpiry(todayRaw); }, []);

  useEffect(() => {
    const unsub = socketClient.onStatus(setSocketStatus);
    return unsub;
  }, []);

  useEffect(() => {
    if (!expiry) return;
    setLoading(true);
    setError('');
    setData([]);

    const handler = (payload: LiveGreeksPayload) => {
      setData(cur => mergeStrikeData(cur, normalizeLivePayload(payload)));
      setLoading(false);
    };

    const unsubs = LIVE_GREEKS_EVENTS.map(ev =>
      socketClient.subscribe<LiveGreeksPayload>(ev, handler)
    );
    socketClient.send('subscribe:greeks:live', { date: todayRaw, expiry, metric });

    return () => {
      socketClient.send('unsubscribe:greeks:live', { date: todayRaw, expiry, metric });
      unsubs.forEach(u => u());
    };
  }, [expiry, metric]);

  const getTimestamp = useCallback((time: string, dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute, second] = time.split(':').map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    second
  ).getTime();
}, []);

  const metricLabel = useMemo(() =>
    METRICS.find(m => m.value === metric)?.label ?? metric.slice(2).toUpperCase()
  , [metric]);

  const buildOptions = useCallback((sd: StrikeData): Highcharts.Options => {
    const ceData = sd.ce
      .map(p => [getTimestamp(p.time, todayRaw), p[metric as keyof GreekPoint]] as [number, number | null])
      .filter(([, v]) => v !== null) as [number, number][];
    const peData = sd.pe
      .map(p => [getTimestamp(p.time, todayRaw), p[metric as keyof GreekPoint]] as [number, number | null])
      .filter(([, v]) => v !== null) as [number, number][];

    return {
      chart: { animation: false, style: { fontFamily: 'inherit' } },
      title: {
        text: `${metricLabel} — Strike ${sd.strike}`,
        style: { fontSize: '13px', fontWeight: '600', color: '#111' },
      },
      xAxis: { type: 'datetime', title: { text: 'Time' }, labels: { style: { fontSize: '11px' } } },
      yAxis: { title: { text: metricLabel }, labels: { style: { fontSize: '11px' } } },
      legend: { align: 'center', verticalAlign: 'top' },
      plotOptions: { series: { marker: { enabled: false }, animation: false } },
      series: [
        { name: 'CE', type: 'line', color: '#3b82f6', data: ceData },
        { name: 'PE', type: 'line', color: '#ef4444', data: peData },
      ],
      credits: { enabled: false },
      responsive: {
        rules: [{ condition: { maxWidth: 600 }, chartOptions: { legend: { enabled: false } } }],
      },
    };
  }, [getTimestamp, metricLabel, metric, todayRaw]);

  return (
    <div className="space-y-5">

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-500">Streaming Filters</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Live curve controls</h3>
        </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[160px_160px_1fr] lg:items-end">

        {/* Expiry */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Expiry</label>
          <input
            type="text"
            value={expiry}
            onChange={e => setExpiry(e.target.value.toUpperCase())}
            placeholder="e.g. 07AUG25"
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
          />
        </div>

        {/* Metric */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Greek</label>
          <select
            value={metric}
            onChange={e => setMetric(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition-colors focus:border-orange-400 focus:bg-white"
          >
            {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Socket status */}
        <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 lg:justify-self-end">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[socketStatus]}`} />
          <span className="text-[11px] text-slate-500 capitalize">{socketStatus}</span>
          {expiry && <span className="text-[11px] text-slate-600">· {today}</span>}
        </div>
      </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="font-semibold">⚠</span> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-20 shadow-sm">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Waiting for live data...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && !error && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-20 text-center text-sm text-slate-400">
          Select a valid expiry to start streaming.
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {data.map((sd, index) => (
          <motion.div
            key={sd.strike}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.28 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <HighchartsReact highcharts={Highcharts} options={buildOptions(sd)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
