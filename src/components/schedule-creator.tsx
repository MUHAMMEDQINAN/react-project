

"use client"

import React, { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DetailedCustomer, DerSchedule, DerType } from "@/lib/types";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { DER_TYPE_OPTIONS } from "@/lib/types";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DerTypeIcon } from "./der-type-icon";


interface ScheduleCreatorProps {
  customers: DetailedCustomer[];
  scheduleToEdit?: DerSchedule | null;
  onCancel: () => void;
  onSave: (schedule: DerSchedule) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const slotsToCron = (slots: Record<string, boolean>): string => {
    if (Object.keys(slots).length === 0) return "No schedule selected";

    const scheduleByDay: Record<number, { hours: Set<number>, minutes: Set<number> }> = {};

    Object.keys(slots).forEach(slotId => {
        const [day, slot] = slotId.split('-').map(Number);
        if (!scheduleByDay[day]) {
            scheduleByDay[day] = { hours: new Set(), minutes: new Set() };
        }
        const hour = Math.floor(slot / 2);
        const minute = (slot % 2) * 30;
        scheduleByDay[day].hours.add(hour);
        scheduleByDay[day].minutes.add(minute);
    });
    
    const finalCronParts = Object.entries(scheduleByDay).map(([day, { hours, minutes }]) => {
        const hourPart = Array.from(hours).sort((a, b) => a - b).join(',');
        const minutePart = Array.from(minutes).sort((a, b) => a - b).join(',');
        return `${minutePart} ${hourPart} * * ${day}`;
    });

    if (finalCronParts.length === 0) return "No schedule selected";
    
    return finalCronParts.join(';');
};


const cronToSlots = (cron: string): Record<string, boolean> => {
    const slots: Record<string, boolean> = {};
    if (!cron || cron === "No schedule selected") return slots;

    const cronJobs = cron.split(';');

    cronJobs.forEach(job => {
        const parts = job.split(' ');
        if (parts.length < 5) return;

        const minutesStr = parts[0];
        const hoursStr = parts[1];
        const daysOfWeekStr = parts[4];

        if (minutesStr === '*' || hoursStr === '*' || daysOfWeekStr === '*') return;

        const minutes = minutesStr.split(',').map(Number);
        const hours = hoursStr.split(',').map(Number);
        const daysOfWeek = daysOfWeekStr.split(',').map(Number);

        if (isNaN(minutes[0]) || isNaN(hours[0]) || isNaN(daysOfWeek[0])) return;

        daysOfWeek.forEach(day => {
            hours.forEach(hour => {
                minutes.forEach(minute => {
                    const slotIndex = hour * 2 + (minute === 30 ? 1 : 0);
                    const slotId = `${day}-${slotIndex}`;
                    slots[slotId] = true;
                });
            });
        });
    });


    return slots;
}

export function ScheduleCreator({ customers, scheduleToEdit, onCancel, onSave }: ScheduleCreatorProps) {
  const { toast } = useToast();

  const isEditing = !!scheduleToEdit;
  const [derType, setDerType] = useState<DerType | undefined>(scheduleToEdit?.derType);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    scheduleToEdit ? { from: new Date(scheduleToEdit.from), to: new Date(scheduleToEdit.to) } : {
        from: new Date(),
        to: addDays(new Date(), 365),
    }
  );

  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (scheduleToEdit?.cron) {
        setSelectedSlots(cronToSlots(scheduleToEdit.cron));
    } else {
        setSelectedSlots({});
    }
  }, [scheduleToEdit]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null);
  const [dragSelectionMode, setDragSelectionMode] = useState<'select' | 'deselect'>('select');

  const gridRef = useRef<HTMLDivElement>(null);

  const availableDerTypes = useMemo(() => {
    if (customers.length !== 1) return DER_TYPE_OPTIONS;
    const existingTypes = new Set(customers[0].schedules?.map(s => s.derType) || []);
    return DER_TYPE_OPTIONS.filter(opt => !existingTypes.has(opt));
  }, [customers]);

  const getSlotId = (dayIndex: number, slotIndex: number) => `${dayIndex}-${slotIndex}`;

  const handleMouseDown = (dayIndex: number, slotIndex: number) => {
    setIsDragging(true);
    const slotId = getSlotId(dayIndex, slotIndex);
    setDragStartSlot(slotId);
    const isSelected = !!selectedSlots[slotId];
    const newSelectionMode = isSelected ? 'deselect' : 'select';
    setDragSelectionMode(newSelectionMode);
    
    const newSelectedSlots = { ...selectedSlots };
    if (newSelectionMode === 'select') {
      newSelectedSlots[slotId] = true;
    } else {
      delete newSelectedSlots[slotId];
    }
    setSelectedSlots(newSelectedSlots);
  };

  const handleMouseEnter = (dayIndex: number, slotIndex: number) => {
    if (!isDragging || !dragStartSlot) return;

    const [startDay, startSlot] = dragStartSlot.split('-').map(Number);
    const endDay = dayIndex;
    const endSlot = slotIndex;

    const previewSelection: Record<string, boolean> = {};

    for (let d = Math.min(startDay, endDay); d <= Math.max(startDay, endDay); d++) {
      for (let s = Math.min(startSlot, endSlot); s <= Math.max(startSlot, endSlot); s++) {
        const slotId = getSlotId(d, s);
        if (dragSelectionMode === 'select') {
          previewSelection[slotId] = true;
        } else {
          previewSelection[slotId] = false;
        }
      }
    }

    const updatedSlots = {...selectedSlots};
    Object.keys(previewSelection).forEach(slotId => {
        if(previewSelection[slotId]) {
            updatedSlots[slotId] = true;
        } else {
            delete updatedSlots[slotId];
        }
    });
    
    const originalStartSlotState = selectedSlots[dragStartSlot];
    if (dragSelectionMode === 'select' && !originalStartSlotState) {
        updatedSlots[dragStartSlot] = true;
    } else if (dragSelectionMode === 'deselect' && originalStartSlotState) {
        delete updatedSlots[dragStartSlot];
    }

    setSelectedSlots(updatedSlots);
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStartSlot(null);
  };
  
  const handleSave = () => {
    if (!derType) {
       toast({ variant: "destructive", title: "DER Type Required", description: "Please select a DER type for this schedule." });
       return;
    }
    if (dateRange?.from && dateRange?.to) {
        const newSchedule: DerSchedule = {
            derType,
            from: dateRange.from,
            to: dateRange.to,
            cron: slotsToCron(selectedSlots),
        };
        onSave(newSchedule);
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Date Range",
            description: "Please select a valid 'from' and 'to' date for the schedule.",
        });
    }
  }


  return (
    <div className="h-full flex flex-col p-4 overflow-hidden" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="flex-shrink-0">
           <h3 className="font-semibold text-lg">{isEditing ? `Edit Schedule for ${scheduleToEdit?.derType}` : "Create New Schedule"}</h3>
           <p className="text-muted-foreground text-sm">
             For {customers.length} selected customer{customers.length > 1 && 's'}. Drag on the grid to select time blocks.
           </p>
        </div>

        <div className="flex-shrink-0 my-4 flex items-end gap-4 border p-4 rounded-lg">
            <div className="flex-1 space-y-2">
                <Label htmlFor="der-type">DER Type</Label>
                <Select value={derType} onValueChange={(v) => setDerType(v as DerType)} disabled={isEditing}>
                    <SelectTrigger id="der-type">
                        <SelectValue placeholder="Select a DER type..." />
                    </SelectTrigger>
                    <SelectContent>
                        {isEditing && scheduleToEdit && (
                            <SelectItem key={scheduleToEdit.derType} value={scheduleToEdit.derType}>
                                <div className="flex items-center gap-2">
                                    <DerTypeIcon type={scheduleToEdit.derType} className="h-4 w-4" />
                                    {scheduleToEdit.derType}
                                </div>
                            </SelectItem>
                        )}
                        {!isEditing && availableDerTypes.map(opt => (
                            <SelectItem key={opt} value={opt}>
                                <div className="flex items-center gap-2">
                                    <DerTypeIcon type={opt} className="h-4 w-4" />
                                    {opt}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1">
                 <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
            </div>
        </div>
        
        <div ref={gridRef} className="flex-1 overflow-auto select-none border rounded-lg bg-card">
            <div className="grid grid-cols-[auto_repeat(7,1fr)]" style={{ gridTemplateRows: `auto repeat(${HOURS.length * 2}, minmax(0, 1fr))` }}>
                {/* Top-left empty corner */}
                <div className="sticky top-0 left-0 z-20 bg-card border-b border-r"></div>

                {/* Day Headers */}
                {WEEKDAYS.map((day) => (
                    <div key={day} className="sticky top-0 z-10 bg-card p-2 text-center font-semibold text-sm border-b border-r">
                        {day}
                    </div>
                ))}

                {/* Hour Labels and Grid Cells */}
                {HOURS.map((hour, hourIndex) => {
                    const slotIndex1 = hourIndex * 2;
                    const slotIndex2 = hourIndex * 2 + 1;

                    return (
                        <React.Fragment key={hour}>
                            {/* Hour Label spanning two half-hour rows */}
                            <div className="sticky left-0 bg-card text-xs text-muted-foreground text-right border-r flex items-center justify-end pr-2"
                                style={{ gridRow: `${slotIndex1 + 2} / span 2`, gridColumn: 1 }}
                            >
                                {hour}
                            </div>
                            
                            {/* Grid cells for the two half-hour slots */}
                            {WEEKDAYS.map((_, dayIndex) => {
                                const slotId1 = getSlotId(dayIndex, slotIndex1);
                                const isSelected1 = !!selectedSlots[slotId1];
                                const slotId2 = getSlotId(dayIndex, slotIndex2);
                                const isSelected2 = !!selectedSlots[slotId2];

                                return (
                                    <React.Fragment key={`${dayIndex}-${hourIndex}`}>
                                        <div
                                            onMouseDown={() => handleMouseDown(dayIndex, slotIndex1)}
                                            onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex1)}
                                            className={cn(
                                                "border-r border-b border-border/50 border-dotted cursor-pointer transition-colors min-h-[12px]",
                                                isSelected1 ? "bg-accent border-primary" : "hover:bg-muted"
                                            )}
                                            style={{ gridRow: slotIndex1 + 2, gridColumn: dayIndex + 2 }}
                                        />
                                        <div
                                            onMouseDown={() => handleMouseDown(dayIndex, slotIndex2)}
                                            onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex2)}
                                            className={cn(
                                                "border-r border-b border-border/50 border-dashed cursor-pointer transition-colors min-h-[12px]",
                                                isSelected2 ? "bg-accent border-primary" : "hover:bg-muted"
                                            )}
                                             style={{ gridRow: slotIndex2 + 2, gridColumn: dayIndex + 2 }}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>

        <div className="flex-shrink-0 pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save Schedule</Button>
        </div>
    </div>
  );
}
