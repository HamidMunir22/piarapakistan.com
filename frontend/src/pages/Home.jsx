import React from "react";
import { Link } from "react-router-dom";
import { Zap, Wind, ShoppingBasket, ShieldCheck, Users, Rocket } from "lucide-react";
import Tilt from "../components/Tilt.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const Home = () => {
  const { t } = useLanguage();

  const WHY = [
    { icon: ShieldCheck, title: t("home.why.trust.title"), text: t("home.why.trust.text") },
    { icon: Users, title: t("home.why.community.title"), text: t("home.why.community.text") },
    { icon: Rocket, title: t("home.why.fast.title"), text: t("home.why.fast.text") },
  ];

  return (
    <div>
      <div className="container" style={{ padding: "60px 20px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 40, lineHeight: 1.2, marginBottom: 16 }}>
              <span style={{ color: "var(--pp-orange-dark)" }}>{t("home.title1")}</span>{" "}
              <span style={{ color: "var(--pp-green-dark)" }}>{t("home.title2")}</span>
            </h1>
            <p style={{ color: "var(--pp-muted)", maxWidth: 460, marginBottom: 28, fontSize: 15.5 }}>
              {t("home.subtitle")}
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <Link to="/register" className="btn btn-primary">
                {t("home.sellCta")}
              </Link>
              <Link to="/search" className="btn btn-secondary">
                {t("home.findCta")}
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
                <div className="hero-card-title">{t("home.hero.electrician")}</div>
                <div className="hero-card-sub">{t("home.hero.electricianSub")}</div>
              </div>

              <div className="hero-float-card hero-card-2" style={{ "--pp-tz": "120px" }}>
                <div className="hero-card-icon" style={{ background: "var(--pp-green-soft)", color: "var(--pp-green-dark)" }}>
                  <Wind size={20} />
                </div>
                <div className="hero-card-title">{t("home.hero.acRepair")}</div>
                <div className="hero-card-sub">{t("home.hero.acRepairSub")}</div>
              </div>

              <div className="hero-float-card hero-card-3" style={{ "--pp-tz": "40px" }}>
                <div className="hero-card-icon" style={{ background: "var(--pp-orange-soft)", color: "var(--pp-orange-dark)" }}>
                  <ShoppingBasket size={20} />
                </div>
                <div className="hero-card-title">{t("home.hero.shops")}</div>
                <div className="hero-card-sub">{t("home.hero.shopsSub")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "10px 20px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 24, marginBottom: 30 }}>{t("home.whyTitle")}</h2>
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
        <h2>{t("home.ctaTitle")}</h2>
        <p>{t("home.ctaText")}</p>
        <Link to="/register" className="btn btn-block-inline">
          {t("home.ctaButton")}
        </Link>
      </div>
    </div>
  );
};

export default Home;
