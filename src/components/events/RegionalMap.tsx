'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Event } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MapPin, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { getEventStatus } from '@/lib/utils';

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
      if (coords.length === 1) {
        // If only one event, zoom in closely to it
        map.setView(coords[0], 13, { animate: true });
      } else {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { 
          padding: [50, 50], 
          maxZoom: 12, 
          animate: true 
        });
      }
    }
  }, [events, map]);

  return null;
}

export default function RegionalMap({ events }: RegionalMapProps) {
  const [activeFilter, setActiveFilter] = useState<string[]>(['active', 'upcoming', 'archived']);

  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const createCustomIcon = (color: string) => {
    return new L.DivIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  const activeIcon = createCustomIcon('#10b981'); // Emerald
  const upcomingIcon = createCustomIcon('#8b5cf6'); // Violet
  const archivedIcon = createCustomIcon('#64748b'); // Slate-500

  const toggleFilter = (status: string) => {
    setActiveFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // Derive statuses for display consistency
  const processedEvents = events.map(e => ({
    ...e,
    derivedStatus: getEventStatus(e.startDate, e.endDate)
  }));

  const filteredByStatus = processedEvents.filter(e => activeFilter.includes(e.derivedStatus));

  const activeMarkers = filteredByStatus.filter(e => e.derivedStatus === 'active' && e.coordinates);
  const upcomingMarkers = filteredByStatus.filter(e => e.derivedStatus === 'upcoming' && e.coordinates);
  const archivedMarkers = filteredByStatus.filter(e => e.derivedStatus === 'archived' && e.coordinates);

  return (
    <div className="relative w-full h-[600px] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 z-0 group/map">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%', background: '#09090b' }}
        zoomControl={false}
        worldCopyJump={false}
        maxBounds={[[-90, -180], [90, 180]]}
        minZoom={2}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />
        
        <MapController events={events} />

        {activeMarkers.map(event => (
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

        {upcomingMarkers.map(event => (
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

        {archivedMarkers.map(event => (
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

      {/* Interactive Legend Overlays */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-zinc-900/95 backdrop-blur-md border border-zinc-800 p-4 rounded-xl shadow-2xl space-y-3">
        <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2 text-zinc-500">
          Arena Filters
        </h4>
        <button 
          onClick={() => toggleFilter('active')}
          className={`flex items-center gap-3 text-[11px] font-bold transition-all w-full text-left p-1 rounded-lg hover:bg-zinc-800 ${activeFilter.includes('active') ? 'text-emerald-400' : 'text-zinc-600 grayscale'}`}
        >
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span>Active Arenas</span>
        </button>
        <button 
          onClick={() => toggleFilter('upcoming')}
          className={`flex items-center gap-3 text-[11px] font-bold transition-all w-full text-left p-1 rounded-lg hover:bg-zinc-800 ${activeFilter.includes('upcoming') ? 'text-violet-400' : 'text-zinc-600 grayscale'}`}
        >
          <div className="w-3 h-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
          <span>Upcoming Sprints</span>
        </button>
        <button 
          onClick={() => toggleFilter('archived')}
          className={`flex items-center gap-3 text-[11px] font-bold transition-all w-full text-left p-1 rounded-lg hover:bg-zinc-800 ${activeFilter.includes('archived') ? 'text-slate-400' : 'text-zinc-600 grayscale'}`}
        >
          <div className="w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]" />
          <span>Past Arenas</span>
        </button>

        {activeFilter.length < 3 && (
           <button 
             onClick={() => setActiveFilter(['active', 'upcoming', 'archived'])}
             className="text-[10px] text-zinc-500 hover:text-white mt-2 flex items-center gap-1 mx-auto pt-2 border-t border-zinc-800 w-full justify-center"
           >
             <X size={10} /> Reset Filters
           </button>
        )}
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

function EventPopup({ event }: { event: any }) {
  const status = getEventStatus(event.startDate, event.endDate);
  
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Badge 
          variant={status === 'active' ? 'success' : status === 'upcoming' ? 'default' : 'secondary'}
          className={`text-[10px] px-2 py-0 ${status === 'upcoming' ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' : ''}`}
        >
          {status}
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
        href={`/gallery/${event.id}`}
        className="flex items-center justify-between w-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-[11px] font-bold py-2 px-3 rounded-lg transition-colors group"
      >
        EXPLORE ARENA
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
