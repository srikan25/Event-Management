import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";

function AddSpecialContributionModal({
  open,
  onClose,
  onSpecialContributionAdded,
}) {
  const { user } = useAuth();
  const { activeEvent, fetchEvents } = useEvent();

  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [villageName, setVillageName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!activeEvent) {
      setError("Please select an event first.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter the contributor name.");
      return;
    }

    if (!item.trim()) {
      setError("Please enter the contributed item.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("special_contributions").insert({
      user_id: user.id,
      event_id: activeEvent.id,
      contributor_name: name.trim(),
      item_name: item.trim(),
      village_name: villageName.trim() || null,
      contribution_date: date || new Date().toISOString().split("T")[0],
      description: description.trim() || null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();

    setName("");
    setItem("");
    setVillageName("");
    setDate("");
    setDescription("");

    onClose();

    if (onSpecialContributionAdded) {
      await onSpecialContributionAdded();
    }

    toast.success("Special contribution added");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contribution-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <div>
            <h2>Add Special Contribution</h2>
            <p>{activeEvent?.name}</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="event-form" onSubmit={handleSubmit}>
          {error && <div className="event-form-error">{error}</div>}

          <div className="event-form-field">
            <label>Contributor Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contributor name"
              required
            />
          </div>

          <div className="event-form-field">
            <label>Item / Contribution</label>

            <input
              type="text"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Example: 20 plastic chairs"
              required
            />
          </div>

          <div className="event-form-field">
            <label>
              Village Name <span>(Optional)</span>
            </label>
            <input
              type="text"
              value={villageName}
              onChange={(event) => setVillageName(event.target.value)}
              placeholder="Ex: Bg Valasa"
            />
          </div>

          <div className="event-form-field">
            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="event-form-field">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="event-create-button"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Contribution"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddSpecialContributionModal;
