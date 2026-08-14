import React from "react";
import { Link } from "react-router-dom";
import { Zap, Wind, ShoppingBasket, ShieldCheck, Users, Rocket } from "lucide-react";
import Tilt from "../components/Tilt.jsx";

const WHY = [
  { icon: ShieldCheck, title: "Trusted & Secure", text: "Every seller and shop passes CNIC + selfie verification before they can list anything." },
  { icon: Users, title: "Growing Community", text: "Thousands of buyers and sellers across Pakistan, from local electricians to city-wide shops." },
  { icon: Rocket, title: "Fast & Easy", text: "Post a listing in minutes, or book a service in just a couple of taps." },
];

const Home = () => {
  return (
    <div>
      <div className="container" style={{ padding: "60px 20px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 40, lineHeight: 1.2, marginBottom: 16 }}>
              <span style={{ color: "var(--pp-orange-dark)" }}>Every Service.</span>{" "}
              <span style={{ color: "var(--pp-green-dark)" }}>One Platform.</span>
            </h1>
            <p style={{ color: "var(--pp-muted)", maxWidth: 460, marginBottom: 28, fontSize: 15.5 }}>
              Electrician, plumber, AC repair, local shop products — all in one place, near you,
              verified and secure.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <Link to="/register" className="btn btn-primary">
                Sell Your Service
              </Link>
              <Link to="/search" className="btn btn-secondary">
                Find Services
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
                <div className="hero-card-sub">Starting from Rs. 800</div>
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
      </div>

      <div className="container" style={{ padding: "10px 20px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, marginBottom: 30 }}>Why Choose PiaraPakistan?</h2>
        <div className="why-grid">
          {WHY.map((w) => (
            <Tilt max={6} key={w.title}>
              <div className="why-card">
                <div className="why-icon">
                  <w.icon size={22} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </div>
            </Tilt>
          ))}
        </div>
      </div>

      <div className="home-cta-band">
        <h2>Ready to Start Selling?</h2>
        <p>Join PiaraPakistan today and reach buyers across Pakistan.</p>
        <Link to="/register" className="btn btn-block-inline">
          Create Your Free Account
        </Link>
      </div>
    </div>
  );
};

export default Home;
