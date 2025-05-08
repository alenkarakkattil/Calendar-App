import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Event } from "@/lib/types"

interface EventModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }}></div>
            <span className="font-medium">{event.title}</span>
          </div>
          <div className="text-sm">
            <p>
              <span className="font-medium">Time:</span> {event.startTime} - {event.endTime}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
