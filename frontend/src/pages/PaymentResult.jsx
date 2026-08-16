import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const PaymentResult = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "error";

  const STATUS_CONFIG = {
    paid: { icon: CheckCircle2, color: "var(--pp-green-dark)", title: t("paymentResult.paidTitle"), msg: t("paymentResult.paidMsg") },
    failed: { icon: XCircle, color: "var(--pp-danger)", title: t("paymentResult.failedTitle"), msg: t("paymentResult.failedMsg") },
    invalid: { icon: AlertTriangle, color: "var(--pp-danger)", title: t("paymentResult.invalidTitle"), msg: t("paymentResult.invalidMsg") },
    error: { icon: AlertTriangle, color: "var(--pp-danger)", title: t("paymentResult.errorTitle"), msg: t("paymentResult.errorMsg") },
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error;
  const Icon = config.icon;

  return (
    <div className="container" style={{ padding: "60px 20px", display: "flex", justifyContent: "center" }}>
      <div className="auth-card" style={{ maxWidth: 420, textAlign: "center" }}>
        <Icon size={48} color={config.color} style={{ marginBottom: 14 }} />
        <h2 style={{ marginBottom: 8 }}>{config.title}</h2>
        <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 22 }}>{config.msg}</p>
        <Link to="/orders" className="btn btn-primary btn-block">
          {t("paymentResult.viewOrdersBtn")}
        </Link>
      </div>
    </div>
  );
};

export default PaymentResult;
