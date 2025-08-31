

"use client"

import React, { useState, useMemo } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, add, getDay, differenceInMinutes } from 'date-fns';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ControlPlan, DerSchedule, DerType } from '@/lib/types';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { DerTypeIcon } from './der-type-icon';

interface ScheduleViewerProps {
    schedules: (DerSchedule | ControlPlan)[];
}

type ViewMode = 'month' | 'week' | 'day';

type AggregatedEvent = {
    start: Date;
    end: Date;
    durationHours: number;
    derType: DerType;
};

const DER_COLORS: Record<DerType, string> = {
    'Solar': 'bg-yellow-500',
    'Solar + Battery': 'bg-yellow-600',
    'EV chargers': 'bg-blue-500',
    'Hot water': 'bg-red-500',
    'Other loads': 'bg-gray-500',
    'Other generation': 'bg-green-500'
};

const getEventsForDay = (date: Date, schedules: (DerSchedule | ControlPlan)[]): AggregatedEvent[] => {
    let allEvents: AggregatedEvent[] = [];
    
    schedules.forEach(scheduleItem => {
        const schedule = 'schedule' in scheduleItem ? scheduleItem.schedule : scheduleItem;

        if (!schedule.cron || schedule.cron === "No schedule selected" || date < schedule.from || date > schedule.to) {
            return;
        }

        const dayOfWeek = getDay(date);
        const timeSlots: Date[] = [];
        const cronJobs = schedule.cron.split(';');

        cronJobs.forEach(job => {
            const parts = job.split(' ');
            if (parts.length < 5) return;

            const minutesStr = parts[0];
            const hoursStr = parts[1];
            const daysOfWeekStr = parts[4];
            
            const jobDays = daysOfWeekStr.split(',').map(Number);

            if (jobDays.includes(dayOfWeek)) {
                const hours = hoursStr.split(',').map(Number);
                const minutes = minutesStr.split(',').map(Number);

                hours.forEach(hour => {
                    minutes.forEach(minute => {
                        const eventDate = new Date(date);
                        eventDate.setHours(hour, minute, 0, 0);
                        timeSlots.push(eventDate);
                    });
                });
            }
        });

        if (timeSlots.length === 0) return;
        
        timeSlots.sort((a, b) => a.getTime() - b.getTime());

        const aggregatedEvents: AggregatedEvent[] = [];
        let currentEvent: AggregatedEvent | null = null;
        
        const derType = 'derType' in scheduleItem ? scheduleItem.derType : ('derType' in schedule ? schedule.derType : 'Other loads');


        timeSlots.forEach(slot => {
            if (!currentEvent) {
                currentEvent = { start: slot, end: add(slot, { minutes: 30 }), durationHours: 0.5, derType: derType };
            } else if (slot.getTime() === currentEvent.end.getTime()) {
                currentEvent.end = add(slot, { minutes: 30 });
            } else {
                currentEvent.durationHours = differenceInMinutes(currentEvent.end, currentEvent.start) / 60;
                aggregatedEvents.push(currentEvent);
                currentEvent = { start: slot, end: add(slot, { minutes: 30 }), durationHours: 0.5, derType: derType };
            }
        });
        
        if (currentEvent) {
             currentEvent.durationHours = differenceInMinutes(currentEvent.end, currentEvent.start) / 60;
             aggregatedEvents.push(currentEvent);
        }
        allEvents = [...allEvents, ...aggregatedEvents];
    });

    return allEvents;
};

