import "../styles/totalContributions.css";

function TotalContributionsModal({ open, onClose, contributions }) {
  if (!open) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="total-contributions-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="total-contributions-modal-header">
          <h2>Total Contributions</h2>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="total-contributions-table-header">
          <span>S.No.</span>
          <span>Name</span>
          <span>Date</span>
          <span>Amount</span>
        </div>

        <div className="total-contributions-list">
          {contributions.length > 0 ? (
            contributions.map((contribution, index) => (
              <div key={contribution.id} className="total-contribution-row">
                <span>{index + 1}.</span>

                <span className="total-contribution-name">
                  {contribution.contributor_name}
                </span>

                <span>
                  {formatDate(
                    contribution.contribution_date || contribution.created_at,
                  )}
                </span>

                <strong>
                  ₹{Number(contribution.amount).toLocaleString("en-IN")}
                </strong>
              </div>
            ))
          ) : (
            <div className="total-contributions-empty">
              No contributions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalContributionsModal;
