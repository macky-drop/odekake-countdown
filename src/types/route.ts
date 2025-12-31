// src/types/route.ts

export interface RouteSegment {
  type: 'train' | 'bus' | 'walk';
  line?: string;
  from: string;
  to: string;
  departure?: string;
  arrival?: string;
  duration: number; // 分
  cost?: number;
}

export interface Route {
  id: string;
  segments: RouteSegment[];
  totalDuration: number; // 分
  totalCost: number;
  transferCount: number;
  priority: 'fastest' | 'cheapest' | 'fewest-transfers';
}

export interface NotificationTiming {
  minutes: number;
  enabled: boolean;
}

export interface AlarmSettings {
  notifications: NotificationTiming[];
  soundUrl?: string;
}

export interface AlarmPreset {
  id: string;
  time: string; // HH:mm
  days: number[]; // 0=日, 1=月, ..., 6=土
  enabled: boolean;
  label?: string;
  soundUrl?: string;
}

export interface Settings {
  alarmSettings: AlarmSettings;
  alarmPresets: AlarmPreset[];
  walkingSpeed: number; // km/h
}

export interface TripPlan {
  destination: string;
  arrivalTime: string; // ISO string
  origin: string;
  selectedRoute?: Route;
  walkingTime: number; // 分
  departureTime?: string; // ISO string
}
