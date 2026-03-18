import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
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
      border-radius:50%;
      background:${cat.color};
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 0 3px rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.2);
      cursor:pointer;
      transition: transform 0.15s ease;
    ">${cat.emoji}</div>`,
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

export default function MapView({ places, selectedPlace, isAdding, onMapClick, onSelectPlace }) {
  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={13}
      style={{ flex: 1, height: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <MapClickHandler isAdding={isAdding} onMapClick={onMapClick} />
      {selectedPlace && <FlyToPlace selectedPlace={selectedPlace} />}
      <LocateUser />

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
    <div style={{ padding: '14px 16px', minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${cat.color}22`, border: `1px solid ${cat.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {cat.emoji}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>{place.name}</div>
          <div style={{ fontSize: 12, color: cat.color, fontWeight: 500 }}>{cat.label}</div>
        </div>
      </div>

      {place.description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
          {place.description}
        </p>
      )}

      {place.address && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>📍</span> {place.address}
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
