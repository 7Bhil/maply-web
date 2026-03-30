import { useState, useCallback, useEffect } from 'react';
import './index.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import AddPlaceModal from './components/AddPlaceModal';
import Auth from './components/Auth';
import { usePlaces } from './hooks/usePlaces';
import { useLiveLocations } from './hooks/useLiveLocations';
import { useToast } from './hooks/useToast';
import { supabase } from './lib/supabase';
import { LogOut, Plus, Menu, X } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  
  const { places, addPlace, deletePlace, updatePlace, toggleFavorite, updateRating } = usePlaces();
  const { toasts, addToast } = useToast();
  const { liveUsers } = useLiveLocations();

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [editingPlace, setEditingPlace] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showPseudoPrompt, setShowPseudoPrompt] = useState(false);
  const [newPseudo, setNewPseudo] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setShowPseudoPrompt(false);
      }
    });
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        setShowPseudoPrompt(false);
      } else if (error && (error.code === 'PGRST116' || error.message.includes('profiles'))) {
        setShowPseudoPrompt(true);
      }
    } catch (e) {
      setShowPseudoPrompt(true);
    }
  };

  const handleSetPseudo = async () => {
    if (!newPseudo.trim()) return;
    try {
      const { error } = await supabase.from('profiles').upsert({ id: session.user.id, username: newPseudo.trim() });
      if (!error) {
        fetchProfile(session.user.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, null, { enableHighAccuracy: true });
    }
  }, []);

  // Open modal (from either sidebar button or map click)
  const openAddModal = useCallback((coords = null) => {
    setPendingCoords(coords);
  }, []);

  const closeModal = useCallback(() => {
    setPendingCoords(null);
  }, []);

  const handleMapClick = useCallback((latlng) => {
    if (isAdding) {
      openAddModal(latlng);
    }
  }, [isAdding, openAddModal]);

  const handleAddClick = useCallback(() => {
    if (isAdding) {
      setIsAdding(false);
    } else {
      setIsAdding(true);
    }
  }, [isAdding]);

  const handleConfirmAdd = useCallback(async (placeData) => {
    const newPlace = await addPlace(placeData);
    setIsAdding(false);
    setPendingCoords(null);
    setSelectedPlace(newPlace);
    addToast(`✅ "${placeData.name}" ajouté !`);
  }, [addPlace, addToast]);

  const handleEditClick = useCallback((place) => {
    setEditingPlace(place);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingPlace(null);
  }, []);

  const handleConfirmEdit = useCallback(async (placeData) => {
    if (editingPlace.user_id !== session.user.id) {
       const newPlace = await addPlace({ ...placeData, isPublic: false });
       addToast(`✨ Lieu personnalisé et sauvegardé !`);
       setSelectedPlace(newPlace);
    } else {
       const updatedPlace = await updatePlace(editingPlace.id, placeData);
       addToast(`✏️ "${placeData.name}" modifié !`);
       if (selectedPlace?.id === editingPlace.id) setSelectedPlace(updatedPlace);
    }
    setEditingPlace(null);
  }, [editingPlace, session, addPlace, updatePlace, addToast, selectedPlace]);

  const handleDelete = useCallback((id) => {
    const place = places.find((p) => p.id === id);
    deletePlace(id);
    if (selectedPlace?.id === id) setSelectedPlace(null);
    if (place) addToast(`🗑️ "${place.name}" supprimé.`, 'error');
  }, [deletePlace, places, selectedPlace, addToast]);

  const handleSelectPlace = useCallback((place) => {
    setSelectedPlace((prev) => prev?.id === place.id ? null : place);
    setIsAdding(false);
  }, []);

  const handleCopyCoords = useCallback((place) => {
    const text = `${place.lat}, ${place.lng}`;
    navigator.clipboard.writeText(text);
    addToast(`📋 Coordonnées de "${place.name}" copiées !`);
  }, [addToast]);

  const handleShare = useCallback(async (place) => {
    const text = `Regarde ce lieu sur Maply : ${place.name}\n${place.description || ''}\nCoordonnées : ${place.lat}, ${place.lng}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur de partage:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      addToast(`📋 Détails copiés (Partage non supporté)`);
    }
  }, [addToast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative', color: 'var(--text-primary)' }}>
      {/* Toast Notifications */}
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
            <span style={{ marginRight: 8 }}>✨</span> {toast.message}
          </div>
        ))}
      </div>

      <div className={`sidebar-container ${showSidebar ? 'open' : ''}`}>
        <Sidebar 
          places={places} 
          onSelectPlace={handleSelectPlace}
          selectedPlace={selectedPlace}
          onDeletePlace={handleDelete}
          onEditPlace={handleEditClick}
          onCopyCoords={handleCopyCoords}
          onSharePlace={handleShare}
          onToggleFavorite={toggleFavorite}
          onUpdateRating={updateRating}
          filterCat={filterCat}
          setFilterCat={setFilterCat}
          search={search}
          setSearch={setSearch}
          isAdding={isAdding}
          userLocation={userLocation}
          sessionUserId={session.user.id}
        />
      </div>

      <main style={{ flex: 1, position: 'relative', zIndex: 0 }}>
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          className={`sidebar-toggle ${showSidebar ? 'open' : ''}`}
        >
          {showSidebar ? <X size={20} /> : <Menu size={20} />}
        </button>
          <MapView
            places={places}
            selectedPlace={selectedPlace}
            isAdding={isAdding}
            onMapClick={handleMapClick}
            onSelectPlace={handleSelectPlace}
            userLocation={userLocation}
            liveUsers={liveUsers}
          />

          {/* Social Stats / World Counter */}
          <div className="world-counter-badge">
             <div className="online-dot"></div>
             <span>{liveUsers.length} en ligne</span>
          </div>

        {/* Floating add button when not in add mode */}
        {!isAdding && (
          <button 
            onClick={handleAddClick}
            className="btn-primary"
            style={{ position: 'absolute', bottom: 32, right: 32, zIndex: 1000, width: 56, height: 56, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', boxShadow: 'var(--shadow-lg)' }}
            title="Ajouter un lieu"
          >
            <Plus size={24} style={{ margin: 'auto' }} />
          </button>
        )}

        <button 
          onClick={handleLogout}
          className="btn-secondary"
          style={{ position: 'absolute', top: 16, right: 80, zIndex: 1000, width: 44, height: 44, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'var(--bg-secondary)' }}
          title="Se déconnecter"
        >
          <LogOut size={20} style={{ margin: 'auto' }} />
        </button>
      </main>

      {/* Modal */}
      {(pendingCoords !== null || editingPlace !== null) && (
        <AddPlaceModal
          coords={pendingCoords}
          initialData={editingPlace}
          isFork={editingPlace && editingPlace.user_id !== session.user.id}
          onConfirm={editingPlace ? handleConfirmEdit : handleConfirmAdd}
          onClose={editingPlace ? closeEditModal : closeModal}
        />
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
      {/* Pseudo Prompt Modal */}
      {showPseudoPrompt && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: 12 }}>Bienvenue sur Maply !</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
              Choisissez un pseudo pour que vos amis puissent vous reconnaître lors des partages en direct.
            </p>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Votre pseudo..." 
              value={newPseudo}
              onChange={(e) => setNewPseudo(e.target.value)}
              style={{ marginBottom: 20 }}
              onKeyDown={(e) => e.key === 'Enter' && handleSetPseudo()}
            />
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleSetPseudo}>
              Confirmer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
