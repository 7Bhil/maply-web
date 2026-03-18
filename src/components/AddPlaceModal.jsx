import React, { useState, useEffect, useRef } from 'react';
import { Camera, Heart, X } from 'lucide-react';
import { CATEGORIES, getCategoryById } from '../data/categories';

export default function AddPlaceModal({ coords, onConfirm, onClose }) {
  const [form, setForm] = useState({
    name: '',
    category: 'other',
    description: '',
    address: '',
    lat: coords?.lat?.toFixed(6) || '',
    lng: coords?.lng?.toFixed(6) || '',
    rating: 3,
    isFavorite: false,
    image: null,
  });
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [addrQuery, setAddrQuery] = useState('');
  const [addrResults, setAddrResults] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(false);

  useEffect(() => {
    if (coords) {
      setForm((f) => ({
        ...f,
        lat: coords.lat.toFixed(6),
        lng: coords.lng.toFixed(6),
      }));
    }
  }, [coords]);

  const handleSearchAddr = async (q) => {
    setAddrQuery(q);
    if (q.length < 3) { setAddrResults([]); return; }
    setLoadingAddr(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`);
      const data = await res.json();
      setAddrResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddr(false);
    }
  };

  const selectAddr = (item) => {
    setForm(f => ({
      ...f,
      name: item.display_name.split(',')[0],
      address: item.display_name,
      lat: parseFloat(item.lat).toFixed(6),
      lng: parseFloat(item.lon).toFixed(6),
    }));
    setAddrResults([]);
    setAddrQuery('');
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(f => ({ ...f, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm(f => ({
        ...f,
        lat: pos.coords.latitude.toFixed(6),
        lng: pos.coords.longitude.toFixed(6),
      }));
    }, null, { enableHighAccuracy: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Le nom du lieu est requis.'); return; }
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) { setError('Coordonnées invalides.'); return; }

    const cat = getCategoryById(form.category);
    onConfirm({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      lat,
      lng,
      rating: form.rating,
      categoryLabel: cat.label,
      categoryEmoji: cat.emoji,
      categoryColor: cat.color,
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

          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Rechercher une adresse</label>
            <input
              className="form-input"
              placeholder="Ex: Louvre, Paris..."
              value={addrQuery}
              onChange={(e) => handleSearchAddr(e.target.value)}
            />
            {loadingAddr && <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 4 }}>Recherche en cours...</div>}
            {addrResults.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 8, marginTop: 4, overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
              }}>
                {addrResults.map((r, i) => (
                  <div key={i} onClick={() => selectAddr(r)} style={{
                    padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderBottom: '1px solid var(--border)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }} className="addr-result-item">
                    {r.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Note & Favori</label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rating: s }))}
                    style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', opacity: form.rating >= s ? 1 : 0.2 }}
                  >⭐️</button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isFavorite: !f.isFavorite }))}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid var(--border)',
                  padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
                  color: form.isFavorite ? '#f43f5e' : 'var(--text-muted)',
                  borderColor: form.isFavorite ? '#f43f5e' : 'var(--border)'
                }}
              >
                <Heart size={16} fill={form.isFavorite ? '#f43f5e' : 'transparent'} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Coup de cœur</span>
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Photo</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="btn-secondary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 80, borderStyle: 'dashed' }}
              >
                <Camera size={20} />
                {form.image ? 'Changer' : 'Ajouter une photo'}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              {form.image && (
                <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}>
                  <img src={form.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => setForm(f => ({ ...f, image: null }))}
                    style={{ position: 'absolute', top: 2, right: 2, background: 'white', borderRadius: '50%', border: 'none', padding: 2, display: 'flex', cursor: 'pointer' }}
                  >
                    <X size={14} color="#f43f5e" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {!coords && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
              <button
                type="button"
                className="btn-secondary"
                onClick={handleLocate}
                style={{ fontSize: 12, padding: '8px', borderStyle: 'dashed' }}
              >
                📍 Utiliser ma position actuelle
              </button>
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
