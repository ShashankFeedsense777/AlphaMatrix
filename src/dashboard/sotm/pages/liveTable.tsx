import { useEffect, useState, useCallback } from 'react';
import { DataGrid, GridColDef, GridCellParams } from '@mui/x-data-grid';
import { socketClient, SocketStatus } from '../../../utils/socketClient';

const TABLE_EVENTS = ['greeks:table'];

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

interface TablePayload {
  time: string;
  spot: number;
  pcr: number;
  correlation: number;
  direction: number;
  ce: GreekRow[];
  pe: GreekRow[];
}

const HIGHLIGHT_FIELDS = ['oi', 'iv', 'delta', 'theta'];

const STATUS_DOT: Record<SocketStatus, string> = {
  idle:         'bg-gray-400',
  connecting:   'bg-yellow-400 animate-pulse',
  open:         'bg-green-500',
  closed:       'bg-red-500',
  error:        'bg-red-600',
};

const DIRECTION_MAP: Record<number, { label: string; cls: string }> = {
  0:   { label: 'Neutral',  cls: 'bg-gray-100 text-gray-600'   },
  1:   { label: 'Bullish',  cls: 'bg-green-100 text-green-700' },
  [-1]:{ label: 'Bearish',  cls: 'bg-red-100 text-red-700'     },
};

function enrichRows(rows: GreekRow[], type: 'CE' | 'PE'): GreekRow[] {
  return rows.map((r, i) => ({ ...r, id: `${type}-${r.position}-${i}` }));
}

/** Returns a map of field → max value for the given rows */
function getMaxMap(rows: GreekRow[]): Record<string, number> {
  const map: Record<string, number> = {};
  HIGHLIGHT_FIELDS.forEach(field => {
    map[field] = Math.max(...rows.map(r => Math.abs((r as any)[field] ?? -Infinity)));
  });
  return map;
}

/** Build columns with per-type highlight color injected via cellClassName */
function buildColumns(
  maxMap: Record<string, number>,
  highlightColor: string
): GridColDef[] {
  const base: GridColDef[] = [
    { field: 'position', headerName: 'Position', width: 90 },
    { field: 'strike',   headerName: 'Strike',   width: 80,  type: 'number' },
    { field: 'premium',  headerName: 'Premium',  width: 90,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(2) ?? '' },
    { field: 'oi',       headerName: 'OI',       width: 100, type: 'number' },
    { field: 'iv',       headerName: 'IV',       width: 70,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(2) ?? '' },
    { field: 'delta',    headerName: 'Delta',    width: 80,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(2) ?? '' },
    { field: 'theta',    headerName: 'Theta',    width: 80,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(2) ?? '' },
    { field: 'gamma',    headerName: 'Gamma',    width: 80,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(6) ?? '' },
    { field: 'vega',     headerName: 'Vega',     width: 70,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(2) ?? '' },
    { field: 'decay',    headerName: 'Decay',    width: 80,  type: 'number', valueFormatter: (v?: number) => v?.toFixed(2) ?? '' },
  ];

  return base.map(col => {
    if (!HIGHLIGHT_FIELDS.includes(col.field)) return col;

    return {
      ...col,
      cellClassName: (params: GridCellParams) => {
        const val = Math.abs(params.value as number ?? -Infinity);
        return val === maxMap[col.field] ? 'cell-highlight' : '';
      },
    };
  });
}

export default function LiveTable() {
  const [data, setData]                 = useState<TablePayload | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [socketStatus, setSocketStatus] = useState<SocketStatus>('idle');
  const [nPosition, setNPosition]       = useState(2);

  useEffect(() => {
    const unsub = socketClient.onStatus(setSocketStatus);
    return unsub;
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);

    const handler = (payload: TablePayload) => { setData(payload); setLoading(false); };
    const unsubs = TABLE_EVENTS.map(ev => socketClient.subscribe<TablePayload>(ev, handler));
    socketClient.send('subscribe:greeks:table', { n_position: nPosition });

    return () => {
      socketClient.send('unsubscribe:greeks:table');
      unsubs.forEach(u => u());
    };
  }, [nPosition]);

  const direction = data ? (DIRECTION_MAP[data.direction] ?? DIRECTION_MAP[0]) : null;

  const ceRows  = data ? enrichRows(data.ce, 'CE') : [];
  const peRows  = data ? enrichRows(data.pe, 'PE') : [];
  const ceMax   = data ? getMaxMap(data.ce) : {};
  const peMax   = data ? getMaxMap(data.pe) : {};
  const ceCols  = buildColumns(ceMax, '#445a7e');
  const peCols  = buildColumns(peMax, '#834f7c');

  const gridSx = useCallback((highlightBg: string, hoverBg: string) => ({
    border: 'none',
    fontSize: '12px',
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: '#f9fafb',
      fontSize: '11px',
      fontWeight: 600,
    },
    '& .MuiDataGrid-row:hover': { backgroundColor: hoverBg },
    // Highlighted cells
    '& .cell-highlight': {
      backgroundColor: highlightBg,
      color: '#ffffff',
      fontWeight: 600,
    },
    '& .MuiDataGrid-row:hover .cell-highlight': {
      backgroundColor: highlightBg,
      filter: 'brightness(1.15)',
    },
  }), []);

  return (
    <div className="space-y-5">

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Strike positions
          </label>
          <input
            type="number"
            min={1} max={10} step={1}
            value={nPosition}
            onChange={e => setNPosition(Math.max(1, Math.min(10, Number(e.target.value))))}
            className="w-16 h-9 px-3 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[socketStatus]}`} />
          <span className="text-[11px] text-gray-500 capitalize">{socketStatus}</span>
          {data?.time && <span className="text-[11px] text-gray-400">· {data.time}</span>}
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

      {!loading && !data && !error && (
        <div className="text-center py-20 text-gray-400 text-sm">Waiting for live data…</div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'N50 Spot',    value: data.spot?.toFixed(2)        },
              { label: 'PCR (OI)',    value: data.pcr?.toFixed(5)         },
              { label: 'Correlation', value: data.correlation?.toFixed(5) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900 tabular-nums">{value ?? '—'}</p>
              </div>
            ))}

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-1">Direction</p>
              {direction ? (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${direction.cls}`}>
                  {direction.label}
                </span>
              ) : <p className="text-gray-400">—</p>}
            </div>
          </div>

          {/* Highlight legend */}
          <div className="flex items-center gap-4 text-[11px] text-gray-500">
            <span className="font-semibold text-gray-600">Max highlights:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#445a7e' }} />
              CE — OI, IV, Delta, Theta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#834f7c' }} />
              PE — OI, IV, Delta, Theta
            </span>
          </div>

          {/* CE Table */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#445a7e' }} />
              <h3 className="text-sm font-semibold text-gray-800">Call Options (CE)</h3>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ height: 380 }}>
              <DataGrid
                rows={ceRows}
                columns={ceCols}
                pageSizeOptions={[10]}
                density="compact"
                disableRowSelectionOnClick
                sx={gridSx('#445a7e', '#f0f4ff')}
              />
            </div>
          </div>

          {/* PE Table */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: '#834f7c' }} />
              <h3 className="text-sm font-semibold text-gray-800">Put Options (PE)</h3>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ height: 380 }}>
              <DataGrid
                rows={peRows}
                columns={peCols}
                pageSizeOptions={[10]}
                density="compact"
                disableRowSelectionOnClick
                sx={gridSx('#834f7c', '#fdf0fc')}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}