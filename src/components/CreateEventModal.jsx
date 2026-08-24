import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import toast from "react-hot-toast";

function CreateEventModal({ open, onClose }) {
  const { user } = useAuth();
  const { fetchEvents, selectEvent } = useEvent();

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter an event name.");
      return;
    }

    setLoading(true);

    const { data: existingEvent, error: checkError } = await supabase
      .from("events")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", trimmedName)
      .maybeSingle();

    if (checkError) {
      setError(checkError.message);
      setLoading(false);
      return;
    }

    if (existingEvent) {
      setError("An event with this name already exists.");
      setLoading(false);
      return;
    }

    const { data: newEvent, error: insertError } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        name: trimmedName,
        event_date: eventDate || null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    selectEvent(newEvent);

    await fetchEvents();

    setLoading(false);

    // if (!name.trim()) {
    //   setError("Please enter an event name.");
    //   return;
    // }

    // setLoading(true);

    // const { data, error } = await supabase
    //   .from("events")
    //   .insert({
    //     user_id: user.id,
    //     name: name.trim(),
    //     event_date: eventDate || null,
    //   })
    //   .select()
    //   .single();

    // setLoading(false);

    // if (error) {
    //   setError(error.message);
    //   return;
    // }

    // await fetchEvents();

    // selectEvent(data);

    setName("");
    setEventDate("");

    onClose();

    toast.success("Event created successfully");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <div>
            <h2>Create New Event</h2>
            <p>Add a new event with separate data.</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {error && <div className="event-form-error">{error}</div>}

          <div className="event-form-field">
            <label htmlFor="eventName">Event Name</label>

            <input
              id="eventName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ganesh Chaturthi 2026"
              required
            />
          </div>

          <div className="event-form-field">
            <label htmlFor="eventDate">Event Date</label>

            <input
              id="eventDate"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="event-form-actions">
            <button
              type="button"
              className="event-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="event-create-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEventModal;
