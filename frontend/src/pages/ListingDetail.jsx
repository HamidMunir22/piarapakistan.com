import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchListingById } from "../api/listings";
import { Star, MapPin, Phone, ShoppingCart, Minus, Plus, MessageCircle } from "lucide-react";
import MapView from "../components/MapView.jsx";
import { formatPKR, resolveImageUrl } from "../utils/format.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchListingById(id)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;
  if (!listing) return <div className="container" style={{ padding: 60 }}>Listing not found.</div>;

  const seller = listing.seller || {};
  const isProduct = listing.listingType === "product";
  const outOfStock = isProduct && (!listing.stock || listing.stock <= 0);
  const isOwnListing = user && seller._id === user._id;

  const handleAddToCart = () => {
    addToCart(listing, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    addToCart(listing, qty);
    navigate("/cart");
  };

  return (
    <div className="container" style={{ padding: "36px 20px 60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40 }}>
        <div>
          <div style={{ height: 340, borderRadius: 14, overflow: "hidden", background: "var(--pp-cream)", border: "1px solid var(--pp-border)" }}>
            {listing.images?.length > 0 ? (
              <img
                src={resolveImageUrl(listing.images[activeImg])}
                alt={listing.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                📷
              </div>
            )}
          </div>
          {listing.images?.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={resolveImageUrl(img)}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: i === activeImg ? "2px solid var(--pp-orange)" : "1px solid var(--pp-border)",
                  }}
                  alt=""
                />
              ))}
            </div>
          )}

          <h1 style={{ marginTop: 24, fontSize: 26 }}>{listing.title}</h1>
          <div style={{ color: "var(--pp-muted)", display: "flex", gap: 16, margin: "8px 0 18px", fontSize: 13.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={14} /> {listing.area ? `${listing.area}, ` : ""}{listing.city}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={14} fill="var(--pp-orange)" color="var(--pp-orange)" />
              {listing.ratingCount > 0 ? `${listing.ratingAverage.toFixed(1)} (${listing.ratingCount} reviews)` : "Abhi koi review nahi"}
            </span>
          </div>
          <p style={{ lineHeight: 1.7, color: "var(--pp-ink)" }}>{listing.description}</p>
        </div>

        <div>
          <div className="auth-card" style={{ position: "sticky", top: 90 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--pp-green-dark)", marginBottom: 6 }}>
              {formatPKR(listing.price)}
              {listing.priceType === "hourly" && <span style={{ fontSize: 14, fontWeight: 500 }}> / ghanta</span>}
              {listing.priceType === "starting_at" && <span style={{ fontSize: 14, fontWeight: 500 }}> se shuru</span>}
            </div>
            {listing.listingType === "product" && (
              <div style={{ fontSize: 13, color: "var(--pp-muted)", marginBottom: 16 }}>
                {listing.stock > 0 ? `Stock mein: ${listing.stock}` : "Stock khatam"}
              </div>
            )}

            {isOwnListing ? (
              <div className="alert alert-error">Ye aapki apni listing hai.</div>
            ) : outOfStock ? (
              <div className="alert alert-error">Filhal stock khatam hai.</div>
            ) : (
              <>
                {isProduct && (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Quantity</span>
                    <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--pp-border)", borderRadius: 999 }}>
                      <button type="button" className="icon-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: "0 12px", fontWeight: 700, fontSize: 14 }}>{qty}</span>
                      <button type="button" className="icon-btn" onClick={() => setQty((q) => q + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary btn-block" style={{ marginBottom: 10 }} onClick={handleBuyNow}>
                  {isProduct ? "Abhi Khareedein" : "Abhi Book Karein"}
                </button>
                <button className="btn btn-secondary btn-block" onClick={handleAddToCart}>
                  <ShoppingCart size={15} /> {added ? "Cart mein add ho gaya ✓" : "Cart mein Add Karein"}
                </button>
                {seller.phone && (
                  <a href={`tel:${seller.phone}`} className="btn btn-secondary btn-block" style={{ marginTop: 10 }}>
                    <Phone size={15} /> Seller ko Call Karein
                  </a>
                )}
                <button
                  className="btn btn-secondary btn-block"
                  style={{ marginTop: 10 }}
                  onClick={() =>
                    user
                      ? navigate(`/messages?sellerId=${seller._id}&listingId=${listing._id}`)
                      : navigate("/login")
                  }
                >
                  <MessageCircle size={15} /> Seller ko Message Karein
                </button>
              </>
            )}

            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--pp-border)" }} />

            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {seller.businessName || `${seller.firstName} ${seller.lastName}`}
            </div>
            <div style={{ fontSize: 13, color: "var(--pp-muted)" }}>
              {seller.city}{seller.area ? `, ${seller.area}` : ""}
            </div>
          </div>
        </div>
      </div>

      {listing.location?.coordinates?.some((c) => c !== 0) && (
        <div style={{ marginTop: 36 }}>
          <h3 style={{ fontSize: 17, marginBottom: 12 }}>
            <MapPin size={16} style={{ verticalAlign: -2 }} /> Location
          </h3>
          <MapView listings={[listing]} height={320} />
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <Link to="/search" className="btn btn-secondary">← Wapas Search par jayein</Link>
      </div>
    </div>
  );
};

export default ListingDetail;
