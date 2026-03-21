import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLiveLocations() {
  const [liveUsers, setLiveUsers] = useState([]);

  useEffect(() => {
    // Initial load
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('users_locations')
        .select('*');
      if (data) setLiveUsers(data);
    };

    fetchLocations();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('live_locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users_locations' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setLiveUsers(prev => {
            const index = prev.findIndex(u => u.username === payload.new.username);
            if (index >= 0) {
              const next = [...prev];
              next[index] = payload.new;
              return next;
            }
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'DELETE') {
          setLiveUsers(prev => prev.filter(u => u.username !== payload.old.username));
        }
      })
      .subscribe();

    // Cleanup old users (optional client side, but good for UX)
    const interval = setInterval(() => {
      const now = new Date();
      setLiveUsers(prev => prev.filter(u => {
        const lastSeen = new Date(u.last_seen);
        return (now - lastSeen) < 300000; // 5 minutes
      }));
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { liveUsers };
}
