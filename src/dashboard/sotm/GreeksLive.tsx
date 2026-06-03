import React, { useState } from 'react';
import { BarChart2, Table2 } from 'lucide-react';
import LivePlot from './pages/livePlot';
import LiveTable from './pages/liveTable';

type View = 'plot' | 'table';

const LiveGreeks: React.FC = () => {
  const [view, setView] = useState<View>('plot');

  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 sm:px-8 py-5 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-500 mb-1">
            State of the Market
          </p>
          <h2 className="text-xl font-semibold text-gray-900">Live Greeks</h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-gray-100 border border-gray-200 self-start sm:self-auto">
          {([
            { id: 'plot'  as const, label: 'Plot',  Icon: BarChart2 },
            { id: 'table' as const, label: 'Table', Icon: Table2    },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                view === id
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 sm:px-8 py-6">
        {view === 'plot'  && <LivePlot  />}
        {view === 'table' && <LiveTable />}
      </div>
    </div>
  );
};

export default LiveGreeks;