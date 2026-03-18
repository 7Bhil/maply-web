import { CATEGORIES } from '../data/categories';
import PlaceCard from './PlaceCard';

export default function Sidebar({
  places,
  selectedId,
  onSelectPlace,
  onDeletePlace,
  onCopyCoords,
  onAddClick,
  filterCat,
  setFilterCat,
  search,
  setSearch,
  isAdding,
}) {
  const filtered = places.filter((p) => {
    const matchCat = !filterCat || p.category === filterCat;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
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
          <button
            className="btn-primary"
            onClick={onAddClick}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: isAdding ? 'var(--bg-tertiary)' : undefined,
              boxShadow: isAdding ? 'none' : undefined,
            }}
          >
            {isAdding ? '✕ Annuler' : '+ Lieu'}
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
          <input
            className="form-input"
            placeholder="Rechercher un lieu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
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
              selected={place.id === selectedId}
              onClick={() => onSelectPlace(place)}
              onDelete={onDeletePlace}
              onCopy={onCopyCoords}
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
