import React from 'react';
import { Settings as SettingsIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { AppSettings } from '../types';

export default function SettingsView({
  settings,
  onUpdateSettings
}: {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 text-slate-300 pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-10 flex flex-col">
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            System Settings
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Configure global application behavior</p>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-1">Attendance Mode</h3>
              <p className="text-xs text-slate-400">
                {settings.autoMarkAttendance 
                  ? "Automatic: System records attendance instantly upon face match." 
                  : "Manual: Requires explicit user confirmation after face match."}
              </p>
            </div>
            
            <button
               onClick={() => onUpdateSettings({ ...settings, autoMarkAttendance: !settings.autoMarkAttendance })}
               className="flex-shrink-0 outline-none"
            >
              {settings.autoMarkAttendance ? (
                <ToggleRight className="w-12 h-12 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-12 h-12 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
