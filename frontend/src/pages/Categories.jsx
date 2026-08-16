import React, { useEffect, useState } from "react";
import { fetchCategories } from "../api/listings";
import CategoryCard from "../components/CategoryCard.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

const Categories = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: "40px 20px 60px" }}>
      <h1 style={{ fontSize: 28 }}>{t("nav.categories")}</h1>
      <p style={{ color: "var(--pp-muted)" }}>{t("categories.subtitle")}</p>

      {!loading && (
        <div className="categories-grid categories-grid-loaded">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
