import { useState, useCallback } from 'react';
import './index.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import AddPlaceModal from './components/AddPlaceModal';
import { usePlaces } from './hooks/usePlaces';
import { useToast } from './hooks/useToast';

export default function App() {
  const { places, addPlace, deletePlace } = usePlaces();
  const { toasts, addToast } = useToast();

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState(null);

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

  const handleConfirmAdd = useCallback((placeData) => {
    const newPlace = addPlace(placeData);
    setIsAdding(false);
    setPendingCoords(null);
    setSelectedPlace(newPlace);
    addToast(`✅ "${placeData.name}" ajouté !`);
  }, [addPlace, addToast]);

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

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        places={places}
        selectedId={selectedPlace?.id}
        onSelectPlace={handleSelectPlace}
        onDeletePlace={handleDelete}
        onAddClick={handleAddClick}
        filterCat={filterCat}
        setFilterCat={setFilterCat}
        search={search}
        setSearch={setSearch}
        isAdding={isAdding}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MapView
          places={places}
          selectedPlace={selectedPlace}
          isAdding={isAdding}
          onMapClick={handleMapClick}
          onSelectPlace={handleSelectPlace}
        />

        {/* Floating add button when not in add mode */}
        {!isAdding && (
          <button
            onClick={handleAddClick}
            className="btn-primary"
            style={{
              position: 'absolute',
              bottom: 28,
              right: 28,
              zIndex: 1000,
              width: 52,
              height: 52,
              borderRadius: '50%',
              fontSize: 26,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 24px rgba(99,102,241,0.5)',
            }}
            title="Ajouter un lieu"
          >
            +
          </button>
        )}
      </div>

      {/* Modal */}
      {pendingCoords !== null && (
        <AddPlaceModal
          coords={pendingCoords}
          onConfirm={handleConfirmAdd}
          onClose={closeModal}
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
    </div>
  );
}
