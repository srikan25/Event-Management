import { useState } from "react";
import { supabase } from "../lib/supabase";

function ChangePasswordModal({ open, onClose }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open) return null;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Password updated successfully.");

    setPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h2>Change Password</h2>

          <button
            type="button"
            className="modal-close-button"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        <form className="event-form" onSubmit={handleUpdatePassword}>
          {error && <div className="event-form-error">{error}</div>}

          {success && <div className="password-success">{success}</div>}

          <div className="event-form-field">
            <label>New Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="event-form-field">
            <label>Confirm Password</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            className="password-update-button"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
