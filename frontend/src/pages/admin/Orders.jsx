import React, { useEffect, useState } from "react";
import { fetchAdminOrders } from "../../api/admin.js";
import { formatPKR } from "../../utils/format.js";
import { FileSpreadsheet, FileText } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { exportToExcel, exportToPDF } from "../../utils/exportData.js";

const Orders = () => {
  const { t } = useLanguage();

  const STATUS_LABELS = {
    pending: t("orders.status.pending"),
    confirmed: t("orders.status.confirmed"),
    in_progress: t("orders.status.inProgress"),
    completed: t("orders.status.completed"),
    cancelled: t("orders.status.cancelled"),
  };

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAdminOrders({ status: status || undefined, limit: 50 })
      .then((data) => {
        setOrders(data.orders);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const exportColumns = [
    { header: t("dash.table.orderNum"), key: "orderNum" },
    { header: t("dash.table.item"), key: "item" },
    { header: t("dash.table.buyer"), key: "buyer" },
    { header: t("admin.table.seller"), key: "seller" },
    { header: t("cart.total"), key: "total" },
    { header: t("dash.table.commission"), key: "commission" },
    { header: t("dash.table.status"), key: "status" },
    { header: t("admin.table.date"), key: "date" },
  ];

  const buildExportRows = async () => {
    const data = await fetchAdminOrders({ status: status || undefined, limit: 100000 });
    return data.orders.map((o) => ({
      orderNum: o.orderNumber,
      item: `${o.listingTitleSnapshot} (x${o.quantity})`,
      buyer: `${o.buyer?.firstName || ""} ${o.buyer?.lastName || ""}`,
      seller: o.seller?.businessName || `${o.seller?.firstName || ""} ${o.seller?.lastName || ""}`,
      total: formatPKR(o.totalAmount),
      commission:
        formatPKR(o.commissionAmount) +
        (o.commissionType === "percent" && o.commissionPercent != null ? ` (${o.commissionPercent}%)` : ` ${t("dash.fixedLabel")}`),
      status: STATUS_LABELS[o.status],
      date: new Date(o.createdAt).toLocaleDateString("en-PK"),
    }));
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const rows = await buildExportRows();
      exportToExcel(rows, exportColumns, "piarapakistan-orders");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const rows = await buildExportRows();
      exportToPDF(rows, exportColumns, "piarapakistan-orders", t("nav.orders"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24 }}>{t("nav.orders")}</h1>
      <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 16 }}>{total} {t("admin.totalOrdersSuffix")}</p>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--pp-border)", marginBottom: 18 }}
      >
        <option value="">{t("admin.allStatus")}</option>
        {Object.entries(STATUS_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button className="btn btn-secondary" type="button" disabled={exporting} onClick={handleExportExcel}>
          <FileSpreadsheet size={15} /> {t("admin.exportExcel")}
        </button>
        <button className="btn btn-secondary" type="button" disabled={exporting} onClick={handleExportPDF}>
          <FileText size={15} /> {t("admin.exportPDF")}
        </button>
      </div>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>{t("dash.table.orderNum")}</th>
              <th>{t("dash.table.item")}</th>
              <th>{t("dash.table.buyer")}</th>
              <th>{t("admin.table.seller")}</th>
              <th>{t("cart.total")}</th>
              <th>{t("dash.table.commission")}</th>
              <th>{t("dash.table.status")}</th>
              <th>{t("admin.table.date")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.listingTitleSnapshot} (x{o.quantity})</td>
                <td>{o.buyer?.firstName} {o.buyer?.lastName}</td>
                <td>{o.seller?.businessName || `${o.seller?.firstName || ""} ${o.seller?.lastName || ""}`}</td>
                <td>{formatPKR(o.totalAmount)}</td>
                <td>
                  {formatPKR(o.commissionAmount)}
                  {o.commissionType === "percent" && o.commissionPercent != null ? ` (${o.commissionPercent}%)` : ` ${t("dash.fixedLabel")}`}
                </td>
                <td>{STATUS_LABELS[o.status]}</td>
                <td>{new Date(o.createdAt).toLocaleDateString("en-PK")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
