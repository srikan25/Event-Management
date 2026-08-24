import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export const downloadContributionsPdf = (
  contributions,
  activeEvent,
  totalContributions,
) => {
  if (!contributions?.length) {
    return false;
  }

  const doc = new jsPDF();

  const eventName = activeEvent?.name || "Event";

  doc.setFontSize(16);
  doc.text(eventName, 14, 18);

  doc.setFontSize(12);
  doc.text("Contribution Report", 14, 27);

  const tableRows = contributions.map((contribution, index) => [
    index + 1,
    contribution.contributor_name,
    `Rs. ${Number(contribution.amount).toLocaleString("en-IN")}`,
    contribution.contribution_date
      ? new Date(contribution.contribution_date).toLocaleDateString("en-IN")
      : "",
    contribution.description || "-",
  ]);

  autoTable(doc, {
    startY: 34,

    head: [["S.No", "Contributor Name", "Amount", "Date", "Description"]],

    body: tableRows,

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 14,
      },

      2: {
        halign: "right",
        cellWidth: 28,
      },

      3: {
        cellWidth: 28,
      },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");

  doc.text(
    `Total Contributions: Rs. ${totalContributions.toLocaleString("en-IN")}`,
    14,
    finalY,
  );

  const safeEventName = eventName.replace(/[\\/:*?"<>|]/g, "-");

  doc.save(`${safeEventName}-contributions.pdf`);

  return true;
};

export const downloadSpecialContributionsPdf = (
  specialContributions,
  activeEvent,
) => {
  if (!specialContributions?.length) {
    return false;
  }

  const doc = new jsPDF();

  const eventName = activeEvent?.name || "Event";

  // Event name
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(eventName, 14, 18);

  // Report title
  doc.setFontSize(12);
  doc.text("Special Contributions Report", 14, 27);

  doc.setFont(undefined, "normal");

  const tableRows = specialContributions.map((contribution, index) => [
    index + 1,
    contribution.contributor_name,
    contribution.item_name,
    contribution.contribution_date
      ? new Date(contribution.contribution_date).toLocaleDateString("en-IN")
      : "",
    contribution.description || "-",
  ]);

  autoTable(doc, {
    startY: 34,

    head: [["S.No", "Contributor Name", "Contribution", "Date", "Description"]],

    body: tableRows,

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 14,
      },

      3: {
        cellWidth: 28,
      },
    },
  });

  const safeEventName = eventName.replace(/[\\/:*?"<>|]/g, "-");

  doc.save(`${safeEventName}-special-contributions.pdf`);

  return true;
};

export const downloadExpensesPdf = (expenses, activeEvent, totalExpenses) => {
  if (!expenses?.length) {
    return false;
  }

  const doc = new jsPDF();

  const eventName = activeEvent?.name || "Event";

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(eventName, 14, 18);

  doc.setFontSize(12);
  doc.text("Expense Report", 14, 27);

  doc.setFont(undefined, "normal");

  const rows = expenses.map((expense, index) => [
    index + 1,
    expense.title,
    expense.category || "other",
    `Rs. ${Number(expense.amount).toLocaleString("en-IN")}`,
    expense.expense_date
      ? new Date(expense.expense_date).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "",
    expense.description || "-",
  ]);

  autoTable(doc, {
    startY: 34,

    head: [
      ["S.No", "Expense", "Category", "Amount", "Date & Time", "Description"],
    ],

    body: rows,

    styles: {
      fontSize: 8,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 13,
      },

      3: {
        halign: "right",
        cellWidth: 27,
      },

      4: {
        cellWidth: 35,
      },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFont(undefined, "bold");
  doc.setFontSize(11);

  doc.text(
    `Total Expenses: Rs. ${totalExpenses.toLocaleString("en-IN")}`,
    14,
    finalY,
  );

  const safeEventName = eventName.replace(/[\\/:*?"<>|]/g, "-");

  doc.save(`${safeEventName}-expenses.pdf`);

  return true;
};