export function ScheduleViewer({ schedules = [] }: ScheduleViewerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());

    const goToNext = () => {
        const newDate = add(currentDate, { [viewMode + 's']: 1 });
        setCurrentDate(newDate);
    };

    const goToPrevious = () => {
        const newDate = add(currentDate, { [viewMode + 's']: -1 });
        setCurrentDate(newDate);
    };
    
    const goToToday = () => {
        setCurrentDate(new Date());
    }

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        return (
            <div className="grid grid-cols-7 flex-1">
                {dayNames.map(day => (
                    <div key={day} className="text-center font-semibold text-sm p-2 border-b">{day}</div>
                ))}
                {days.map((day) => {
                    const events = getEventsForDay(day, schedules);
                    return (
                        <div key={day.toString()} className={cn(
                            "border-r border-b p-1 flex flex-col min-h-[120px]",
                            !isSameMonth(day, monthStart) && "bg-muted/50 text-muted-foreground"
                        )}>
                            <span className={cn(
                                "font-semibold self-end text-xs",
                                isSameDay(day, new Date()) && "bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center"
                            )}>
                                {format(day, 'd')}
                            </span>
                            {events.length > 0 && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Badge variant="default" className="mt-2 cursor-pointer text-center flex flex-col h-auto py-1 bg-accent hover:bg-accent/90">
                                            <span>{events.length} event{events.length > 1 && 's'}</span>
                                        </Badge>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64">
                                        <h4 className="font-semibold text-center mb-2">{format(day, 'MMM d, yyyy')}</h4>
                                        <ScrollArea className="h-40">
                                            <div className="space-y-2">
                                                {events.map((event, i) => (
                                                    <div key={i} className={cn("text-xs p-1 rounded-sm text-white", DER_COLORS[event.derType])}>
                                                        <div className='flex items-center gap-1 font-semibold'>
                                                            <DerTypeIcon type={event.derType} className='h-3 w-3' />
                                                            <span>{event.derType}</span>
                                                        </div>
                                                        <div className="font-mono pl-4">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(currentDate);
        const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });
        const hours = Array.from({ length: 24 }, (_, i) => i);
    
        return (
            <div className="grid grid-cols-[auto_repeat(7,1fr)] flex-1">
                <div className="sticky top-0 z-10 bg-card" />
                {days.map(day => (
                     <div key={day.toString()} className="sticky top-0 z-10 text-center font-semibold text-sm p-2 border-b border-l bg-card">
                         {format(day, 'ccc d')}
                     </div>
                ))}
                {hours.map(hour => (
                    <React.Fragment key={hour}>
                        <div className="text-right text-xs p-2 border-r -mt-px">{`${String(hour).padStart(2,'0')}:00`}</div>
                        {days.map(day => {
                            const dayEvents = getEventsForDay(day, schedules);
                            return (
                            <div key={`${day.toString()}-${hour}`} className="border-l border-b relative h-12">
                                {dayEvents.map((event, i) => {
                                    const startHour = event.start.getHours();
                                    const startMinute = event.start.getMinutes();
                                    
                                    if (startHour !== hour) return null;
                                    
                                    const durationMinutes = differenceInMinutes(event.end, event.start);
                                    const height = (durationMinutes / 60) * 48; // 48px is row height (h-12)
                                    const top = (startMinute / 60) * 48;

                                    return (
                                       <div key={i} 
                                            className={cn("absolute text-white text-[10px] p-1 rounded-sm w-[95%] left-[2.5%] z-10", DER_COLORS[event.derType])}
                                            style={{ top: `${top}px`, height: `${height}px`}}
                                        >
                                            <p className="font-semibold truncate flex items-center gap-1"><DerTypeIcon type={event.derType} className='h-3 w-3 shrink-0' />{event.derType}</p>
                                            <p className="truncate">{format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        )})}
                    </React.Fragment>
                ))}
            </div>
        )
    }

    const renderDayView = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const events = getEventsForDay(currentDate, schedules);
        return (
             <div className="grid grid-cols-[auto_1fr] flex-1">
                {hours.map(hour => (
                    <React.Fragment key={hour}>
                        <div className="text-right text-xs p-2 border-r">{`${String(hour).padStart(2,'0')}:00`}</div>
                        <div className="border-b relative h-12">
                             {events.map((event, i) => {
                                const startHour = event.start.getHours();
                                if (startHour !== hour) return null;
                                
                                const startMinute = event.start.getMinutes();
                                const durationMinutes = differenceInMinutes(event.end, event.start);
                                const height = (durationMinutes / 60) * 48;
                                const top = (startMinute / 60) * 48;

                                return (
                                    <div key={i} className={cn("absolute text-white text-xs p-2 rounded-lg w-[95%] left-1 z-10 flex items-center gap-2", DER_COLORS[event.derType])}
                                        style={{ top: `${top}px`, height: `${height}px`}}>
                                        <DerTypeIcon type={event.derType} className="h-4 w-4 shrink-0" />
                                        <span>{event.derType}: {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </React.Fragment>
                ))}
             </div>
        );
    }
    
    const viewTitle = useMemo(() => {
        switch(viewMode) {
            case 'month': return format(currentDate, 'MMMM yyyy');
            case 'week': 
                const weekStart = startOfWeek(currentDate);
                const weekEnd = endOfWeek(currentDate);
                return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'd, yyyy')}`;
            case 'day': return format(currentDate, 'MMMM d, yyyy');
        }
    }, [currentDate, viewMode]);


    return (
        <div className="h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center p-2 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPrevious}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={goToNext}><ChevronRight className="h-4 w-4" /></Button>
                    <Button variant="outline" onClick={goToToday}>Today</Button>
                    <h3 className="text-lg font-semibold ml-4">{viewTitle}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'day' ? 'secondary' : 'outline'} onClick={() => setViewMode('day')}>Day</Button>
                    <Button variant={viewMode === 'week' ? 'secondary' : 'outline'} onClick={() => setViewMode('week')}>Week</Button>
                    <Button variant={viewMode === 'month' ? 'secondary' : 'outline'} onClick={() => setViewMode('month')}>Month</Button>
                </div>
            </div>
            <div className="flex-1 overflow-auto">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
            </div>
        </div>
    );
}

    