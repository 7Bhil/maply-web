import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Heart } from 'lucide-react';
import { getCategoryById } from '../data/categories';
import LocateUser from './LocateUser';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function createCategoryIcon(cat, selected) {
  return L.divIcon({
    className: `custom-marker ${selected ? 'selected' : ''}`,
    html: `<div style="
      width:36px;height:36px;
      border-radius:12px;
      background:${cat.color};
      display:flex;align-items:center;justify-content:center;
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.1);
      cursor:pointer;
      transition: all 0.2s ease;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

function MapClickHandler({ isAdding, onMapClick }) {
  const map = useMapEvents({
    click(e) {
      if (isAdding) {
        onMapClick(e.latlng);
      }
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    if (isAdding) {
      container.classList.add('map-adding-cursor');
    } else {
      container.classList.remove('map-adding-cursor');
    }
  }, [isAdding, map]);

  return null;
}

function FlyToPlace({ selectedPlace }) {
  const map = useMap();
  const prevId = useRef(null);

  useEffect(() => {
    if (selectedPlace && selectedPlace.id !== prevId.current) {
      map.flyTo([selectedPlace.lat, selectedPlace.lng], Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.8,
      });
      prevId.current = selectedPlace.id;
    }
  }, [selectedPlace, map]);

  return null;
}

export default function MapView({ places, selectedPlace, isAdding, onMapClick, onSelectPlace, userLocation }) {
  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={13}
      style={{ flex: 1, height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler isAdding={isAdding} onMapClick={onMapClick} />
      {selectedPlace && <FlyToPlace selectedPlace={selectedPlace} />}
      <LocateUser onLocationFound={(latlng) => {/* already centered by locate */}} />

      {userLocation && (
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={L.divIcon({
            className: 'user-marker',
            html: `<div style="width:20px;height:20px;border-radius:50%;background:#6366f1;border:3px solid white;box-shadow:0 0 10px rgba(99,102,241,0.5)"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        >
          <Popup>
            <div className="custom-popup" style={{ padding: '2px', minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#6366f122', border: '1px solid #6366f144',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1',
                }}>
                  <Navigation size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Ma Position</div>
                  <div style={{ fontSize: 11, color: '#6366f1' }}>Utilisateur</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '5px 0' }}>
                Tu es actuellement ici.
              </p>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {places.map((place) => {
        const cat = getCategoryById(place.category);
        const isSelected = selectedPlace?.id === place.id;
        const icon = createCategoryIcon(cat, isSelected);

        return (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={icon}
            eventHandlers={{ click: () => onSelectPlace(place) }}
          >
            <Popup>
              <PopupContent place={place} cat={cat} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

function PopupContent({ place, cat }) {
  return (
    <div className="custom-popup" style={{ padding: '2px', minWidth: 220 }}>
      {place.image && (
        <div style={{ width: '100%', height: 120, borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
          <img src={place.image} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color,
        }}>
          <MapPin size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>{place.name}</div>
            {place.isFavorite && <Heart size={12} fill="#f43f5e" color="#f43f5e" />}
          </div>
          <div style={{ fontSize: 11, color: cat.color, fontWeight: 500, marginTop: 1 }}>{cat.label}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
        {'⭐️'.repeat(Math.round(place.rating || 3))}
      </div>

      {place.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
          {place.description}
        </p>
      )}

      {place.address && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Navigation size={12} /> {place.address}
        </div>
      )}

      <div style={{
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
        <span>{new Date(place.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  );
}
