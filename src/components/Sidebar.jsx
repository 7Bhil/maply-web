import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import PlaceCard from './PlaceCard';
import { CATEGORIES } from '../data/categories';

export default function Sidebar({
  places,
  selectedId,
  onSelectPlace,
  onDeletePlace,
  onCopyCoords,
  onSharePlace,
  onAddClick,
  filterCat,
  setFilterCat,
  search,
  setSearch,
  isAdding,
  userLocation,
}) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = places.filter((p) => {
    const matchCat = !filterCat || p.category === filterCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    let matchNewFilters = true;
    if (activeFilter === 'favorites') {
      matchNewFilters = p.isFavorite; // Assuming 'isFavorite' property exists on place objects
    } else if (activeFilter === 'high_rated') {
      matchNewFilters = p.rating >= 4; // Assuming 'rating' property exists on place objects
    }
    return matchCat && matchSearch && matchNewFilters;
  });

  return (
    <aside style={{
      width: 320,
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent), #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 4px 12px var(--accent-glow)',
            }}>🗺️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Maply</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{places.length} lieu{places.length !== 1 ? 'x' : ''}</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-box">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 15px', display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
        >
          Tous
        </button>
        <button
          onClick={() => setActiveFilter('favorites')}
          className={`filter-chip ${activeFilter === 'favorites' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Heart size={12} fill={activeFilter === 'favorites' ? 'white' : 'transparent'} color={activeFilter === 'favorites' ? 'white' : '#f43f5e'} />
          Favoris
        </button>
        <button
          onClick={() => setActiveFilter('high_rated')}
          className={`filter-chip ${activeFilter === 'high_rated' ? 'active' : ''}`}
        >
          4+ ⭐
        </button>
      </div>

      {/* Category filters */}
      <div style={{
        padding: '10px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
      }}>
        <CategoryPill
          label="Tous"
          emoji="🌍"
          active={!filterCat}
          onClick={() => setFilterCat(null)}
        />
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c.id}
            label={c.label}
            emoji={c.emoji}
            color={c.color}
            active={filterCat === c.id}
            onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
          />
        ))}
      </div>

      {/* Add hint when adding mode */}
      {isAdding && (
        <div style={{
          margin: '10px 14px 0',
          background: 'rgba(99,102,241,0.1)',
          border: '1px dashed var(--accent)',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 13,
          color: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 0.3s ease',
        }}>
          <span style={{ fontSize: 18 }}>🖱️</span>
          Clique sur la carte pour placer un marqueur
        </div>
      )}

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, paddingTop: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏝️</div>
            {places.length === 0
              ? 'Aucun lieu pour l\'instant.\nAjoutes-en un !'
              : 'Aucun résultat pour cette recherche.'}
          </div>
        ) : (
          filtered.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              selectedId={selectedId}
              onSelect={onSelectPlace}
              onDelete={onDeletePlace}
              onCopyCoords={onCopyCoords}
              onShare={onSharePlace}
              userLocation={userLocation}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function CategoryPill({ label, emoji, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? (color ? `${color}22` : 'var(--accent-glow)') : 'var(--bg-tertiary)',
        border: `1px solid ${active ? (color || 'var(--accent)') : 'var(--border)'}`,
        color: active ? (color || 'var(--accent)') : 'var(--text-secondary)',
        borderRadius: 99,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{emoji}</span> {label}
    </button>
  );
}
