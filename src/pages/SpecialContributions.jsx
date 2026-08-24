import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

import AppLayout from "../layouts/AppLayout";
import AddSpecialContributionModal from "../components/AddSpecialContributionModal";

import { supabase } from "../lib/supabase";
import { useEvent } from "../context/EventContext";

import { downloadSpecialContributionsPdf } from "../utils/downloadContributionsPdf";

import "../styles/specialContributions.css";
import SpecialContributionDetailsModal from "../components/SpecialContributionDetailsModal";
import { isOrganizer } from "../utils/authRole";

function SpecialContributions() {
  const navigate = useNavigate();
  const { activeEvent } = useEvent();

  const [specialContributions, setSpecialContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addSpecialOpen, setAddSpecialOpen] = useState(false);

  const [selectedSpecialContribution, setSelectedSpecialContribution] =
    useState(null);

  const organizer = isOrganizer();

  const fetchSpecialContributions = async () => {
    if (!activeEvent) {
      setSpecialContributions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("special_contributions")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching special contributions:", error);
      setLoading(false);
      return;
    }

    setSpecialContributions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpecialContributions();
  }, [activeEvent]);

  const handleDownload = () => {
    const downloaded = downloadSpecialContributionsPdf(
      specialContributions,
      activeEvent,
    );

    if (!downloaded) {
      toast.error("No special contributions available to download.");
      return;
    }

    toast.success("Special Contributors List PDF added to downloads");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <section className="special-contributions-page">
        <div className="special-page-header">
          <button
            type="button"
            className="special-back-button"
            onClick={() => navigate("/dashboard")}
            aria-label="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="special-page-title">
            <h2>Special Contributions</h2>
          </div>

          <button
            type="button"
            className="special-download-button"
            onClick={handleDownload}
            aria-label="Download special contributions"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download</span>
          </button>
        </div>

        <div className="special-page-list">
          {loading ? (
            <div className="special-page-empty">
              Loading special contributions...
            </div>
          ) : specialContributions.length > 0 ? (
            specialContributions.map((contribution, index) => (
              <button
                key={contribution.id}
                type="button"
                className="special-page-item"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSpecialContribution(contribution);
                }}
              >
                <span className="special-page-number">{index + 1}.</span>

                <div className="special-page-details">
                  <strong>{contribution.contributor_name}</strong>
                  <span className="special-page-date">
                    {formatDate(contribution.contribution_date)}
                  </span>
                </div>
                <strong className="special-page-contribution">
                  {contribution.item_name}
                </strong>

                <span className="special-page-arrow">›</span>
              </button>
            ))
          ) : (
            <div className="special-page-empty">
              <strong>Nothing special yet</strong>
              <span>Tap + when someone lends a helping hand.</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="special-page-add-button"
          onClick={() => setAddSpecialOpen(true)}
          aria-label="Add special contribution"
          disabled={!organizer}
        >
          +
        </button>

        <AddSpecialContributionModal
          open={addSpecialOpen}
          onClose={() => setAddSpecialOpen(false)}
          onSpecialContributionAdded={fetchSpecialContributions}
        />

        <SpecialContributionDetailsModal
          open={Boolean(selectedSpecialContribution)}
          contribution={selectedSpecialContribution}
          onClose={() => setSelectedSpecialContribution(null)}
          onRefresh={fetchSpecialContributions}
        />
      </section>
    </AppLayout>
  );
}

export default SpecialContributions;
