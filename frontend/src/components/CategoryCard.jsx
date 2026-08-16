import React from "react";
import { useNavigate } from "react-router-dom";
import CategoryIcon from "./CategoryIcon.jsx";
import Tilt from "./Tilt.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { categoryLabel } from "../utils/categoryLabel.js";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <Tilt max={8}>
      <div className="category-card" onClick={() => navigate(`/search?category=${category.id}`)}>
        <div className="category-icon">
          <CategoryIcon name={category.icon} size={28} />
        </div>
        <div className="category-label">{categoryLabel(category, t)}</div>
      </div>
    </Tilt>
  );
};

export default CategoryCard;
