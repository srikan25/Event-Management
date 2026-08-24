import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import CreateEventModal from "../components/CreateEventModal";
import { useEvent } from "../context/EventContext";
import { supabase } from "../lib/supabase";
import AddContributionModal from "../components/AddContributionModal";
import AddSpecialContributionModal from "../components/AddSpecialContributionModal";
import PreviousBalanceModal from "../components/PreviousBalanceModal";
import AddExpenseModal from "../components/AddExpenseModal";
import { useNavigate } from "react-router-dom";
import TotalContributionsModal from "../components/TotalContributionsModal";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import { downloadEventReportPdf } from "../utils/downloadEventReportPdf";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { isOrganizer } from "../utils/authRole";

function Dashboard() {
  const { activeEvent, loadingEvents, fetchEvents } = useEvent();

  const [createEventOpen, setCreateEventOpen] = useState(false);

  const [totalContributionsOpen, setTotalContributionsOpen] = useState(false);

  const navigate = useNavigate();

  const [selectedExpense, setSelectedExpense] = useState(null);

  const organizer = isOrganizer();

  //
  // ___________Recent Contribution Section______________
  const [contributions, setContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(true);
  const [addContributionOpen, setAddContributionOpen] = useState(false);

  const totalContributions = contributions.reduce(
    (total, contribution) => total + Number(contribution.amount),
    0,
  );

  const recentContributions = contributions?.slice(0, 5);

  // console.log(contributions);
  const fetchContributions = async () => {
    if (!activeEvent) {
      setContributions([]);
      setLoadingContributions(false);
      return;
    }

    setLoadingContributions(true);

    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contributions:", error);
      setLoadingContributions(false);
      return;
    }

    setContributions(data || []);
    setLoadingContributions(false);
  };

  useEffect(() => {
    fetchContributions();
  }, [activeEvent]);

  //
  //___________Special Contribution Section______________

  const [specialContributions, setSpecialContributions] = useState([]);
  const [loadingSpecialContributions, setLoadingSpecialContributions] =
    useState(true);
  const [addSpecialContributionOpen, setAddSpecialContributionOpen] =
    useState(false);

  const recentSpecialContributions = specialContributions?.slice(0, 3);

  // console.log(specialContributions);

  const fetchSpecialContributions = async () => {
    if (!activeEvent) {
      setSpecialContributions([]);
      setLoadingSpecialContributions(false);
      return;
    }

    setLoadingSpecialContributions(true);

    const { data, error } = await supabase
      .from("special_contributions")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching special contributions:", error);
      setLoadingSpecialContributions(false);
      return;
    }

    setSpecialContributions(data || []);
    setLoadingSpecialContributions(false);
  };

  useEffect(() => {
    fetchSpecialContributions();
  }, [activeEvent]);

  //
  //____________Previous Balance Section_________________

  const [previousBalanceOpen, setPreviousBalanceOpen] = useState(false);

  const [previousBalances, setPreviousBalances] = useState([]);
  const [loadingPreviousBalances, setLoadingPreviousBalances] = useState(true);

  const previousBalancesTotal = previousBalances?.reduce(
    (total, item) => total + Number(item?.amount),
    0,
  );
  const returnedPreviousAmount = previousBalances
    ?.filter((item) => item.is_returned)
    .reduce((total, item) => total + Number(item.amount), 0);

  const fetchPreviousBalances = async () => {
    if (!activeEvent) {
      setPreviousBalances([]);
      setLoadingPreviousBalances(false);
      return;
    }

    setLoadingPreviousBalances(true);

    const { data, error } = await supabase
      .from("previous_balances")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching previous balances:", error);
      setLoadingPreviousBalances(false);
      return;
    }

    setPreviousBalances(data || []);
    setLoadingPreviousBalances(false);
  };

  useEffect(() => {
    fetchPreviousBalances();
  }, [activeEvent]);

  //
  //  ________Expenses section ________

  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const recentExpenses = expenses?.slice(0, 5);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense?.amount),
    0,
  );

  const expenseIcons = {
    idol: "🛕",
    decoration: "🛠️",
    flowers: "🌼",
    sound: "🔊",
    electrical: "⚡",
    food: "🍲",
    transport: "🚚",
    pooja: "🪔",
    lighting: "💡",
    priest: "🙏",
    fireworks: "🎆",
    other: "🧾",
  };

  const fetchExpenses = async () => {
    if (!activeEvent) {
      setExpenses([]);
      setLoadingExpenses(false);
      return;
    }

    setLoadingExpenses(true);

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      setLoadingExpenses(false);
      return;
    }

    setExpenses(data || []);
    setLoadingExpenses(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeEvent]);

  const formatExpenseDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const expenseDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    const diff = (today - expenseDay) / (1000 * 60 * 60 * 24);

    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (diff === 0) {
      return `Today, ${time}`;
    }

    if (diff === 1) {
      return `Yesterday, ${time}`;
    }

    return (
      date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + `, ${time}`
    );
  };

  // console.log("Active Event:", activeEvent);
  // console.log("Active Event ID:", activeEvent?.id);
  // const latestUpdate = getLatestUpdateTime();

  //
  //________Available Balance___________

  const availableBalance =
    totalContributions + returnedPreviousAmount - totalExpenses;

  const handleFullEventReportDownload = () => {
    const download = downloadEventReportPdf({
      activeEvent,
      contributions,
      specialContributions,
      previousBalances,
      expenses,
      totalContributions,
      previousBalancesTotal,
      returnedPreviousAmount,
      totalExpenses,
      availableBalance,
    });

    if (!download) {
      toast.error("Unable to generate event report.");
      return;
    }

    toast.success("Total Event Report added to downloads");
  };

  const formatUpdatedTime = (date) => {
    if (!date) return "No updates yet";

    const now = new Date();

    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) {
      return "Updated just now";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffMinutes < 60) {
      return `Updated ${diffMinutes} min ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `Updated ${diffHours} hr${diffHours > 1 ? "s" : ""} ago`;
    }

    return `Updated ${date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })}`;
  };

  if (loadingEvents) {
    return (
      <AppLayout>
        <div className="event-loading">Loading your events...</div>
      </AppLayout>
    );
  }

  const backGroundColorToggleForTotalAmount =
    Number(availableBalance) > 20000
      ? "#08783c"
      : Number(availableBalance) < 6000
        ? "#E03C2B"
        : "#9E7815";

  if (!activeEvent) {
    return (
      <AppLayout>
        <section className="no-event-state">
          <div className="no-event-icon">🪔</div>

          <h2>No events yet</h2>

          <p>
            Create your first event to start managing contributions and
            expenses.
          </p>
          <button type="button" onClick={() => setCreateEventOpen(true)}>
            + Create Event
          </button>
        </section>

        <CreateEventModal
          open={createEventOpen}
          onClose={() => setCreateEventOpen(false)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Balance */}
      <section
        className="balance-section"
        style={{ background: backGroundColorToggleForTotalAmount }}
      >
        <p className="balance-label">AVAILABLE BALANCE</p>

        <h2 className="balance-amount">
          {availableBalance > 0
            ? `₹${availableBalance.toLocaleString("en-IN")}`
            : "loading"}
        </h2>

        <p className="balance-updated">
          <span
            onClick={(event) => {
              event.stopPropagation();
              fetchEvents();
            }}
            style={{ cursor: "pointer" }}
          >
            ↻
          </span>{" "}
          {formatUpdatedTime(
            activeEvent?.balance_updated_at
              ? new Date(activeEvent.balance_updated_at)
              : null,
          )}
        </p>
        <button
          type="button"
          className="full-report-download"
          onClick={handleFullEventReportDownload}
        >
          <FontAwesomeIcon icon={faDownload} />

          <span>Download Full Report</span>
        </button>
      </section>

      {/* Contributions */}
      <section className="dashboard-grid">
        <div
          className="dashboard-card contributions-card"
          onClick={() => navigate("/contributions")}
        >
          <div className="card-heading">
            <h3>Recent Contributions</h3>

            <button
              type="button"
              className="add-card-button"
              onClick={(event) => {
                event.stopPropagation();
                setAddContributionOpen(true);
              }}
              aria-label="Add contribution"
              disabled={!organizer}
            >
              +
            </button>
          </div>

          {loadingContributions ? (
            <div className="empty-card-message">
              <span>Loading contributions...</span>
            </div>
          ) : recentContributions.length > 0 ? (
            <ol className="contribution-list">
              {recentContributions?.map((contribution, index) => (
                <li key={contribution.id}>
                  <span className="contribution-number">{index + 1}.</span>
                  <span className="contribution-name">
                    {contribution.contributor_name}
                  </span>
                  <strong className="contribution-amount">
                    ₹{Number(contribution.amount).toLocaleString("en-IN")}
                  </strong>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-card-message">
              <strong>No contributions yet</strong>
              <span>Tap + to get things rolling.</span>
            </div>
          )}

          <button
            type="button"
            className="view-all-button contribution-view-button"
            onClick={(event) => {
              event.stopPropagation();
              navigate("/contributions");
            }}
          >
            View All
          </button>
        </div>

        {/* Special Contributions */}
        <div
          className="dashboard-card special-card"
          onClick={() => navigate("/special-contributions")}
        >
          <div className="card-heading">
            <h3>Special Contributions</h3>

            <button
              type="button"
              className="add-card-button"
              onClick={(event) => {
                event.stopPropagation();
                setAddSpecialContributionOpen(true);
              }}
              aria-label="Add special contribution"
              disabled={!organizer}
            >
              +
            </button>
          </div>

          {loadingSpecialContributions ? (
            <div className="empty-card-message">
              <span>Loading Special Contributions...</span>
            </div>
          ) : recentSpecialContributions?.length > 0 ? (
            <ol className="special-contribution-list">
              {recentSpecialContributions?.map((contribution, index) => (
                <li key={contribution.id}>
                  <span className="sc-number">{index + 1}.</span>
                  <div className="sc-content">
                    <span className="sc-name">
                      {contribution.contributor_name}
                    </span>
                    <span className="sc-item">{contribution.item_name}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="empty-card-message">
              <strong>Nothing special yet</strong>
              <span>Tap + when someone lends a helping hand.</span>
            </div>
          )}

          <button
            type="button"
            className="view-all-button special-view-button"
            onClick={(event) => {
              event.stopPropagation();
              navigate("/special-contributions");
            }}
          >
            View All
          </button>
        </div>
      </section>

      {/* previous card */}
      <section className="summary-grid">
        <div
          className="summary-card previous-balance-card"
          onClick={() => setPreviousBalanceOpen(true)}
        >
          <h3>Previous Balance</h3>

          <strong>₹{previousBalancesTotal.toLocaleString("en-IN")}</strong>

          {loadingPreviousBalances ? (
            <span>Loading...</span>
          ) : previousBalances.length === 0 ? (
            <span>Add the previous balance to keep the books straight.</span>
          ) : (
            <span>
              {previousBalances.length}{" "}
              {previousBalances.length === 1 ? "person" : "people"}
            </span>
          )}

          {/* <button
            type="button"
            className="view-all-button previous-view-button"
            onClick={(event) => {
              event.stopPropagation;
              setPreviousBalanceOpen(true);
            }}
          >
            View Details
          </button> */}
        </div>

        {/* ______total Contribution Amount___________ */}

        <div
          className="summary-card total-contributions-card"
          onClick={() => setTotalContributionsOpen(true)}
        >
          <h3>Total Contributions</h3>

          <strong>₹{totalContributions?.toLocaleString("en-IN")}</strong>

          {/* <button type="button" className="view-all-button total-view-button">
            View All
          </button> */}
          <span>This Year so far</span>
        </div>
      </section>

      {/* Expenses */}
      <section className="expenses-section">
        <div className="expenses-heading">
          <h2>Recent Expenses</h2>

          <div className="expense-heading-right">
            <div className="dashboard-expense-total">
              <strong>₹{totalExpenses.toLocaleString("en-IN")}</strong>
              <span>Total Spent so far</span>
            </div>
          </div>

          <button
            type="button"
            className="add-expense-button"
            onClick={(event) => {
              event.stopPropagation();
              setAddExpenseOpen(true);
            }}
            aria-label="Add expense"
            disabled={!organizer}
          >
            +
          </button>
        </div>

        {loadingExpenses ? (
          <div className="empty-expenses-message">Loading expenses...</div>
        ) : recentExpenses.length > 0 ? (
          <div className="expense-list">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="expense-item"
                onClick={() => setSelectedExpense(expense)}
              >
                <div className="expense-icon">
                  {expenseIcons[expense.category] || expenseIcons.other}
                </div>

                <div className="expense-details">
                  <strong>{expense.title}</strong>
                  {expense.description && (
                    <p className="expense-description">{expense.description}</p>
                  )}

                  <span>{formatExpenseDate(expense.expense_date)}</span>
                </div>

                <div className="expense-right">
                  <strong>
                    -₹{Number(expense.amount).toLocaleString("en-IN")}
                  </strong>

                  <span>›</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-expenses-message">
            <strong>No expenses yet 😄</strong>
            <span>Hope it stays that way!</span>
          </div>
        )}

        <button
          type="button"
          className="expenses-view-all"
          onClick={(event) => {
            event.stopPropagation();
            navigate("/all-expenses");
          }}
        >
          View All Expenses
        </button>
      </section>

      <AddContributionModal
        open={addContributionOpen}
        onClose={() => setAddContributionOpen(false)}
        onContributionAdded={fetchContributions}
      />

      <AddSpecialContributionModal
        open={addSpecialContributionOpen}
        onClose={() => setAddSpecialContributionOpen(false)}
        onSpecialContributionAdded={fetchSpecialContributions}
      />

      <PreviousBalanceModal
        open={previousBalanceOpen}
        onClose={() => setPreviousBalanceOpen(false)}
        previousBalances={previousBalances}
        onRefresh={fetchPreviousBalances}
      />

      <AddExpenseModal
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        onExpenseAdded={fetchExpenses}
      />

      <TotalContributionsModal
        open={totalContributionsOpen}
        onClose={() => setTotalContributionsOpen(false)}
        contributions={contributions}
      />

      <ExpenseDetailsModal
        open={Boolean(selectedExpense)}
        expense={selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onRefresh={fetchExpenses}
      />
    </AppLayout>
  );
}

export default Dashboard;
