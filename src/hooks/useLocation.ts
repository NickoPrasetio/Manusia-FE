'use client';

import { useState, useCallback } from 'react';

export type LocationStatus = 'idle' | 'requesting' | 'loading' | 'success' | 'denied' | 'error';

export interface LocationState {
  status:    LocationStatus;
  latitude?: number;
  longitude?: number;
  errorMsg?: string;
  retry:     () => void;
}

export function useLocation(): LocationState {
  const [status, setStatus]       = useState<LocationStatus>('idle');
  const [latitude, setLatitude]   = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [errorMsg, setErrorMsg]   = useState<string>();

  const retry = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Browser tidak mendukung geolocation');
      return;
    }
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('loading');
        setTimeout(() => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setStatus('success');
        }, 500);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('error');
          setErrorMsg(err.message);
        }
      },
    );
  }, []);

  return { status, latitude, longitude, errorMsg, retry };
}
