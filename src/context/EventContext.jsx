import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const EventContext = createContext();

export function EventProvider({ children }) {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);

  const [loadingEvents, setLoadingEvents] = useState(true);

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setActiveEvent(null);
      setLoadingEvents(false);
      return;
    }

    setLoadingEvents(true);

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error("Error fetching events:", error);
      setLoadingEvents(false);
      return;
    }

    const userEvents = data || [];

    setEvents(userEvents);

    if (userEvents.length === 0) {
      setActiveEvent(null);
      setLoadingEvents(false);
      return;
    }

    const storageKey = `active_event_${user.id}`;

    const savedEventId = localStorage.getItem(storageKey);

    const savedEvent = userEvents.find((event) => event.id === savedEventId);

    if (savedEvent) {
      setActiveEvent(savedEvent);
    } else {
      // First event is the most recently updated event
      setActiveEvent(userEvents[0]);

      localStorage.setItem(storageKey, userEvents[0].id);
    }

    setLoadingEvents(false);
  };

  const selectEvent = (event) => {
    setActiveEvent(event);

    if (user) {
      localStorage.setItem(`active_event_${user.id}`, event.id);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        loadingEvents,
        selectEvent,
        fetchEvents,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}
