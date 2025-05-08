import type { Event } from "@/lib/types"

interface EventItemProps {
  event: Event
}

export default function EventItem({ event }: EventItemProps) {
  // Check if events overlap and adjust display accordingly
  // In a real app, you would implement more sophisticated overlap detection

  return (
    <div
      className="text-xs truncate rounded px-1 py-0.5"
      style={{
        backgroundColor: event.color,
        color: "#fff",
      }}
      title={`${event.title} (${event.startTime} - ${event.endTime})`}
    >
      {event.title}
    </div>
  )
}
