import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCategories, fetchListingById, createListing, updateListing } from "../../api/listings";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { categoryLabel } from "../../utils/categoryLabel.js";

const ListingForm = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    customCategoryName: "",
    price: "",
    priceType: "fixed",
    stock: "",
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories);
    if (isEdit) {
      fetchListingById(id).then((listing) => {
        setForm({
          title: listing.title,
          description: listing.description,
          category: listing.category,
          customCategoryName: listing.customCategoryName || "",
          price: listing.price,
          priceType: listing.priceType,
          stock: listing.stock ?? "",
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.category === "other" && !form.customCategoryName.trim()) {
      setError(t("dash.errCustomCategoryOther"));
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append("images", img));

      if (isEdit) {
        await updateListing(id, fd);
      } else {
        await createListing(fd);
      }
      navigate("/dashboard/listings");
    } catch (err) {
      setError(err.response?.data?.message || t("dash.errSaveDefault"));
    } finally {
      setLoading(false);
    }
  };

  const isShop = user?.role === "shop";

  return (
    <div className="container" style={{ padding: "36px 20px 60px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        {isEdit ? t("dash.editListingTitle") : isShop ? t("dash.addNewProductTitle") : t("dash.addNewServiceTitle")}
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-card">
        <div className="field">
          <label>{isShop ? t("dash.productNameLabel") : t("dash.serviceNameLabel")}</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>{t("dash.descriptionLabel")}</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} required />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>{t("search.category")}</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">{t("common.select")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c, t)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t("dash.priceTypeLabel")}</label>
            <select name="priceType" value={form.priceType} onChange={handleChange}>
              <option value="fixed">{t("dash.priceTypeFixed")}</option>
              <option value="hourly">{t("dash.priceTypeHourly")}</option>
              <option value="starting_at">{t("dash.priceTypeStartingAt")}</option>
            </select>
          </div>
          <div className="field">
            <label>{t("dash.priceLabel")}</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
          </div>
          {isShop && (
            <div className="field">
              <label>{t("dash.stockLabel")}</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" />
            </div>
          )}
        </div>

        {form.category === "other" && (
          <div className="field">
            <label>{t("auth.customCategoryLabel")}</label>
            <input
              name="customCategoryName"
              placeholder={t("auth.customCategoryPlaceholder")}
              value={form.customCategoryName}
              onChange={handleChange}
              required
            />
            <span className="field-hint">{t("dash.customCategoryHint2")}</span>
          </div>
        )}

        <div className="field">
          <label>{t("dash.photosLabel")}</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} />
        </div>

        <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? t("dash.saving") : isEdit ? t("dash.updateListingBtn") : t("dash.addListingBtn")}
        </button>
      </form>
    </div>
  );
};

export default ListingForm;
