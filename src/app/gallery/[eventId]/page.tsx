'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function GalleryEventRedirect() {
  const { eventId } = useParams();
  
  useEffect(() => {
    if (eventId) {
      window.location.href = `/events/${eventId}`;
    } else {
      window.location.href = '/events';
    }
  }, [eventId]);
  
  return null;
}
