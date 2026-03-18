import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

export default function LocateUser({ onLocationFound }) {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const locate = () => {
    setLoading(true);
    map.locate({ setView: true, maxZoom: 16 });
  };

  useEffect(() => {
    map.on('locationfound', (e) => {
      setLoading(false);
      if (onLocationFound) onLocationFound(e.latlng);
    });

    map.on('locationerror', () => {
      setLoading(false);
      // Fallback or silent fail
      console.warn("Geolocation denied or failed.");
    });

    // Auto-locate on mount
    locate();
  }, [map, locate, onLocationFound]);

  return (
    <button
      onClick={locate}
      title="Ma position"
      style={{
        position: 'absolute',
        bottom: 90,
        right: 28,
        zIndex: 1000,
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        cursor: 'pointer',
        boxShadow: 'var(--shadow)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
    >
      {loading ? '🛰️' : '🎯'}
    </button>
  );
}
