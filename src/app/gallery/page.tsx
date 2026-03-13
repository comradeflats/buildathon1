'use client';

import { useEffect } from 'react';

export default function GalleryRedirect() {
  useEffect(() => {
    window.location.href = '/events';
  }, []);
  return null;
}
