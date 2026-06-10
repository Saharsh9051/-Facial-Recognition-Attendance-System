import React from 'react';
import { AttendanceRecord } from '../types';
import { Download, CalendarDays, Clock, User } from 'lucide-react';
import { exportToCSV, formatDateTime } from '../lib/utils';

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

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 h-full">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col flex-grow relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Attendance Register</h2>
            <p className="text-[10px] text-slate-400 font-mono">Total Records: {records.length}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClear}
              className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded transition-colors font-bold uppercase"
            >
              Clear DB
            </button>
            <button
              onClick={handleExport}
              disabled={records.length === 0}
              className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors font-bold uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto rounded-xl">
          {records.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 min-h-[300px]">
              <CalendarDays className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-400">No Data Present</p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.slice().reverse().map((record) => (
                <div key={record.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800/50 hover:border-indigo-500/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                     <User className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-slate-200">{record.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">USER_ID: {record.userId.substring(0, 8)}...</p>
                  </div>
                  <div className="text-right">
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
