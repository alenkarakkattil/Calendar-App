"use client"

import { format, isSameDay, isSameMonth } from "date-fns"
import EventItem from "./event-item"
import type { Event } from "@/lib/types"

interface CalendarGridProps {
  daysInMonth: Date[]
  currentDate: Date
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  getEventsForDate: (date: Date) => Event[]
}

export default function CalendarGrid({
  daysInMonth,
  currentDate,
  selectedDate,
  onSelectDate,
  getEventsForDate,
}: CalendarGridProps) {
  // Get day names for the header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <>
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 bg-white">
        {daysInMonth.map((day, i) => {
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isCurrentMonth = isSameMonth(day, currentDate)

          // Get events for this day
          const dayEvents = getEventsForDate(day)

          return (
            <div
              key={i}
              className={`min-h-[100px] p-1 border border-gray-100 ${
                !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
              } ${isToday ? "bg-blue-50" : ""} ${isSelected ? "ring-2 ring-blue-500 ring-inset" : ""}`}
              onClick={() => onSelectDate(day)}
            >
              <div className="flex justify-between">
                <span
                  className={`text-sm font-medium ${isToday ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}
                >
                  {format(day, "d")}
                </span>
              </div>

              {/* Events for this day */}
              <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayEvents.map((event, eventIndex) => (
                  <EventItem key={eventIndex} event={event} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
