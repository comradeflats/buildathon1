'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
};

interface RegionalMapProps {
  events: Event[];
}

// Custom component to handle map bounds and resizing
function MapController({ events }: { events: Event[] }) {
  const map = useMap();

  useEffect(() => {
    if (events.length === 0) return;

    const coords = events
      .filter(e => e.coordinates)
      .map(e => [e.coordinates!.lat, e.coordinates!.lng] as L.LatLngExpression);

    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [events, map]);

  return null;
}

export default function RegionalMap({ events }: RegionalMapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const activeEvents = events.filter(e => e.status === 'active' && e.coordinates);
  const upcomingEvents = events.filter(e => e.status === 'upcoming' && e.coordinates);
  const archivedEvents = events.filter(e => e.status === 'archived' && e.coordinates);

  const createCustomIcon = (color: string) => {
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const activeIcon = createCustomIcon('#10b981'); // Emerald
  const upcomingIcon = createCustomIcon('#eab308'); // Yellow
  const archivedIcon = createCustomIcon('#71717a'); // Zinc

  return (
    <div className="relative w-full h-[600px] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 z-0">
      <MapContainer 
        center={[15, 108]} 
        zoom={4} 
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController events={events} />

        {activeEvents.map(event => (
          <Marker 
            key={event.id} 
            position={[event.coordinates!.lat, event.coordinates!.lng]}
            icon={activeIcon}
          >
            <Popup className="dark-popup">
              <EventPopup event={event} />
            </Popup>
          </Marker>
        ))}

        {upcomingEvents.map(event => (
          <Marker 
            key={event.id} 
            position={[event.coordinates!.lat, event.coordinates!.lng]}
            icon={upcomingIcon}
          >
            <Popup className="dark-popup">
              <EventPopup event={event} />
            </Popup>
          </Marker>
        ))}

        {archivedEvents.map(event => (
          <Marker 
            key={event.id} 
            position={[event.coordinates!.lat, event.coordinates!.lng]}
            icon={archivedIcon}
          >
            <Popup className="dark-popup">
              <EventPopup event={event} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl space-y-3 pointer-events-none">
        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Map Legend</h4>
        <div className="flex items-center gap-3 text-[11px] text-zinc-300">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>Active Arena</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-300">
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
          <span>Coming Soon</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-300">
          <div className="w-3 h-3 rounded-full bg-zinc-500" />
          <span>Past Sprints</span>
        </div>
      </div>

      {/* Global CSS for Leaflet Popups */}
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: #18181b !important;
          color: white !important;
          border: 1px solid #27272a !important;
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .dark-popup .leaflet-popup-content {
          margin: 0 !important;
          width: 240px !important;
        }
        .dark-popup .leaflet-popup-tip {
          background: #18181b !important;
          border: 1px solid #27272a !important;
        }
      `}</style>
    </div>
  );
}

function EventPopup({ event }: { event: Event }) {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Badge 
          variant={event.status === 'active' ? 'success' : event.status === 'upcoming' ? 'default' : 'secondary'}
          className="text-[10px] px-2 py-0"
        >
          {event.status}
        </Badge>
        <div className="flex items-center text-zinc-400 text-[10px]">
          <MapPin size={10} className="mr-1" />
          {event.location}
        </div>
      </div>
      
      <div>
        <h3 className="text-white font-bold text-sm leading-tight">{event.name}</h3>
        <p className="text-zinc-500 text-[11px] mt-1 line-clamp-2">{event.description}</p>
      </div>

      <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
        <Calendar size={12} />
        {new Date(event.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </div>

      <Link 
        href={`/events/${event.id}`}
        className="flex items-center justify-between w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold py-2 px-3 rounded-lg transition-colors group"
      >
        VIEW PROJECTS
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
