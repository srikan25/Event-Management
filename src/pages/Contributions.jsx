import "../styles/contributionsPage.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faDownload,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import { supabase } from "../lib/supabase";
import { useEvent } from "../context/EventContext";
import AddContributionMadal from "../components/AddContributionModal";
import toast from "react-hot-toast";
import { downloadContributionsPdf } from "../utils/downloadContributionsPdf";
import ContributionDetailsModal from "../components/ContributionDetailsModal";
import { isOrganizer } from "../utils/authRole";

function Contributions() {
  const navigate = useNavigate();
  const { activeEvent } = useEvent();

  const [contributions, setContributions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [addContributionOpen, setAddContributionOpen] = useState(false);

  const [selectedContribution, setSelectedContribution] = useState(null);

  const organizer = isOrganizer();

  const fetchContributions = async () => {
    if (!activeEvent) {
      setContributions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contributions:", error);
      setLoading(false);
      return;
    }

    setContributions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchContributions();
  }, [activeEvent]);

  const handleDownload = (event) => {
    event.stopPropagation();

    const downloader = downloadContributionsPdf(
      contributions,
      activeEvent,
      totalContributions,
    );
    if (!downloader) {
      toast("No contributions available to download.", { icon: "ℹ️" });
      return;
    }
    toast.success("Contributors List PDF added to downloads.");
  };
  const filteredContributions = contributions.filter((contribution) => {
    const name = contribution.contributor_name.toLowerCase();

    const words = searchTerm.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return words.every((word) => name.includes(word));
  });

  const totalContributions = contributions.reduce(
    (total, contribution) => total + Number(contribution.amount),
    0,
  );

  return (
    <AppLayout>
      <section className="all-contributions-page">
        <div className="all-contributions-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/")}
            aria-label="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="contributors-header">
            <h2>All Contributions</h2>
            <span>
              {contributions.length}{" "}
              {contributions.length === 1 ? "contribution" : "contributions"}
            </span>
          </div>
          <div className="all-contributions-total">
            <span>Total Amount</span>
            <strong>₹{totalContributions.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="contribution-search-row">
          <div className="contribution-search">
            <span>
              <FontAwesomeIcon icon={faSearch} />
            </span>

            <input
              type="text"
              placeholder="Search contributors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="contribution-download-button"
            onClick={handleDownload}
            aria-label="Download contributions"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download</span>
          </button>
        </div>

        <div className="all-contributions-list">
          {loading ? (
            <div className="all-contributions-empty">
              Loading contributions...
            </div>
          ) : filteredContributions.length > 0 ? (
            filteredContributions.map((contribution, index) => (
              <button
                key={contribution.id}
                type="button"
                className="all-contribution-item"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedContribution(contribution);
                }}
              >
                <span className="all-contribution-number">{index + 1}.</span>

                <div className="all-contribution-details">
                  <strong>{contribution.contributor_name}</strong>

                  <span>
                    {new Date(contribution.created_at).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>

                <span className="all-contribution-village">
                  {" "}
                  {contribution?.village_name || "-"}
                </span>

                <strong className="all-contribution-amount">
                  ₹{Number(contribution.amount).toLocaleString("en-IN")}
                </strong>

                <span className="all-contribution-arrow">›</span>
              </button>
            ))
          ) : (
            <div className="all-contributions-empty">
              <strong>No contributors found</strong>

              {searchTerm && <span>No results for "{searchTerm}"</span>}
            </div>
          )}
        </div>

        <button
          type="button"
          className="all-contributions-add-button"
          onClick={() => setAddContributionOpen(true)}
          aria-label="Add contribution"
          disabled={!organizer}
        >
          +
        </button>
      </section>

      <AddContributionMadal
        open={addContributionOpen}
        onClose={() => setAddContributionOpen(false)}
        onContributionAdded={fetchContributions}
      />

      <ContributionDetailsModal
        open={Boolean(selectedContribution)}
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
        onRefresh={fetchContributions}
      />
    </AppLayout>
  );
}

export default Contributions;
