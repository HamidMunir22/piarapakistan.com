import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const STATUS_CONFIG = {
  paid: { icon: CheckCircle2, color: "var(--pp-green-dark)", title: "Payment Successful!", msg: "Aapka payment mukammal ho gaya. Order confirm ho chuka hai." },
  failed: { icon: XCircle, color: "var(--pp-danger)", title: "Payment Failed", msg: "Payment mukammal nahi ho saka. Aap dobara koshish kar sakte hain ya Cash on Delivery choose karein." },
  invalid: { icon: AlertTriangle, color: "var(--pp-danger)", title: "Something Went Wrong", msg: "Ye payment verify nahi ho saka. Agar paisay kat gaye hain to Help Center se rabta karein." },
  error: { icon: AlertTriangle, color: "var(--pp-danger)", title: "Error", msg: "Ek masla pesh aya. Apne order ka status 'My Orders' mein check karein." },
};

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "error";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error;
  const Icon = config.icon;

  return (
    <div className="container" style={{ padding: "60px 20px", display: "flex", justifyContent: "center" }}>
      <div className="auth-card" style={{ maxWidth: 420, textAlign: "center" }}>
        <Icon size={48} color={config.color} style={{ marginBottom: 14 }} />
        <h2 style={{ marginBottom: 8 }}>{config.title}</h2>
        <p style={{ color: "var(--pp-muted)", fontSize: 13.5, marginBottom: 22 }}>{config.msg}</p>
        <Link to="/orders" className="btn btn-primary btn-block">
          Mere Orders Dekhein
        </Link>
      </div>
    </div>
  );
};

export default PaymentResult;
