import React from "react";
import { ShieldCheck, Users, Globe2, HeartHandshake } from "lucide-react";

const WHY = [
  { icon: ShieldCheck, title: "Trust & Safety", text: "Every seller and shop is verified with CNIC + a live selfie check before they can list anything." },
  { icon: Users, title: "Growing Community", text: "Thousands of buyers and sellers across Pakistan, from local electricians to city-wide shops." },
  { icon: Globe2, title: "All of Pakistan", text: "Search and list services or products in your own city and neighbourhood." },
  { icon: HeartHandshake, title: "Fair for Everyone", text: "Transparent commission, clear order tracking, and a Help Center that actually responds." },
];

const About = () => {
  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>About PiaraPakistan</h1>
          <p>Pakistan's growing digital marketplace — connecting verified buyers and sellers across every category, from home services to local shops.</p>
        </div>
      </div>

      <div className="container" style={{ padding: "48px 20px" }}>
        <div className="about-block">
          <h2>Our Mission</h2>
          <p>
            PiaraPakistan exists to make it simple and safe for anyone in Pakistan to buy or sell — whether
            that's booking an electrician, finding an AC repair technician, or browsing a local shop's products.
            We built verification into the core of the platform so buyers can trust who they're dealing with.
          </p>
        </div>
        <div className="about-block">
          <h2>Our Vision</h2>
          <p>
            To become Pakistan's most trusted multi-category marketplace — where every citizen, in every city
            and town, can access a fair, secure, and modern way to trade services and goods.
          </p>
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
