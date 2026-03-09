'use client';

import { Calendar, Clock } from 'lucide-react';
import { Event } from '@/lib/types';

interface EventSelectorProps {
  events: Event[];
  selectedEventId: string;
  onChange: (eventId: string) => void;
}

export function EventSelector({ events, selectedEventId, onChange }: EventSelectorProps) {
  // Only show events that are active or upcoming (accepting submissions)
  const availableEvents = events.filter(
    (event) => event.status === 'active' || event.status === 'upcoming'
  );

  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-GB')} – ${end.toLocaleDateString('en-GB')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB');
    const timeStr = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr}, ${timeStr}`;
  };

  if (availableEvents.length === 0) {
    return (
      <div className="text-zinc-400 text-sm flex items-center gap-2">
        <Calendar size={16} />
        <span>No events are currently accepting submissions.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableEvents.map((event) => {
        const dateRange = formatDateRange(event.startDate, event.endDate);

        return (
          <label
            key={event.id}
            className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
              selectedEventId === event.id
                ? 'border-accent bg-accent/10'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
            }`}
          >
            <input
              type="radio"
              name="event"
              value={event.id}
              checked={selectedEventId === event.id}
              onChange={() => onChange(event.id)}
              className="mt-1 w-4 h-4 text-accent border-zinc-600 bg-zinc-800 focus:ring-accent focus:ring-offset-zinc-900"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{event.name}</span>
                {event.status === 'active' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    Active
                  </span>
                )}
                {event.status === 'upcoming' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                    Upcoming
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-zinc-400 mt-1">{event.description}</p>
              )}
              <div className="flex flex-wrap gap-3 mt-1">
                {dateRange && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {dateRange}
                  </p>
                )}
                {event.submissionDeadline && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock size={12} />
                    Due: {formatDateTime(event.submissionDeadline)}
                  </p>
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
