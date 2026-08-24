import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

import "../styles/expenseDetailsModal.css";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";
import { useEvent } from "../context/EventContext";
import { isOrganizer } from "../utils/authRole";

function ExpenseDetailsModal({ open, onClose, expense, onRefresh }) {
  const { user } = useAuth();

  const { activeEvent, fetchEvents } = useEvent();

  const [editMode, setEditMode] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");

  const [amountError, setAmountError] = useState("");
  const [loading, setLoading] = useState(false);

  const organizer = isOrganizer();

  useEffect(() => {
    if (!expense) return;

    setTitle(expense.title || "");
    setAmount(expense.amount || "");
    setCategory(expense.category || "other");
    setDescription(expense.description || "");

    if (expense.expense_date) {
      const date = new Date(expense.expense_date);

      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16);

      setExpenseDate(localDate);
    } else {
      setExpenseDate("");
    }

    setEditMode(false);
    setAmountError("");
  }, [expense, open]);

  if (!open || !expense) return null;

  const originalDate = expense.expense_date
    ? new Date(
        new Date(expense.expense_date).getTime() -
          new Date(expense.expense_date).getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16)
    : "";

  const hasChanges =
    title.trim() !== expense.title ||
    Number(amount) !== Number(expense.amount) ||
    category !== expense.category ||
    description.trim() !== (expense.description || "") ||
    expenseDate !== originalDate;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleUpdate = async () => {
    if (!amount || Number(amount) <= 0) {
      setAmountError("Amount must be greater than ₹0");
      return;
    }

    setLoading(true);

    const finalDate = expenseDate
      ? new Date(expenseDate).toISOString()
      : expense.expense_date;

    const { error } = await supabase
      .from("expenses")
      .update({
        title: title.trim(),
        amount: Number(amount),
        category,
        expense_date: finalDate,
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", expense.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success("Expense updated successfully");

    setEditMode(false);
    onClose();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${expense.title}" expense of ₹${Number(
        expense.amount,
      ).toLocaleString("en-IN")}?`,
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expense.id)
      .eq("user_id", user.id);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success("Expense deleted");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="expense-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="expense-details-header">
          <h2>{editMode ? "Edit Expense" : "Expense Details"}</h2>

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
            <div className="expense-info">
              <div className="expense-info-row">
                <span>Expense Reason</span>
                <strong>{expense.title}</strong>
              </div>

              <div className="expense-info-row">
                <span>Amount</span>
                <strong>
                  ₹{Number(expense.amount).toLocaleString("en-IN")}
                </strong>
              </div>

              <div className="expense-info-row">
                <span>Category</span>
                <strong>{expense.category}</strong>
              </div>

              <div className="expense-info-row">
                <span>Date & Time</span>
                <strong>{formatDate(expense.expense_date)}</strong>
              </div>

              {expense.description && (
                <div className="expense-info-row description-row">
                  <span>Description</span>
                  <strong>{expense.description}</strong>
                </div>
              )}
            </div>

            <div className="expense-details-actions">
              <button
                type="button"
                className="expense-delete-button"
                onClick={handleDelete}
                disabled={loading || !organizer}
              >
                Delete
              </button>

              <button
                type="button"
                className="expense-edit-button"
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
                <label>Expense Reason</label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  <option value="priest">Priest</option>
                  <option value="fireworks">Fireworks</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="event-form-field">
                <label>Date & Time</label>

                <input
                  type="datetime-local"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
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

            <div className="expense-details-actions">
              <button
                type="button"
                className="expense-cancel-button"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="expense-edit-button"
                onClick={handleUpdate}
                disabled={!hasChanges || loading || amountError}
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

export default ExpenseDetailsModal;
