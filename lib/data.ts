import type { Event } from "./types"

export const events: Event[] = [
  {
    id: "1",
    title: "Team Meeting",
    description: "Weekly team sync",
    date: new Date(),
    startTime: "10:00",
    endTime: "11:00",
    color: "#3b82f6",
    recurrence: "weekly",
    notificationTime: 15
  },
  {
    id: "2",
    title: "Lunch with Sarah",
    date: new Date(),
    startTime: "12:30",
    endTime: "13:30",
    color: "#22c55e",
    recurrence: "once"
  }
];
