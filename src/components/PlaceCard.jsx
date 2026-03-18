import React from 'react';
import { Share2, Copy, Trash2, Heart, ExternalLink } from 'lucide-react';
import { getCategoryById } from '../data/categories';

export default function PlaceCard({ place, onSelect, onDelete, onCopyCoords, onShare, selectedId, userLocation }) {
  const isSelected = selectedId === place.id;
  const cat = getCategoryById(place.category);

  const calculateDistance = (lat, lng) => {
    if (!userLocation) return null;
    const R = 6371; // km
    const dLat = (lat - userLocation.lat) * (Math.PI / 180);
    const dLon = (lng - userLocation.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; 
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  const distance = calculateDistance(place.lat, place.lng);

  return (
    <div 
      className={`place-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(place)}
    >
      {place.image && (
        <div className="place-card-image-container">
          <img src={place.image} alt={place.name} className="place-card-image" />
          {place.isFavorite && (
            <div className="favorite-badge">
              <Heart size={14} fill="#f43f5e" color="#f43f5e" />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {!place.image && (
          <div className="place-icon" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
            {cat.emoji}
          </div>
        )}
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="place-name">{place.name}</h3>
            {!place.image && place.isFavorite && <Heart size={14} fill="#f43f5e" color="#f43f5e" />}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span className="place-category">{cat.label}</span>
            {distance && <span className="place-distance">• {distance}</span>}
          </div>

          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {'⭐️'.repeat(Math.round(place.rating || 3))}
          </div>

          {isSelected && place.description && (
            <p className="place-description">
              {place.description}
            </p>
          )}
        </div>
      </div>

      <div className="place-actions" style={{ 
        marginTop: isSelected ? 15 : 12, 
        borderTop: isSelected ? '1px solid var(--border)' : 'none', 
        paddingTop: isSelected ? 12 : 0 
      }}>
        <button onClick={(e) => { e.stopPropagation(); onShare(place); }} title="Partager">
          <Share2 size={16} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onCopyCoords(place); }} title="Copier les coordonnées">
          <Copy size={16} />
        </button>
        <a 
          href={window.navigator.platform.includes('Mac') ? `maps://app?daddr=${place.lat},${place.lng}` : `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="nav-btn"
          title="Itinéraire"
        >
          <ExternalLink size={16} />
        </a>
        <button onClick={(e) => { e.stopPropagation(); onDelete(place.id); }} className="delete-btn" title="Supprimer">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
