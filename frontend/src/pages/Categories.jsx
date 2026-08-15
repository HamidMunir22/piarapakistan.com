import React, { useEffect, useState } from "react";
import { fetchCategories } from "../api/listings";
import CategoryCard from "../components/CategoryCard.jsx";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: "40px 20px 60px" }}>
      <h1 style={{ fontSize: 28 }}>Categories</h1>
      <p style={{ color: "var(--pp-muted)" }}>Choose a category that matches your need</p>

      {loading ? (
        <p style={{ marginTop: 30 }}>Loading...</p>
      ) : (
        <div className="categories-grid">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
