import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCategories, fetchListingById, createListing, updateListing } from "../../api/listings";
import { useAuth } from "../../context/AuthContext.jsx";

const ListingForm = () => {
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
      setError("Please type your service/product name for the 'Other' category");
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
      setError(err.response?.data?.message || "Could not save this listing, please try again");
    } finally {
      setLoading(false);
    }
  };

  const isShop = user?.role === "shop";

  return (
    <div className="container" style={{ padding: "36px 20px 60px", maxWidth: 640 }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>
        {isEdit ? "Edit Listing" : isShop ? "Add New Product" : "Add New Service"}
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-card">
        <div className="field">
          <label>{isShop ? "Product Name" : "Service Name"}</label>
          <input name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} required />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Price Type</label>
            <select name="priceType" value={form.priceType} onChange={handleChange}>
              <option value="fixed">Fixed</option>
              <option value="hourly">Per Hour</option>
              <option value="starting_at">Starting At</option>
            </select>
          </div>
          <div className="field">
            <label>Price (PKR)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" />
          </div>
          {isShop && (
            <div className="field">
              <label>Stock (quantity)</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" />
            </div>
          )}
        </div>

        {form.category === "other" && (
          <div className="field">
            <label>Your Category Name</label>
            <input
              name="customCategoryName"
              placeholder="e.g. Pest Control, Event Decoration..."
              value={form.customCategoryName}
              onChange={handleChange}
              required
            />
            <span className="field-hint">
              Don't see your service/product in the list? Pick "Other" above and type it here.
            </span>
          </div>
        )}

        <div className="field">
          <label>Photos (max 5)</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} />
        </div>

        <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Saving..." : isEdit ? "Update Listing" : "Add Listing"}
        </button>
      </form>
    </div>
  );
};

export default ListingForm;
