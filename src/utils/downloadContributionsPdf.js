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
    contribution.village_name?.trim() || "-",
    `Rs. ${Number(contribution.amount).toLocaleString("en-IN")}`,
    contribution.contribution_date
      ? new Date(contribution.contribution_date).toLocaleDateString("en-IN")
      : "",
    contribution.description?.trim() || "-",
  ]);

  autoTable(doc, {
    startY: 34,

    head: [
      ["S.No", "Contributor Name", "village", "Amount", "Date", "Description"],
    ],

    body: tableRows,

    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: "center",
    },

    headStyles: {
      fontStyle: "bold",
    },
    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 13, // S.No
      },
      1: {
        cellWidth: 38, // Contributor Name
      },
      2: {
        cellWidth: 30, // Village
      },
      3: {
        halign: "center",
        cellWidth: 30, // Amount
      },
      4: {
        halign: "center",
        cellWidth: 28, // Date
      },
      5: {
        // Description gets remaining space automatically
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
    contribution.village_name?.trim() || "-",
    contribution.contribution_date
      ? new Date(contribution.contribution_date).toLocaleDateString("en-IN")
      : "",
    contribution.description || "-",
  ]);

  autoTable(doc, {
    startY: 34,

    head: [
      [
        "S.No",
        "Contributor Name",
        "Contribution",
        "Village",
        "Date",
        "Description",
      ],
    ],

    body: tableRows,

    styles: {
      fontSize: 8.5,
      halign: "center",
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 13, // S.No
      },

      1: {
        cellWidth: 36, // Contributor Name
      },

      2: {
        cellWidth: 36, // Contribution / Item
      },

      3: {
        cellWidth: 24, // Village
      },

      4: {
        halign: "center",
        cellWidth: 26, // Date
      },

      5: {
        // Description gets remaining width
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
      fontSize: 8.5,
      halign: "center",
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        cellWidth: 13,
      },
      1: {
        cellWidth: 38,
      },

      2: {
        cellWidth: 24,
      },

      3: {
        cellWidth: 28,
      },

      4: {
        cellWidth: 36,
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
