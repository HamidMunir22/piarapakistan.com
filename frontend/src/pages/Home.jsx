import React from "react";
import { Link } from "react-router-dom";
import { Zap, Wind, ShoppingBasket } from "lucide-react";

const Home = () => {
  return (
    <div className="container" style={{ padding: "60px 20px 40px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 40, lineHeight: 1.2, marginBottom: 16 }}>
            <span style={{ color: "var(--pp-orange-dark)" }}>Har Service.</span>{" "}
            <span style={{ color: "var(--pp-green-dark)" }}>Ek Platform.</span>
          </h1>
          <p style={{ color: "var(--pp-muted)", maxWidth: 460, marginBottom: 28, fontSize: 15.5 }}>
            Electrician, plumber, AC repair, dukaan ke products — sab kuch ek jagah,
            aapke qareeb, verified aur mehfooz.
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <Link to="/register" className="btn btn-primary">
              Apni Service Sell Karein
            </Link>
            <Link to="/search" className="btn btn-secondary">
              Services Dhoondein
            </Link>
          </div>
        </div>

        <div className="hero-3d-scene">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-3d-stage">
            <div className="hero-float-card hero-card-1" style={{ "--pp-tz": "70px" }}>
              <div className="hero-card-icon" style={{ background: "var(--pp-orange-soft)", color: "var(--pp-orange-dark)" }}>
                <Zap size={20} />
              </div>
              <div className="hero-card-title">Electrician</div>
              <div className="hero-card-sub">12 verified nearby</div>
            </div>

            <div className="hero-float-card hero-card-2" style={{ "--pp-tz": "120px" }}>
              <div className="hero-card-icon" style={{ background: "var(--pp-green-soft)", color: "var(--pp-green-dark)" }}>
                <Wind size={20} />
              </div>
              <div className="hero-card-title">AC Repair</div>
              <div className="hero-card-sub">Rs. 800 se shuru</div>
            </div>

            <div className="hero-float-card hero-card-3" style={{ "--pp-tz": "40px" }}>
              <div className="hero-card-icon" style={{ background: "var(--pp-orange-soft)", color: "var(--pp-orange-dark)" }}>
                <ShoppingBasket size={20} />
              </div>
              <div className="hero-card-title">Local Shops</div>
              <div className="hero-card-sub">Cash on Delivery</div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: 50, color: "var(--pp-muted)", fontSize: 13, textAlign: "center" }}>
        🚧 Categories, listings, aur search live hain. Cart, dashboards ka baqi hissa
        aur payments agle phases mein add honge.
      </p>
    </div>
  );
};

export default Home;
