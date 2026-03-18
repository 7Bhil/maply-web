import { useState, useEffect } from 'react';
import { CATEGORIES, getCategoryById } from '../data/categories';

export default function AddPlaceModal({ coords, onConfirm, onClose }) {
  const [form, setForm] = useState({
    name: '',
    category: 'other',
    description: '',
    address: '',
    lat: coords?.lat?.toFixed(6) || '',
    lng: coords?.lng?.toFixed(6) || '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (coords) {
      setForm((f) => ({
        ...f,
        lat: coords.lat.toFixed(6),
        lng: coords.lng.toFixed(6),
      }));
    }
  }, [coords]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom du lieu est requis.'); return; }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) { setError('Coordonnées invalides.'); return; }

    const cat = getCategoryById(form.category);
    onConfirm({
      name: form.name.trim(),
      category: form.category,
      categoryLabel: cat.label,
      categoryEmoji: cat.emoji,
      categoryColor: cat.color,
      description: form.description.trim(),
      address: form.address.trim(),
      lat,
      lng,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Ajouter un lieu
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {coords ? `📍 ${parseFloat(form.lat).toFixed(4)}, ${parseFloat(form.lng).toFixed(4)}` : 'Nouveau lieu'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, cursor: 'pointer', padding: '2px 6px' }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Nom du lieu *</label>
            <input
              className="form-input"
              placeholder="Ex: Le Café du Coin"
              value={form.name}
              onChange={set('name')}
              autoFocus
            />
          </div>

          <div>
            <label style={labelStyle}>Catégorie</label>
            <select className="form-input" value={form.category} onChange={set('category')} style={{ appearance: 'none' }}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              className="form-input"
              placeholder="Décris ce lieu en quelques mots…"
              value={form.description}
              onChange={set('description')}
              rows={3}
              style={{ resize: 'vertical', minHeight: 72 }}
            />
          </div>

          <div>
            <label style={labelStyle}>Adresse (optionnel)</label>
            <input
              className="form-input"
              placeholder="Ex: 12 Rue de la Paix, Paris"
              value={form.address}
              onChange={set('address')}
            />
          </div>

          {!coords && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input className="form-input" placeholder="48.8566" value={form.lat} onChange={set('lat')} />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input className="form-input" placeholder="2.3522" value={form.lng} onChange={set('lng')} />
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>
              ✓ Ajouter le lieu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};
