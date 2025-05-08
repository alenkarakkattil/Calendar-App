"use client"

import { useState } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import EventItem from "./event-item"
import type { Event } from "@/lib/types"
import { events } from "@/lib/data"

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names for the header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getEventsForDate = (date: Date): Event[] => {
    // In a real app, you would filter events based on the date
    // For this example, we'll just return all events for demonstration
    return events.map((event) => ({
      ...event,
      date: date, // Assign the current date to each event for demonstration
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 flex items-center justify-between bg-white border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{format(currentDate, "MMMM yyyy")}</h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
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
              onClick={() => setSelectedDate(day)}
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

      {/* Event Details Section (when a date is selected) */}
      {selectedDate && (
        <div className="p-4 border-t">
          <h3 className="font-medium mb-2">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event, i) => (
                <div key={i} className="p-2 rounded-md" style={{ backgroundColor: `${event.color}20` }}>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: event.color }}></div>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-5">
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events scheduled</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
