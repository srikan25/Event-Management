import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import toast from "react-hot-toast";
import { isOrganizer } from "../utils/authRole";

function EditEventModal({ open, onClose }) {
  const { user } = useAuth();

  const { activeEvent, fetchEvents, selectEvent } = useEvent();

  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const organizer = isOrganizer();

  useEffect(() => {
    if (activeEvent) {
      setEventName(activeEvent.name || "");
    }

    setError("");
  }, [activeEvent, open]);

  if (!open || !activeEvent) {
    return null;
  }

  const hasChanges =
    eventName.trim().toLowerCase() !== activeEvent.name.trim().toLowerCase() &&
    eventName.trim().toLowerCase() !== "";

  const handleEditEvent = async () => {
    if (!hasChanges) return;

    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("events")
      .update({
        name: eventName.toLowerCase().trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeEvent.id)
      .eq("user_id", user.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchEvents();
    selectEvent(data);

    onClose();

    toast.success("Event updated successfully");
  };

  const handleDeleteEvent = async () => {
    if (!activeEvent) return;

    const confirmed = window.confirm(
      `Delete "${activeEvent.name}"?\n\n` +
        `This will permanently delete all contributions, special contributions, expenses, and previous balance records for this event.\n\n` +
        `This action cannot be undone.`,
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", activeEvent.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    localStorage.removeItem(`active_event_${user.id}`);

    onClose();

    await fetchEvents();

    toast.success("Event deleted successfully");
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-event-header">
          <h2>Edit Event</h2>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && <div className="event-form-error">{error}</div>}

        <div className="event-form-field">
          <label htmlFor="editEventName">Event Name</label>

          <input
            id="editEventName"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>

        <div className="edit-event-actions">
          <button
            type="button"
            className="event-edit-button"
            onClick={handleEditEvent}
            disabled={!hasChanges || loading || !organizer}
          >
            {loading ? "Please wait..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="event-delete-button"
            onClick={handleDeleteEvent}
            disabled={loading || !organizer}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditEventModal;
