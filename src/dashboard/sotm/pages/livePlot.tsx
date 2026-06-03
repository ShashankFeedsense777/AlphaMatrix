import { useEffect, useState, useCallback, useMemo } from 'react';
import { HighchartsReact } from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { socketClient, SocketStatus } from '../../../utils/socketClient';

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
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [expiry, setExpiry]             = useState('');
  const [metric, setMetric]             = useState('n_delta');
  const [data, setData]                 = useState<StrikeData[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('idle');

  const validateAndFetchExpiry = useCallback(async (date: string) => {
    try {
      const valRes = await fetch(`${API_BASE}/api/validate-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      const val = await valRes.json();
      if (!val.valid) { setError(val.reason); setExpiry(''); return; }
      setError('');
      const expRes = await fetch(`${API_BASE}/api/expiry-from-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
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

  useEffect(() => {
    if (selectedDate) validateAndFetchExpiry(selectedDate);
  }, [selectedDate, validateAndFetchExpiry]);

  useEffect(() => {
    const unsub = socketClient.onStatus(setSocketStatus);
    return unsub;
  }, []);

  useEffect(() => {
    if (!selectedDate || !expiry) return;
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
    socketClient.send('subscribe:greeks:live', { date: selectedDate, expiry, metric });

    return () => {
      socketClient.send('unsubscribe:greeks:live', { date: selectedDate, expiry, metric });
      unsubs.forEach(u => u());
    };
  }, [expiry, mergeStrikeData, metric, normalizeLivePayload, selectedDate]);

  const getTimestamp = useCallback((time: string, dateStr: string) => {
    const [h, m, s] = time.split(':').map(Number);
    const d = new Date(dateStr);
    d.setHours(h, m, s, 0);
    return d.getTime();
  }, []);

  const metricLabel = useMemo(() =>
    METRICS.find(m => m.value === metric)?.label ?? metric.slice(2).toUpperCase()
  , [metric]);

  const buildOptions = useCallback((sd: StrikeData): Highcharts.Options => {
    const ceData = sd.ce
      .map(p => [getTimestamp(p.time, selectedDate), p[metric as keyof GreekPoint]] as [number, number | null])
      .filter(([, v]) => v !== null) as [number, number][];
    const peData = sd.pe
      .map(p => [getTimestamp(p.time, selectedDate), p[metric as keyof GreekPoint]] as [number, number | null])
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
  }, [getTimestamp, metricLabel, metric, selectedDate]);

  return (
    <div className="space-y-5">

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">

        {/* Date */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Expiry */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Expiry</label>
          <input
            type="text"
            value={expiry}
            onChange={e => setExpiry(e.target.value.toUpperCase())}
            placeholder="e.g. 07AUG25"
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-amber-400 transition-colors w-36"
          />
        </div>

        {/* Metric */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">Greek</label>
          <select
            value={metric}
            onChange={e => setMetric(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-amber-400 transition-colors"
          >
            {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Socket status */}
        <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-gray-50 border border-gray-200 ml-auto">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[socketStatus]}`} />
          <span className="text-[11px] text-gray-500 capitalize">{socketStatus}</span>
          {expiry && <span className="text-[11px] text-gray-400">· {expiry}</span>}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <span className="font-semibold">⚠</span> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-500">Waiting for live data…</span>
        </div>
      )}

      {/* Empty */}
      {!loading && data.length === 0 && !error && (
        <div className="text-center py-20 text-gray-400 text-sm">
          Select a valid trading date and expiry to start streaming.
        </div>
      )}

      {/* Charts grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {data.map(sd => (
          <div key={sd.strike} className="rounded-xl border border-gray-200 bg-white p-2 overflow-hidden">
            <HighchartsReact highcharts={Highcharts} options={buildOptions(sd)} />
          </div>
        ))}
      </div>
    </div>
  );
}