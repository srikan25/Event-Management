import { useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";

function AddExpenseModal({ open, onClose, onExpenseAdded }) {
  const { user } = useAuth();
  const { activeEvent, fetchEvents } = useEvent();

  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [expenseDate, setExpenseDate] = useState("");
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

    if (!reason.trim()) {
      setError("Please enter the expense reason.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const finalExpenseDate = expenseDate
      ? new Date(expenseDate).toISOString()
      : new Date().toISOString();

    setLoading(true);

    const { error } = await supabase.from("expenses").insert({
      user_id: user.id,
      event_id: activeEvent.id,
      title: reason.trim(),
      amount: Number(amount),
      category,
      expense_date: finalExpenseDate,
      description: description.trim() || null,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();

    setReason("");
    setAmount("");
    setCategory("other");
    setExpenseDate("");
    setDescription("");

    onClose();

    if (onExpenseAdded) {
      await onExpenseAdded();
    }

    toast.success("Expense added successfully");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="contribution-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <div>
            <h2>Add Expense</h2>
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
            <label>Expense Reason</label>

            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: Decoration Materials"
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
            <label>Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="idol">Ganesh Idol</option>
              <option value="decoration">Decoration</option>
              <option value="flowers">Flowers</option>
              <option value="sound">Sound System</option>
              <option value="electrical">Electrical</option>
              <option value="food">Food / Prasadam</option>
              <option value="transport">Transport</option>
              <option value="pooja">Pooja Items</option>
              <option value="lighting">Lighting</option>
              <option value="priest">The Priest(Panthulu)</option>
              <option value="fireworks">Fire Works</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="event-form-field">
            <label>
              Date & Time <span>(Optional)</span>
            </label>

            <input
              type="datetime-local"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
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
            {loading ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;
