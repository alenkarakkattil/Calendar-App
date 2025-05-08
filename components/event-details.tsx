import { format } from "date-fns"
import type { Event } from "@/lib/types"

interface EventDetailsProps {
  selectedDate: Date | null
  events: Event[]
}

export default function EventDetails({ selectedDate, events }: EventDetailsProps) {
  if (!selectedDate) return null

  return (
    <div className="p-4 border-t">
      <h3 className="font-medium mb-2">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
      <div className="space-y-2">
        {events.length > 0 ? (
          events.map((event, i) => (
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
  )
}
