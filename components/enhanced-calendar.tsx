"use client"

import { useState } from "react"
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns"
import CalendarHeader from "./calendar-header"
import CalendarGrid from "./calendar-grid"
import EventDetails from "./event-details"
import EventModal from "./event-modal"
import type { Event } from "@/lib/types"
import { events } from "@/lib/data"

export default function EnhancedCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get all days to display (including days from previous/next month to fill the grid)
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

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

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date)
  }

  const getEventsForDate = (date: Date): Event[] => {
    // In a real app, you would filter events based on the date
    // For this example, we'll just return all events for demonstration
    return events.map((event) => ({
      ...event,
      date: date, // Assign the current date to each event for demonstration
    }))
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      <CalendarGrid
        daysInMonth={daysInMonth}
        currentDate={currentDate}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        getEventsForDate={getEventsForDate}
      />

      {selectedDate && <EventDetails selectedDate={selectedDate} events={getEventsForDate(selectedDate)} />}

      <EventModal event={selectedEvent} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
