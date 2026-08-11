import { useEffect, useRef, useState } from 'react';
import { useMap, useMapsLibrary, APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface OrderTrackingMapProps {
  orderId: string;
  status: string;
  onClose: () => void;
}

function RouteDisplay({ origin, destination }: { origin: string | google.maps.LatLngLiteral; destination: string | google.maps.LatLngLiteral }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
            p.setOptions({ strokeColor: '#3b82f6', strokeWeight: 4 });
            p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    });

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

export default function OrderTrackingMap({ orderId, status, onClose }: OrderTrackingMapProps) {
  // Mock origin and destination based on orderId for demo purposes
  const origin = { lat: 37.7749, lng: -122.4194 }; // SF
  const destination = { lat: 37.3382, lng: -121.8863 }; // San Jose
  
  // Calculate mock current position depending on status
  const currentPos = status === 'processing' ? origin : status === 'delivered' ? destination : { lat: 37.55, lng: -122.15 };

  if (!hasValidKey) {
    return (
      <div className="bg-gray-100 dark:bg-[#121216] p-4 rounded-xl mb-4 relative h-64 flex flex-col items-center justify-center text-center">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 bg-white/50 dark:bg-white/10 rounded-full hover:bg-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <p className="text-gray-900 dark:text-white font-medium mb-2">Google Maps API Key Required</p>
        <p className="text-sm text-gray-500 max-w-xs">Please add GOOGLE_MAPS_PLATFORM_KEY to secrets in AI Studio to view live tracking map.</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-white/10 shadow-inner">
      <button onClick={onClose} className="absolute top-2 right-2 z-10 p-2 bg-white dark:bg-[#121216] text-gray-900 dark:text-white rounded-full shadow-md hover:scale-105 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={currentPos}
          defaultZoom={9}
          mapId={`map-${orderId}`}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{width: '100%', height: '100%'}}
          disableDefaultUI={true}
        >
          {status !== 'processing' && (
            <RouteDisplay origin={origin} destination={currentPos} />
          )}
          
          <AdvancedMarker position={origin} title="Origin">
            <Pin background="#9ca3af" glyphColor="#fff" borderColor="#6b7280" />
          </AdvancedMarker>
          
          <AdvancedMarker position={currentPos} title="Current Location">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                <Pin background="#3b82f6" glyphColor="#fff" borderColor="#1d4ed8" />
             </div>
          </AdvancedMarker>
          
          <AdvancedMarker position={destination} title="Destination">
            <Pin background={status === 'delivered' ? "#22c55e" : "#e5e7eb"} glyphColor={status === 'delivered' ? "#fff" : "#9ca3af"} borderColor={status === 'delivered' ? "#16a34a" : "#d1d5db"} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
