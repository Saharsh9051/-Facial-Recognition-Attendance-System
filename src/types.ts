export interface RegisteredFace {
  id: string;
  name: string;
  descriptor: Float32Array; // 128d vector
  registeredAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  name: string;
  timestamp: string;
  dateStr: string;
}

export type TabState = 'scan' | 'enroll' | 'logs' | 'docs' | 'settings';

export interface AppSettings {
  autoMarkAttendance: boolean;
}
