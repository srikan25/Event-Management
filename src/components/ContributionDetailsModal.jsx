import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "../styles/contributionDetailsModal.css";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";
import { useEvent } from "../context/EventContext";
import { isOrganizer } from "../utils/authRole";

function ContributionDetailsModal({ open, onClose, contribution, onRefresh }) {
  const { user } = useAuth();

  const { activeEvent, fetchEvents } = useEvent();

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [villageName, setVillageName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);

  const organizer = isOrganizer();

  useEffect(() => {
    if (!contribution) return;

    setName(contribution.contributor_name || "");
    setAmount(contribution.amount || "");
    setVillageName(contribution.village_name || "");
    setDate(contribution.contribution_date || "");
    setDescription(contribution.description || "");

    setEditMode(false);
    setAmountError("");
  }, [contribution, open]);

  if (!open || !contribution) return null;

  const hasChanges =
    name.trim() !== contribution.contributor_name ||
    Number(amount) !== Number(contribution.amount) ||
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

    if (!amount || Number(amount) <= 0) {
      setAmountError("Amount must be greater than ₹0");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("contributions")
      .update({
        contributor_name: name.trim(),
        amount: Number(amount),
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

    toast.success("Contribution updated successfully");

    setEditMode(false);
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${contribution.contributor_name}'s contribution of ₹${Number(
        contribution.amount,
      ).toLocaleString("en-IN")}?`,
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("contributions")
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

    toast.success("Contribution deleted");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="contribution-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="contribution-details-header">
          <h2>{editMode ? "Edit Contribution" : "Contribution Details"}</h2>

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
            <div className="contribution-info">
              <div className="contribution-info-row">
                <span>Contributor</span>
                <strong>{contribution.contributor_name}</strong>
              </div>

              <div className="contribution-info-row">
                <span>Amount</span>
                <strong>
                  ₹{Number(contribution.amount).toLocaleString("en-IN")}
                </strong>
              </div>
              {contribution.village_name && (
                <div className="contribution-info-row">
                  <span>Village</span>
                  <strong>{contribution.village_name}</strong>
                </div>
              )}
              <div className="contribution-info-row">
                <span>Date</span>
                <strong>{formatDate(contribution.contribution_date)}</strong>
              </div>

              {contribution.description && (
                <div className="contribution-info-row contribution-description-row">
                  <span>Description</span>
                  <strong>{contribution.description}</strong>
                </div>
              )}
            </div>

            <div className="contribution-details-actions">
              <button
                type="button"
                className="contribution-delete-button"
                onClick={handleDelete}
                disabled={loading || !organizer}
              >
                Delete
              </button>

              <button
                type="button"
                className="contribution-edit-button"
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
                <label>Amount</label>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;

                    setAmount(value);

                    if (value !== "" && Number(value) <= 0) {
                      setAmountError("Amount must be greater than ₹0");
                    } else {
                      setAmountError("");
                    }
                  }}
                />

                {amountError && (
                  <span className="amount-error">{amountError}</span>
                )}
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

            <div className="contribution-details-actions">
              <button
                type="button"
                className="contribution-cancel-button"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="contribution-edit-button"
                onClick={handleUpdate}
                disabled={!hasChanges || loading || Boolean(amountError)}
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

export default ContributionDetailsModal;
