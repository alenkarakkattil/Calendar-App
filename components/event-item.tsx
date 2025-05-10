"use client"

import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"
import type { Event } from "@/lib/types"

export default function EventItem({ event, onEdit, onDelete }: { 
  event: Event; 
  onEdit: () => void; 
  onDelete: () => void 
}) {
  return (
    <div 
      className="text-xs px-1 py-0.5 rounded group relative overflow-hidden truncate" 
      style={{ backgroundColor: `${event.color}20` }}
    >
      <div className="flex items-center">
        <div 
          className="w-2 h-2 rounded-full mr-1 flex-shrink-0" 
          style={{ backgroundColor: event.color }}
        />
        <span className="truncate flex-grow">{event.title}</span>
        
        {/* Action buttons - visible on hover */}
        <div className="hidden group-hover:flex items-center space-x-1 flex-shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 p-0" 
            onClick={(e) => { 
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 p-0" 
            onClick={(e) => { 
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Show time if needed */}
      {event.startTime && (
        <div className="text-xs text-gray-500 pl-3">
          {event.startTime}
        </div>
      )}
    </div>
  )
}