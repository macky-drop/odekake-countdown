// アラームパターンの型定義
export interface AlarmPattern {
  id: string;
  label: string;
  wakeUpTime: string; // "HH:mm" 形式
  departureTime: string; // "HH:mm" 形式
  notificationIntervals: number[]; // [60, 50, 40, 30, 20, 10, 5, 3, 1]から選択
  repeatDays: number[]; // 0-6 (日-土), 空配列=OFF
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 設定の型定義
export interface AppSettings {
  soundEnabled: boolean;
  musicUrl: string;
  locationEnabled: boolean;
  notificationEnabled: boolean;
}

// 天気情報の型定義
export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

// ローカルストレージの型定義
export interface LocalStorageData {
  alarmPatterns: AlarmPattern[];
  settings: AppSettings;
}

// 通知間隔のオプション
export const NOTIFICATION_INTERVALS = [60, 50, 40, 30, 20, 10, 5, 3, 1];

// 曜日の定義
export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
export const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6];
