"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
  addDays,
  getDay,
  isBefore,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus, X, Bell, Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

// Event type definition
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

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Yellow", value: "#eab308" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
];

// EventItem Component with action buttons
function EventItem({ event, onEdit, onDelete }: { event: Event; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="text-xs px-1 py-0.5 rounded overflow-hidden truncate" style={{ backgroundColor: `${event.color}20` }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: event.color }}></div>
        <span className="truncate flex-grow">{event.title}</span>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  
  // Event form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "#3b82f6",
    recurrence: "once",
    notificationTime: 15,
  });
  
  // Notification state
  const [activeNotifications, setActiveNotifications] = useState<Event[]>([]);
  
  useEffect(() => {
    // Load events from localStorage
    const savedEvents = localStorage.getItem("calendarEvents");
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: Event) => ({
          ...event,
          date: parseISO(event.date as string),
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Failed to parse saved events:", error);
      }
    }
    
    // Set today as the selected date when component mounts
    setSelectedDate(new Date());
    
    // Set up notification checker
    const notificationInterval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(notificationInterval);
    };
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    if (events.length > 0) {
      const serializedEvents = JSON.stringify(
        events.map(event => ({
          ...event,
          date: event.date instanceof Date ? event.date.toISOString() : event.date,
        }))
      );
      localStorage.setItem("calendarEvents", serializedEvents);
    }
  }, [events]);
  
  // Check for notifications
  const checkNotifications = () => {
    const now = new Date();
    const notifiableEvents = events.filter(event => {
      if (!event.notificationTime) return false;
      
      const eventDate = event.date instanceof Date ? event.date : parseISO(event.date as string);
      const [hours, minutes] = event.startTime.split(':').map(Number);
      
      // Create event start time
      const eventDateTime = new Date(eventDate);
      eventDateTime.setHours(hours, minutes, 0, 0);
      
      // Calculate notification time
      const notificationDateTime = new Date(eventDateTime);
      notificationDateTime.setMinutes(notificationDateTime.getMinutes() - event.notificationTime);
      
      // Check if it's time to notify (within the last minute)
      const isNotificationTime = isWithinInterval(now, {
        start: new Date(notificationDateTime.getTime() - 60000), // 1 minute before notification time
        end: notificationDateTime,
      });
      
      // Handle recurring events
      if (event.recurrence === 'daily') {
        // For daily events, only check time part
        return now.getHours() === notificationDateTime.getHours() && 
               now.getMinutes() === notificationDateTime.getMinutes();
      } else if (event.recurrence === 'weekly') {
        // For weekly events, check day of week and time
        return now.getDay() === eventDateTime.getDay() &&
               now.getHours() === notificationDateTime.getHours() && 
               now.getMinutes() === notificationDateTime.getMinutes();
      }
      
      return isNotificationTime;
    });
    
    if (notifiableEvents.length > 0) {
      // Add to active notifications and show toast notifications
      setActiveNotifications(prev => [...prev, ...notifiableEvents]);
      
      notifiableEvents.forEach(event => {
        // Show browser notification if supported and permitted
        if (Notification && Notification.permission === "granted") {
          new Notification(`Event Reminder: ${event.title}`, {
            body: `Starting at ${event.startTime}`,
            icon: '/path/to/icon.png',
          });
        }
        
        // Also show toast notification
        toast({
          title: `Event Reminder: ${event.title}`,
          description: `Starting at ${event.startTime}`,
          duration: 5000,
        });
      });
    }
  };
  
  // Request notification permission
  useEffect(() => {
    if (Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day names for the header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : parseISO(event.date as string);
      
      // Handle one-time events
      if (event.recurrence === "once") {
        return isSameDay(eventDate, date);
      }
      
      // Handle daily recurring events
      if (event.recurrence === "daily") {
        // Daily events repeat every day after their start date
        return !isBefore(date, eventDate);
      }
      
      // Handle weekly recurring events
      if (event.recurrence === "weekly") {
        // Weekly events repeat on the same day of the week after their start date
        return !isBefore(date, eventDate) && getDay(date) === getDay(eventDate);
      }
      
      return false;
    });
  };
  
  // Open dialog to create a new event
  const openCreateEventDialog = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      date: date,
      startTime: "09:00",
      endTime: "10:00",
      color: "#3b82f6",
      recurrence: "once",
      notificationTime: 15,
    });
    setIsDialogOpen(true);
  };
  
  // Open dialog to edit an existing event
  const openEditEventDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      ...event,
      date: event.date instanceof Date ? event.date : parseISO(event.date as string),
    });
    setIsDialogOpen(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Save new or edited event
  const handleSaveEvent = () => {
    if (!formData.title || !formData.startTime || !formData.endTime || !formData.color) {
      alert("Please fill in all required fields");
      return;
    }
    
    const eventToSave: Event = {
      id: editingEvent?.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description || "",
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      color: formData.color!,
      recurrence: formData.recurrence as RecurrenceType || "once",
      notificationTime: formData.notificationTime,
    };
    
    if (editingEvent) {
      // Update existing event
      setEvents(prev => prev.map(event => event.id === editingEvent.id ? eventToSave : event));
    } else {
      // Add new event
      setEvents(prev => [...prev, eventToSave]);
    }
    
    setIsDialogOpen(false);
    setEditingEvent(null);
    
    // Show confirmation toast
    toast({
      title: `Event ${editingEvent ? "updated" : "created"}`,
      description: eventToSave.title,
      duration: 3000,
    });
  };
  
  // Delete an event
  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Show confirmation toast
      toast({
        title: "Event deleted",
        duration: 3000,
      });
    }
  };
  
  // Close notification
  const dismissNotification = (eventId: string) => {
    setActiveNotifications(prev => prev.filter(event => event.id !== eventId));
  };

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
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentMonth = isSameMonth(day, currentDate);

          // Get events for this day
          const dayEvents = getEventsForDate(day);

          return (
            <div
              key={i}
              className={`min-h-[100px] p-1 border border-gray-100 relative group ${
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
                
                {/* Add event button (shows on hover) */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateEventDialog(day);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Events for this day */}
              <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                {dayEvents.map((event) => (
                  <div key={event.id} className="group cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    openEditEventDialog(event);
                  }}>
                    <EventItem 
                      event={event} 
                      onEdit={() => openEditEventDialog(event)}
                      onDelete={() => handleDeleteEvent(event.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Details Section (when a date is selected) */}
      {selectedDate && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
            <Button size="sm" onClick={() => openCreateEventDialog(selectedDate)}>
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </div>
          
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 rounded-md cursor-pointer"
                  style={{ backgroundColor: `${event.color}10` }}
                  onClick={() => openEditEventDialog(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: event.color }}></div>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                        e.stopPropagation();
                        openEditEventDialog(event);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 ml-5 flex items-center justify-between">
                    <div>
                      {event.startTime} - {event.endTime}
                      {event.recurrence !== "once" && (
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          {event.recurrence === "daily" ? "Daily" : "Weekly"}
                        </span>
                      )}
                    </div>
                    {event.notificationTime && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Bell className="h-3 w-3 mr-1" />
                        {event.notificationTime} min before
                      </div>
                    )}
                  </div>
                  {event.description && (
                    <div className="text-sm text-gray-600 ml-5 mt-1">
                      {event.description}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No events scheduled</p>
            )}
          </div>
        </div>
      )}
      
      {/* Event Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create Event"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleInputChange}
                placeholder="Event title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="Add a description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <div 
                    key={color.value}
                    className={`w-8 h-8 rounded-full cursor-pointer ${
                      formData.color === color.value ? "ring-2 ring-offset-2 ring-black" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleSelectChange("color", color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select 
                value={formData.recurrence as string} 
                onValueChange={(value) => handleSelectChange("recurrence", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time event</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notification" 
                  checked={formData.notificationTime !== undefined}
                  onCheckedChange={(checked) => {
                    setFormData(prev => ({
                      ...prev,
                      notificationTime: checked ? 15 : undefined,
                    }));
                  }}
                />
                <Label htmlFor="notification">Notification reminder</Label>
              </div>
              
              {formData.notificationTime !== undefined && (
                <div className="pl-6 pt-2">
                  <Select
                    value={formData.notificationTime?.toString() || "15"}
                    onValueChange={(value) => handleSelectChange("notificationTime", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Remind me before" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes before</SelectItem>
                      <SelectItem value="10">10 minutes before</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvent}>
              {editingEvent ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Active Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 max-w-sm z-50">
        {activeNotifications.map(event => (
          <Alert key={`${event.id}-${Date.now()}`} className="bg-white border shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                <div>
                  <div className="font-medium">{event.title}</div>
                  <AlertDescription>
                    Starting at {event.startTime}
                  </AlertDescription>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 p-0" 
                onClick={() => dismissNotification(event.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  )
}