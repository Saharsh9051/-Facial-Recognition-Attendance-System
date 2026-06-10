import React, { useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { Download, CalendarDays, Clock, User, BarChart3 } from 'lucide-react';
import { exportToCSV, formatDateTime } from '../lib/utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceLogs({
  records,
  onClear
}: {
  records: AttendanceRecord[];
  onClear: () => void;
}) {
  const handleExport = () => {
    const formattedData = records.map(r => ({
      Name: r.name,
      Date: r.dateStr,
      Time: new Date(r.timestamp).toLocaleTimeString(),
      'User ID': r.userId
    }));
    exportToCSV(formattedData, `Attendance_Log_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString();
      const count = records.filter(r => r.dateStr === dateStr).length;
      data.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        date: dateStr,
        attendance: count
      });
    }
    return data;
  }, [records]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full items-stretch">
      
      {/* 7-Day Trend Chart - Bento Cell */}
      <div className="col-span-12 lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col relative overflow-hidden h-[340px]">
        <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-indigo-400" />
                 7-Day Trend
              </h2>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Daily attendance activity</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{records.length}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total</p>
            </div>
        </div>

        <div className="flex-grow w-full min-h-0">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                 <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip 
                   cursor={{fill: '#1e293b'}} 
                   contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }} 
                   itemStyle={{color: '#818cf8', fontWeight: 'bold'}} 
                   labelStyle={{color: '#94a3b8', marginBottom: '4px'}}
                 />
                 <Bar dataKey="attendance" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col min-h-[400px] relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Attendance Register</h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Live synchronized logs</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClear}
              className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors font-bold uppercase"
            >
              Clear DB
            </button>
            <button
              onClick={handleExport}
              disabled={records.length === 0}
              className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto rounded-xl">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[200px]">
              <CalendarDays className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">No Data Present</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice().reverse().map((record) => (
                <div key={record.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800/50 hover:border-indigo-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                     <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{record.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">ID: {record.userId.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                     <p className="text-xs font-bold text-slate-300">{record.dateStr}</p>
                     <p className="text-[10px] font-mono text-emerald-400 mt-0.5">{new Date(record.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
