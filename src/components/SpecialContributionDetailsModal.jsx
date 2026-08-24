import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "../styles/specialContributionDetailsModal.css";
import { useEvent } from "../context/EventContext";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";
import { isOrganizer } from "../utils/authRole";

function SpecialContributionDetailsModal({
  open,
  onClose,
  contribution,
  onRefresh,
}) {
  const { user } = useAuth();

  const { activeEvent, fetchEvents } = useEvent();

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [item, setItem] = useState("");
  const [villageName, setVillageName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const organizer = isOrganizer();

  useEffect(() => {
    if (!contribution) return;

    setName(contribution.contributor_name || "");
    setItem(contribution.item_name || "");
    setVillageName(contribution.village_name || "");
    setDate(contribution.contribution_date || "");
    setDescription(contribution.description || "");

    setEditMode(false);
  }, [contribution, open]);

  if (!open || !contribution) return null;

  const hasChanges =
    name.trim() !== contribution.contributor_name ||
    item.trim() !== contribution.item_name ||
    villageName.trim() !== (contribution.village_name || "") ||
    date !== (contribution.contribution_date || "") ||
    description.trim() !== (contribution.description || "");

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Contributor name is required.");
      return;
    }

    if (!item.trim()) {
      toast.error("Contribution item is required.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("special_contributions")
      .update({
        contributor_name: name.trim(),
        item_name: item.trim(),
        village_name: villageName.trim() || null,
        contribution_date: date || null,
        description: description.trim() || null,
      })
      .eq("id", contribution.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success("Special contribution updated");

    setEditMode(false);
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${contribution.contributor_name}'s contribution "${contribution.item_name}"?`,
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("special_contributions")
      .delete()
      .eq("id", contribution.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success("Special contribution deleted");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="special-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="special-details-header">
          <h2>
            {editMode
              ? "Edit Special Contribution"
              : "Special Contribution Details"}
          </h2>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {!editMode ? (
          <>
            <div className="special-info">
              <div className="special-info-row">
                <span>Contributor</span>
                <strong>{contribution.contributor_name}</strong>
              </div>

              <div className="special-info-row">
                <span>Contribution</span>
                <strong>{contribution.item_name}</strong>
              </div>
              {contribution.village_name && (
                <div className="contribution-info-row">
                  <span>Village</span>
                  <strong>{contribution.village_name}</strong>
                </div>
              )}

              <div className="special-info-row">
                <span>Date</span>
                <strong>{formatDate(contribution.contribution_date)}</strong>
              </div>

              {contribution.description && (
                <div className="special-info-row special-description-row">
                  <span>Description</span>
                  <strong>{contribution.description}</strong>
                </div>
              )}
            </div>

            <div className="special-details-actions">
              <button
                type="button"
                className="special-delete-button"
                onClick={handleDelete}
                disabled={loading || !organizer}
              >
                Delete
              </button>

              <button
                type="button"
                className="special-edit-button"
                onClick={() => setEditMode(true)}
                disabled={!organizer}
              >
                Edit
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="event-form">
              <div className="event-form-field">
                <label>Contributor Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="event-form-field">
                <label>Contribution</label>

                <input
                  type="text"
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                />
              </div>
              <div className="event-form-field">
                <label>Village Name</label>

                <input
                  type="text"
                  value={villageName}
                  onChange={(e) => setVillageName(e.target.value)}
                  placeholder="Enter village name"
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
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="special-details-actions">
              <button
                type="button"
                className="special-cancel-button"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="special-edit-button"
                onClick={handleUpdate}
                disabled={!hasChanges || loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SpecialContributionDetailsModal;
