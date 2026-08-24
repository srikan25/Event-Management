import { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useEvent } from "../context/EventContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateBalanceTimestamp } from "../utils/updateBalanceTimestamp";
import { downloadPreviousBalancePdf } from "../utils/downloadPreviousBalancesPdf";
import { isOrganizer } from "../utils/authRole";

function PreviousBalanceModal({ open, onClose, previousBalances, onRefresh }) {
  const { user } = useAuth();
  const { activeEvent, fetchEvents } = useEvent();

  const [showAddForm, setShowAddForm] = useState(false);
  const [personName, setPersonName] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const [amountError, setAmountError] = useState("");

  const organizer = isOrganizer();

  if (!open) return null;

  const totalPreviousBalance = previousBalances.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );

  const handleAdd = async (e) => {
    e.preventDefault();

    setError("");

    if (!personName.trim()) {
      setError("Please enter the person's name.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("previous_balances").insert({
      user_id: user.id,
      event_id: activeEvent.id,
      person_name: personName.trim(),
      amount: Number(amount),
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setPersonName("");
    setAmount("");
    setShowAddForm(false);

    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success("Previous balance added");
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete ${item.person_name}'s previous balance of ₹${Number(
        item.amount,
      ).toLocaleString("en-IN")}?`,
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("previous_balances")
      .delete()
      .eq("id", item.id)
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success("Previous balance entry deleted");
  };

  const handleReturnedChange = async (item) => {
    setUpdatingId(item.id);

    const { error } = await supabase
      .from("previous_balances")
      .update({
        is_returned: !item.is_returned,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .eq("user_id", user.id);

    setUpdatingId(null);

    if (error) {
      toast.error(error.message);
      return;
    }
    await updateBalanceTimestamp(activeEvent.id);
    await fetchEvents();
    await onRefresh();

    toast.success(
      !item.is_returned
        ? "Amount Returned So Added To Main Balance"
        : "Returned status removed",
    );
  };

  const handleDownload = () => {
    const download = downloadPreviousBalancePdf(previousBalances, activeEvent);

    if (!download) {
      toast.error("No previous balance details available to download.");
      return;
    }

    toast.success("Previous balance report Added to downloads");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="previous-balance-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="previous-balance-header">
          <div>
            <h2>Previous Balance</h2>
            <p>Total: ₹{totalPreviousBalance.toLocaleString("en-IN")}</p>
          </div>

          <div className="previous-balance-header-actions">
            <button
              type="button"
              className="previous-balance-download"
              onClick={handleDownload}
              aria-label="Download previous balance report"
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Download</span>
            </button>
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </div>

        {showAddForm && (
          <form className="previous-balance-add-form" onSubmit={handleAdd}>
            {error && <div className="event-form-error">{error}</div>}

            <div className="event-form-field">
              <label>Person Name</label>

              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="Enter person name"
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
              />
              {amountError && (
                <span className="amount-error">{amountError}</span>
              )}
            </div>

            <button
              type="submit"
              className="event-create-button"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </form>
        )}

        <div className="previous-balance-list">
          {previousBalances.length > 0 ? (
            previousBalances.map((item, index) => (
              <div key={item.id} className="previous-balance-item">
                <span className="previous-balance-number">{index + 1}.</span>

                <div className="previous-balance-person">
                  <strong>{item.person_name}</strong>

                  <span>₹{Number(item.amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="previous-balance-actions">
                  <label className="returned-checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={item.is_returned}
                      disabled={updatingId === item.id || !organizer}
                      onChange={() => handleReturnedChange(item)}
                    />

                    <span>{item.is_returned ? "Returned" : "Pending"}</span>
                  </label>

                  {!item.is_returned && (
                    <button
                      type="button"
                      className="previous-balance-delete"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${item.person_name}`}
                      disabled={!organizer}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="previous-balance-empty">
              <strong>No previous balance details yet</strong>
              <span>Tap + to add a person and amount.</span>
            </div>
          )}
        </div>
        <div className="add-previous-balance">
          {!showAddForm && (
            <button
              type="button"
              className="previous-balance-add-button"
              onClick={() => {
                setShowAddForm((prev) => !prev);
                setError("");
              }}
              aria-label="Add previous balance"
              disabled={!organizer}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviousBalanceModal;
