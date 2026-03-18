import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'maply_places';

const getSaved = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = (places) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
};

export function usePlaces() {
  const [places, setPlaces] = useState(getSaved);

  const addPlace = useCallback((placeData) => {
    const newPlace = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...placeData,
    };
    setPlaces((prev) => {
      const updated = [newPlace, ...prev];
      save(updated);
      return updated;
    });
    return newPlace;
  }, []);

  const deletePlace = useCallback((id) => {
    setPlaces((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      save(updated);
      return updated;
    });
  }, []);

  const updatePlace = useCallback((id, data) => {
    setPlaces((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      save(updated);
      return updated;
    });
  }, []);

  return { places, addPlace, deletePlace, updatePlace };
}
