import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export const downloadEventReportPdf = ({
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
}) => {
  if (!activeEvent) {
    return false;
  }

  const doc = new jsPDF();

  const eventName = activeEvent.name || "Event";

  let currentY = 18;

  // =========================
  // EVENT HEADER
  // =========================

  doc.setFont(undefined, "bold");
  doc.setFontSize(17);

  doc.text(eventName, 14, currentY);

  currentY += 9;

  doc.setFontSize(12);
  doc.text("Event Financial Report", 14, currentY);

  currentY += 10;

  // =========================
  // SUMMARY
  // =========================

  doc.setFont(undefined, "normal");

  autoTable(doc, {
    startY: currentY,

    head: [["Summary", "Amount"]],

    body: [
      [
        "Available Balance",
        `Rs. ${Number(availableBalance).toLocaleString("en-IN")}`,
      ],
      [
        "Total Contributions",
        `Rs. ${Number(totalContributions).toLocaleString("en-IN")}`,
      ],
      [
        "Previous Balance",
        `Rs. ${Number(previousBalancesTotal).toLocaleString("en-IN")}`,
      ],
      [
        "Returned Previous Balance",
        `Rs. ${Number(returnedPreviousAmount).toLocaleString("en-IN")}`,
      ],
      [
        "Total Expenses",
        `Rs. ${Number(totalExpenses).toLocaleString("en-IN")}`,
      ],
    ],

    styles: {
      fontSize: 12,
      halign: "center",
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        cellWidth: 75,
      },
      1: {
        cellWidth: 75,
      },
    },
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // =========================
  // HELPER
  // =========================

  const makeSureThereIsSpace = (requiredSpace = 35) => {
    const pageHeight = doc.internal.pageSize.height;

    if (currentY + requiredSpace > pageHeight - 15) {
      doc.addPage();
      currentY = 18;
    }
  };

  const addSectionTitle = (title) => {
    makeSureThereIsSpace();

    doc.setFont(undefined, "bold");
    doc.setFontSize(12);

    doc.text(title, 14, currentY);

    doc.setFont(undefined, "normal");

    currentY += 6;
  };

  // =========================
  // CONTRIBUTIONS
  // =========================

  addSectionTitle("1. Contributions");

  if (contributions?.length > 0) {
    const rows = contributions.map((item, index) => [
      index + 1,
      item.contributor_name,
      item?.village_name?.trim()
        ? item?.village_name
        : {
            content: "-",
            styles: {
              halign: "center",
            },
          },
      `Rs. ${Number(item.amount).toLocaleString("en-IN")}`,
      item.contribution_date
        ? new Date(item.contribution_date).toLocaleDateString("en-IN")
        : "-",
      item.description || "-",
    ]);

    autoTable(doc, {
      startY: currentY,

      head: [
        ["S.No", "Contributor", "Village", "Amount", "Date", "Description"],
      ],

      body: rows,

      styles: {
        fontSize: 9,
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

    currentY = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(9);
    doc.text("No contributions recorded.", 14, currentY);

    currentY += 12;
  }

  // =========================
  // SPECIAL CONTRIBUTIONS
  // =========================

  addSectionTitle("2. Special Contributions");

  if (specialContributions?.length > 0) {
    const rows = specialContributions.map((item, index) => [
      index + 1,
      item.contributor_name,
      item.item_name,
      item.village_name?.trim()
        ? item.village_name
        : {
            content: "-",
            styles: {
              halign: "center",
            },
          },
      item.contribution_date
        ? new Date(item.contribution_date).toLocaleDateString("en-IN")
        : "-",
      item.description || "-",
    ]);

    autoTable(doc, {
      startY: currentY,

      head: [
        [
          "S.No",
          "Contributor",
          "Contribution",
          "Village",
          "Date",
          "Description",
        ],
      ],

      body: rows,

      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        halign: "center",
      },

      columnStyles: {
        0: {
          cellWidth: 13,
          halign: "center",
        },
      },
    });

    currentY = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(9);
    doc.text("No special contributions recorded.", 14, currentY);

    currentY += 12;
  }

  // =========================
  // PREVIOUS BALANCE
  // =========================

  addSectionTitle("3. Previous Balance Details");

  if (previousBalances?.length > 0) {
    const rows = previousBalances.map((item, index) => [
      index + 1,
      item.person_name,
      `Rs. ${Number(item.amount).toLocaleString("en-IN")}`,
      item.is_returned ? "Returned" : "Pending",
    ]);

    autoTable(doc, {
      startY: currentY,

      head: [["S.No", "Person Name", "Amount", "Status"]],

      body: rows,

      styles: {
        fontSize: 12,
        halign: "center",
      },

      headStyles: {
        fontStyle: "bolder",
      },
    });

    currentY = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(9);
    doc.text("No previous balance details recorded.", 14, currentY);

    currentY += 12;
  }

  // =========================
  // EXPENSES
  // =========================

  addSectionTitle("4. Expenses");

  if (expenses?.length > 0) {
    const rows = expenses.map((item, index) => [
      index + 1,
      item.title,
      item.category || "Other",
      `Rs. ${Number(item.amount).toLocaleString("en-IN")}`,
      item.expense_date
        ? new Date(item.expense_date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "-",
      item.description || "-",
    ]);

    autoTable(doc, {
      startY: currentY,

      head: [
        ["S.No", "Expense", "Category", "Amount", "Date & Time", "Description"],
      ],

      body: rows,

      styles: {
        fontSize: 9,
        cellPadding: 2.3,
        halign: "center",
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

    currentY = doc.lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(9);
    doc.text("No expenses recorded.", 14, currentY);

    currentY += 12;
  }

  // =========================
  // FINAL SUMMARY
  // =========================

  makeSureThereIsSpace(45);

  doc.setFont(undefined, "bold");
  doc.setFontSize(11);

  doc.text(
    `Available Balance: Rs. ${Number(availableBalance).toLocaleString(
      "en-IN",
    )}`,
    14,
    currentY,
  );

  currentY += 9;

  // Generated time

  doc.setFont(undefined, "normal");
  doc.setFontSize(8);

  const generatedTime = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.text(`Generated on: ${generatedTime}`, 14, currentY);

  // =========================
  // SAVE
  // =========================

  const safeEventName = eventName.replace(/[\\/:*?"<>|]/g, "-");

  doc.save(`${safeEventName}-complete-report.pdf`);

  return true;
};
