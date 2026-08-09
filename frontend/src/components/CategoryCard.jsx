import React from "react";
import { useNavigate } from "react-router-dom";
import CategoryIcon from "./CategoryIcon.jsx";
import Tilt from "./Tilt.jsx";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  return (
    <Tilt max={8}>
      <div className="category-card" onClick={() => navigate(`/search?category=${category.id}`)}>
        <div className="category-icon">
          <CategoryIcon name={category.icon} size={28} />
        </div>
        <div className="category-label">{category.label}</div>
      </div>
    </Tilt>
  );
};

export default CategoryCard;
