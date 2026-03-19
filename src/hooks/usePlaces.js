import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

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
  const [loading, setLoading] = useState(false);

  const isSupabaseConfigured = () => {
    const url = process.env.REACT_APP_SUPABASE_URL || 'TA_SUPABASE_URL';
    return url !== 'TA_SUPABASE_URL';
  };

  const fetchPlaces = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const mapped = data.map(p => ({
        ...p,
        isFavorite: p.is_favorite,
        image: p.image_url,
      }));
      setPlaces(mapped);
      save(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlaces();

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('places_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'places' }, () => {
          fetchPlaces();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchPlaces]);

  const addPlace = useCallback(async (placeData) => {
    const newPlace = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...placeData,
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('places')
        .insert([{
          id: newPlace.id,
          name: newPlace.name,
          description: newPlace.description,
          category: newPlace.category,
          lat: newPlace.lat,
          lng: newPlace.lng,
          rating: newPlace.rating,
          is_favorite: newPlace.isFavorite,
          image_url: newPlace.image, // Temporarily base64, will migrate to bucket later
          created_at: newPlace.createdAt,
        }])
        .select();
      
      if (!error && data) {
        setPlaces(prev => [data[0], ...prev]);
        return data[0];
      }
    }

    setPlaces((prev) => {
      const updated = [newPlace, ...prev];
      save(updated);
      return updated;
    });
    return newPlace;
  }, []);

  const deletePlace = useCallback(async (id) => {
    if (isSupabaseConfigured()) {
      await supabase.from('places').delete().eq('id', id);
    }

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
