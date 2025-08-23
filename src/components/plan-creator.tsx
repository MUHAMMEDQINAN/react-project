

"use client"

import React, { useState, useRef, useEffect } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ControlPlan, DerSchedule, DerType } from "@/lib/types";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { DER_TYPE_OPTIONS } from "@/lib/types";
import { DerTypeIcon } from "./der-type-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface PlanCreatorProps {
  plan?: ControlPlan | null;
  onCancel: () => void;
  onSave: (plan: ControlPlan) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

const slotsToCron = (slots: Record<string, boolean>): string => {
    if (Object.keys(slots).length === 0) return "No schedule selected";

    const dailyCronParts = Object.entries(
        Object.keys(slots).reduce((acc, slotId) => {
            const [day, slot] = slotId.split('-').map(Number);
            if (!acc[day]) {
                acc[day] = { hours: new Set(), minutes: new Set() };
            }
            const hour = Math.floor(slot / 2);
            const minute = (slot % 2) * 30;
            acc[day].hours.add(hour);
            acc[day].minutes.add(minute);
            return acc;
        }, {} as Record<number, { hours: Set<number>, minutes: Set<number> }>)
    )
    .map(([day, { hours, minutes }]) => {
        if (hours.size === 0) return null;
        const hourPart = Array.from(hours).sort((a, b) => a - b).join(',');
        const minutePart = Array.from(minutes).sort((a, b) => a - b).join(',');
        return `${minutePart} ${hourPart} * * ${day}`;
    })
    .filter(part => part !== null);
    
    if (dailyCronParts.length === 0) return "No schedule selected";
    
    return dailyCronParts.join(';');
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

export function PlanCreator({ plan, onCancel, onSave }: PlanCreatorProps) {
  const { toast } = useToast();

  const [name, setName] = useState(plan?.name || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [derType, setDerType] = useState<DerType | undefined>(plan?.derType);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    plan?.schedule ? { from: new Date(plan.schedule.from), to: new Date(plan.schedule.to) } : {
        from: new Date(),
        to: addDays(new Date(), 365),
    }
  );

  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (plan?.schedule?.cron) {
        setSelectedSlots(cronToSlots(plan.schedule.cron));
    }
  }, [plan]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStartSlot, setDragStartSlot] = useState<string | null>(null);
  const [dragSelectionMode, setDragSelectionMode] = useState<'select' | 'deselect'>('select');

  const gridRef = useRef<HTMLDivElement>(null);


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
    if (!name) {
      toast({ variant: "destructive", title: "Missing Plan Name", description: "Please provide a name for the plan." });
      return;
    }
    if (!derType) {
      toast({ variant: "destructive", title: "Missing DER Type", description: "Please select a DER type this plan applies to." });
      return;
    }
    if (dateRange?.from && dateRange?.to) {
        const newSchedule: Omit<DerSchedule, 'derType'> = {
            from: dateRange.from,
            to: dateRange.to,
            cron: slotsToCron(selectedSlots),
        };
        const newPlan: ControlPlan = {
            id: plan?.id || "", // ID will be set in the parent component
            name,
            description,
            derType,
            schedule: newSchedule,
        }
        onSave(newPlan);
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
           <h3 className="font-semibold text-lg">{plan ? "Edit Plan" : "Create New Plan"}</h3>
           <p className="text-muted-foreground text-sm">
             Define the plan details and drag on the grid below to select time blocks for load control.
           </p>
        </div>

        <div className="flex-shrink-0 my-4 flex flex-col gap-4 border p-4 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input id="plan-name" placeholder="e.g., Summer Weekday Peak" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="der-type">DER Type</Label>
                   <Select value={derType} onValueChange={(value) => setDerType(value as DerType)}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select a DER type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {DER_TYPE_OPTIONS.map((option) => (
                           <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                <DerTypeIcon type={option} className="h-4 w-4" />
                                {option}
                              </div>
                           </SelectItem>
                        ))}
                      </SelectContent>
                   </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea id="plan-description" placeholder="Briefly describe the purpose of this plan..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
             <div className="space-y-2">
                <Label>Effective Date Range</Label>
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
            <Button onClick={handleSave}>{plan ? "Save Changes" : "Create Plan"}</Button>
        </div>
    </div>
  );
}
