import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";

function AddContributionModal({ open, onClose, onContributionAdded }) {
  const { user } = useAuth();
  const { activeEvent, fetchEvents } = useEvent();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [villageName, setVillageName] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [amountError, setAmountError] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!activeEvent) {
      setError("Please select an event first.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter the contributor name.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("contributions").insert({
      user_id: user.id,
      event_id: activeEvent.id,
      contributor_name: name.trim(),
      amount: Number(amount),
      village_name: villageName?.trim() || null,
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
    setAmount("");
    setVillageName("");
    setDate("");
    setDescription("");

    onClose();

    if (onContributionAdded) {
      await onContributionAdded();
    }

    toast.success("Contribution added successfully");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contribution-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <div>
            <h2>Add Contribution</h2>
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
            <label>Amount</label>

            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (e.target.value <= 0 && e.target.value !== "") {
                  setAmountError("Amount must be greater than ₹0");
                } else {
                  setAmountError("");
                }
              }}
              placeholder="Enter amount"
              required
            />
            {amountError && <span className="amount-error">{amountError}</span>}
          </div>

          <div className="event-form-field">
            <label>
              Village Name <span>(Optional)</span>
            </label>

            <input
              type="text"
              value={villageName}
              onChange={(event) => setVillageName(event.target.value)}
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

export default AddContributionModal;
