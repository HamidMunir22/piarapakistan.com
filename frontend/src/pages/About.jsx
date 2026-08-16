import React from "react";
import { ShieldCheck, Users, Globe2, HeartHandshake } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const About = () => {
  const { t } = useLanguage();

  const WHY = [
    { icon: ShieldCheck, title: t("about.why.trust.title"), text: t("about.why.trust.text") },
    { icon: Users, title: t("about.why.community.title"), text: t("about.why.community.text") },
    { icon: Globe2, title: t("about.why.pakistan.title"), text: t("about.why.pakistan.text") },
    { icon: HeartHandshake, title: t("about.why.fair.title"), text: t("about.why.fair.text") },
  ];

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>{t("about.title")}</h1>
          <p>{t("about.subtitle")}</p>
        </div>
      </div>

      <div className="container" style={{ padding: "48px 20px" }}>
        <div className="about-block">
          <h2>{t("about.missionTitle")}</h2>
          <p>{t("about.missionText")}</p>
        </div>
        <div className="about-block">
          <h2>{t("about.visionTitle")}</h2>
          <p>{t("about.visionText")}</p>
        </div>

        <div className="why-grid">
          {WHY.map((w) => (
            <div className="why-card" key={w.title}>
              <div className="why-icon">
                <w.icon size={22} />
              </div>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
