import React, { useRef } from "react";

/**
 * Wraps its children in a lightweight, mouse-tracked 3D tilt effect.
 * Usage: <Tilt><div className="category-card">...</div></Tilt>
 * The direct child should have `position: relative` if it needs the shine overlay.
 */
const Tilt = ({ children, max = 10, scale = 1.02, className = "" }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 -> 1
    const y = (e.clientY - rect.top) / rect.height; // 0 -> 1
    const rotateY = (x - 0.5) * max * 2;
    const rotateX = (0.5 - y) * max * 2;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div className={`tilt-wrap ${className}`} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={cardRef} className="tilt-card" style={{ position: "relative" }}>
        {children}
        <div className="tilt-card-shine" />
      </div>
    </div>
  );
};

export default Tilt;
