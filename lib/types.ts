// lib/types.ts
export type RecurrenceType = "once" | "daily" | "weekly";

export type Event = {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  color: string;
  recurrence: RecurrenceType;
  notificationTime?: number; // Minutes before event
};