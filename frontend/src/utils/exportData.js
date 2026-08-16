import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

// ---------------------------------------------------------------------------
// Shared admin-panel data export helpers (Excel + PDF). Both run entirely
// client-side on data already fetched into the browser -- "export" means
// re-fetching the full matching dataset (ignoring pagination, so every
// record is included, not just the current page) and handing it to one of
// these two functions, which trigger a normal browser file download. No
// backend changes needed.
//
// SECURITY NOTE on the `xlsx` (SheetJS Community Edition) dependency: npm
// audit flags this package for two CVEs -- prototype pollution
// (GHSA-4r6h-8v6p-xvw6) and ReDoS (GHSA-5pgg-2g8v-p4x9). Both are triggered
// by *parsing* an untrusted/malicious .xlsx file. SheetJS's own advisory for
// the prototype-pollution CVE says explicitly: "Workflows that do not read
// arbitrary files (for example, exporting data to spreadsheet files) are
// unaffected." This app only ever *writes* a new file from our own
// already-fetched, trusted admin data -- nowhere does it call XLSX.read() /
// readFile() on an external/uploaded .xlsx -- so neither CVE applies to how
// it's used here. SheetJS stopped publishing patched versions to the public
// npm registry after 0.18.5 (only via their own CDN), which is why
// `npm audit` still shows "no fix available" despite this write-only usage
// being safe.
// ---------------------------------------------------------------------------

/**
 * @param {Array<object>} rows - the data to export, one object per row
 * @param {Array<{header: string, key: string}>} columns - column order + labels
 * @param {string} filename - without extension
 */
export const exportToExcel = (rows, columns, filename) => {
  const data = rows.map((row) =>
    columns.reduce((acc, col) => {
      acc[col.header] = row[col.key] ?? "";
      return acc;
    }, {})
  );
  const worksheet = XLSX.utils.json_to_sheet(data);
  // Reasonable column widths so exported sheets aren't all-squished by default.
  worksheet["!cols"] = columns.map((col) => ({ wch: Math.max(col.header.length + 2, 14) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * @param {Array<object>} rows
 * @param {Array<{header: string, key: string}>} columns
 * @param {string} filename - without extension
 * @param {string} title - printed at the top of the PDF
 */
export const exportToPDF = (rows, columns, filename, title) => {
  const doc = new jsPDF({ orientation: columns.length > 5 ? "landscape" : "portrait" });
  doc.setFontSize(14);
  doc.text(title || filename, 14, 15);
  autoTable(doc, {
    startY: 20,
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => String(row[col.key] ?? ""))),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [243, 133, 22] }, // matches the site's brand orange
  });
  doc.save(`${filename}.pdf`);
};
