import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BarChart2, Radio, Table2 } from 'lucide-react';
import LivePlot from './pages/livePlot';
import LiveTable from './pages/liveTable';
import { socketClient } from '../../utils/socketClient';

type View = 'plot' | 'table';

const LiveGreeks: React.FC = () => {
  const [view, setView] = useState<View>('plot');

  const handleTabChange = useCallback((id: View) => {
    if (id === view) return;
    socketClient.send('unsubscribe:greeks:live');
    socketClient.send('unsubscribe:greeks:table');
    setView(id);
  }, [view]);

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(249,115,22,0.12),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(15,23,42,0.08),transparent_34%)]" />
        <div className="relative px-4 py-6 sm:px-8 lg:px-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600">
                <Radio size={13} className="animate-pulse" />
                Live Stream
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Live Greeks
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">
                Monitor option Greek movements as socket events arrive from the market engine.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 gap-3 sm:flex"
            >
              {[
                { label: 'Socket Driven', value: 'Realtime' },
                { label: 'Surface', value: view === 'plot' ? 'Charts' : 'Table' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-8 lg:px-10">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Market State Workspace</p>
              <p className="text-xs text-slate-500">Switch between visual plot and tabular chain view.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:flex">
          {([
            { id: 'plot'  as const, label: 'Plot',  Icon: BarChart2 },
            { id: 'table' as const, label: 'Table', Icon: Table2    },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={`relative flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                view === id
                  ? 'text-slate-950'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {view === id && (
                <motion.span
                  layoutId="live-greeks-tab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <Icon size={13} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {view === 'plot'  && <LivePlot  />}
            {view === 'table' && <LiveTable />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveGreeks;
