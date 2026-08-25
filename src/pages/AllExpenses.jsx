import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faDownload } from "@fortawesome/free-solid-svg-icons";

import AppLayout from "../layouts/AppLayout";
import AddExpenseModal from "../components/AddExpenseModal";

import { supabase } from "../lib/supabase";
import { useEvent } from "../context/EventContext";

import "../styles/allExpenses.css";
import { downloadExpensesPdf } from "../utils/downloadContributionsPdf";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import { isOrganizer } from "../utils/authRole";

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

function AllExpenses() {
  const navigate = useNavigate();
  const { activeEvent } = useEvent();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState(null);

  const organizer = isOrganizer();

  const fetchExpenses = async () => {
    if (!activeEvent) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("event_id", activeEvent.id)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      setLoading(false);
      return;
    }

    setExpenses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeEvent]);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0,
  );

  const formatExpenseDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCategory = (category) => {
    if (!category) return "Other";

    const categoryNames = {
      idol: "Ganesh Idol",
      decoration: "Decoration",
      flowers: "Flowers",
      sound: "Sound System",
      electrical: "Electrical",
      food: "Food / Prasadam",
      transport: "Transport",
      pooja: "Pooja Items",
      lighting: "Lighting",
      priest: "Priest",
      fireworks: "Fireworks",
      other: "Other",
    };

    return categoryNames[category] || "Other";
  };

  const handleDownload = () => {
    const downloaded = downloadExpensesPdf(
      expenses,
      activeEvent,
      totalExpenses,
    );

    if (!downloaded) {
      toast("No contributions available to download.", { icon: "ℹ️" });
      return;
    }

    if (expenses.length === 0) {
      toast.error("No expenses available to download.");
      return;
    }

    // We'll connect the PDF utility here next.
    toast.success("Expense PDF Added to Downloads.");
  };

  return (
    <AppLayout>
      <section className="all-expenses-page">
        {/* Header */}
        <div className="all-expenses-header">
          <button
            type="button"
            className="all-expenses-back-button"
            onClick={() => navigate("/")}
            aria-label="Back"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>

          <div className="all-expenses-total">
            <strong>₹{totalExpenses.toLocaleString("en-IN")}</strong>

            <span>All Expenses so far</span>
          </div>

          <button
            type="button"
            className="all-expenses-download-button"
            onClick={handleDownload}
            aria-label="Download expenses"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download</span>
          </button>
        </div>

        {/* Expenses */}
        <div className="all-expenses-list">
          {loading ? (
            <div className="all-expenses-empty">Loading expenses...</div>
          ) : expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <button
                key={expense.id}
                type="button"
                className="all-expense-item"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedExpense(expense);
                }}
              >
                <span className="all-expense-number">{index + 1}.</span>

                <div className="all-expense-icon">
                  {expenseIcons[expense.category] || expenseIcons.other}
                </div>

                <div className="all-expense-details">
                  <strong>{expense.title}</strong>

                  <span className="all-expense-date">
                    {formatExpenseDate(expense.expense_date)}
                  </span>

                  <span className="all-expense-category">
                    {formatCategory(expense.category)}
                  </span>
                </div>

                <strong className="all-expense-amount">
                  -₹
                  {Number(expense.amount).toLocaleString("en-IN")}
                </strong>

                <span className="all-expense-arrow">›</span>
              </button>
            ))
          ) : (
            <div className="all-expenses-empty">
              <strong>No expenses yet 😄</strong>
              <span>Hope it stays that way!</span>
            </div>
          )}
        </div>

        {/* Add Expense */}
        <button
          type="button"
          className="all-expenses-add-button"
          onClick={() => setAddExpenseOpen(true)}
          aria-label="Add expense"
          disabled={!organizer}
        >
          +
        </button>

        <AddExpenseModal
          open={addExpenseOpen}
          onClose={() => setAddExpenseOpen(false)}
          onExpenseAdded={fetchExpenses}
        />

        <ExpenseDetailsModal
          open={Boolean(selectedExpense)}
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onRefresh={fetchExpenses}
        />
      </section>
    </AppLayout>
  );
}

export default AllExpenses;
