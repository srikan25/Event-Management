import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

export const downloadPreviousBalancePdf = (previousBalances, activeEvent) => {
  if (!previousBalances?.length) {
    return false;
  }

  const doc = new jsPDF();

  const eventName = activeEvent?.name || "Event";

  const totalPreviousBalance = previousBalances.reduce(
    (total, item) => total + Number(item.amount),
    0,
  );

  const returnedAmount = previousBalances
    .filter((item) => item.is_returned)
    .reduce((total, item) => total + Number(item.amount), 0);

  const pendingAmount = totalPreviousBalance - returnedAmount;

  // Event name
  doc.setFont(undefined, "bold");
  doc.setFontSize(16);

  doc.text(eventName, 14, 18);

  // Report title
  doc.setFontSize(12);

  doc.text("Previous Balance Report", 14, 27);

  doc.setFont(undefined, "normal");

  // Summary
  autoTable(doc, {
    startY: 34,

    head: [["Summary", "Amount"]],

    body: [
      [
        "Total Previous Balance",
        `Rs. ${totalPreviousBalance.toLocaleString("en-IN")}`,
      ],
      ["Returned Amount", `Rs. ${returnedAmount.toLocaleString("en-IN")}`],
      ["Pending Amount", `Rs. ${pendingAmount.toLocaleString("en-IN")}`],
    ],

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      1: {
        halign: "right",
      },
    },
  });

  const tableStartY = doc.lastAutoTable.finalY + 10;

  // Person-wise details
  const rows = previousBalances.map((item, index) => [
    index + 1,
    item.person_name,
    `Rs. ${Number(item.amount).toLocaleString("en-IN")}`,
    item.is_returned ? "Returned" : "Pending",
  ]);

  autoTable(doc, {
    startY: tableStartY,

    head: [["S.No", "Person Name", "Amount", "Status"]],

    body: rows,

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        cellWidth: 14,
        halign: "center",
      },

      2: {
        halign: "right",
      },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(8);

  const generatedTime = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.text(`Generated on: ${generatedTime}`, 14, finalY);

  const safeEventName = eventName.replace(/[\\/:*?"<>|]/g, "-");

  doc.save(`${safeEventName}-previous-balance.pdf`);

  return true;
};
