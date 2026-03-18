import { getCategoryById } from '../data/categories';

export default function PlaceCard({ place, selected, onClick, onDelete }) {
  const cat = getCategoryById(place.category);
  const date = new Date(place.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short',
  });

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? 'var(--bg-tertiary)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        boxShadow: selected ? `0 0 0 1px var(--accent), 0 4px 20px var(--accent-glow)` : 'none',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {/* Emoji badge */}
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: `${cat.color}22`,
        border: `1px solid ${cat.color}44`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
      }}>
        {cat.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {place.name}
        </div>
        <div style={{ fontSize: 12, color: `${cat.color}cc`, fontWeight: 500, marginTop: 1 }}>
          {cat.label}
        </div>
        {place.address && (
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            📍 {place.address}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          {date}
        </div>
      </div>

      {/* Delete */}
      <button
        className="btn-danger"
        onClick={(e) => { e.stopPropagation(); onDelete(place.id); }}
        style={{ marginTop: -2, padding: '4px 8px', fontSize: 16, lineHeight: 1 }}
        title="Supprimer"
      >
        ×
      </button>
    </div>
  );
}
