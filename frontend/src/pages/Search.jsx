import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings, fetchCategories } from "../api/listings";
import ListingCard from "../components/ListingCard.jsx";
import MapView from "../components/MapView.jsx";
import { MapPin, List, Map as MapIcon } from "lucide-react";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, sortedByDistance: false });
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [view, setView] = useState("list"); // "list" | "map"

  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    listingType: searchParams.get("listingType") || "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const runSearch = useCallback(
    (page = 1) => {
      setLoading(true);
      const params = { ...filters, page, limit: view === "map" ? 100 : 12 };
      if (coords) {
        params.lat = coords.lat;
        params.lng = coords.lng;
      }
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      fetchListings(params)
        .then((data) => {
          setListings(data.listings);
          setMeta({ total: data.total, page: data.page, pages: data.pages, sortedByDistance: data.sortedByDistance });
        })
        .finally(() => setLoading(false));
    },
    [filters, coords, view]
  );

  useEffect(() => {
    runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, coords, view]);

  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(1);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Aapka browser location share nahi kar sakta");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Location access nahi mil saka. Browser settings check karein.");
      }
    );
  };

  return (
    <div className="container">
      <div className="search-layout">
        <aside className="filters-panel">
          <h3>Filters</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Keyword</label>
              <input
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                placeholder="e.g. AC repair"
              />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
                <option value="">Sab Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>City</label>
              <input
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="e.g. Rawalpindi"
              />
            </div>
            <div className="field">
              <label>Type</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange("listingType", e.target.value)}
              >
                <option value="">Services + Products</option>
                <option value="service">Services</option>
                <option value="product">Products</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Min Price (PKR)</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>
              <div className="field">
                <label>Max Price (PKR)</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              Search Karein
            </button>
          </form>

          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: 12 }}
            onClick={useMyLocation}
            disabled={locating}
            type="button"
          >
            <MapPin size={15} /> {locating ? "Location le rahe hain..." : "Mere qareeb dikhayein"}
          </button>
        </aside>

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ color: "var(--pp-muted)", fontSize: 13.5 }}>
              {loading
                ? "Search ho raha hai..."
                : `${meta.total} results mile ${meta.sortedByDistance ? "(aapke qareeb sorted)" : ""}`}
            </div>
            <div style={{ display: "flex", gap: 6, background: "var(--pp-cream)", padding: 4, borderRadius: 999, border: "1px solid var(--pp-border)" }}>
              <button
                type="button"
                className="btn"
                style={{
                  padding: "6px 14px",
                  fontSize: 12.5,
                  background: view === "list" ? "var(--pp-white)" : "transparent",
                  boxShadow: view === "list" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  color: "var(--pp-ink)",
                }}
                onClick={() => setView("list")}
              >
                <List size={14} /> List
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  padding: "6px 14px",
                  fontSize: 12.5,
                  background: view === "map" ? "var(--pp-white)" : "transparent",
                  boxShadow: view === "map" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  color: "var(--pp-ink)",
                }}
                onClick={() => setView("map")}
              >
                <MapIcon size={14} /> Map
              </button>
            </div>
          </div>

          {view === "map" ? (
            !loading && (
              <MapView listings={listings} userLocation={coords} height={560} />
            )
          ) : (
            <>
              {!loading && listings.length === 0 ? (
                <div className="empty-state">Koi listing nahi mili. Filters badal kar dobara koshish karein.</div>
              ) : (
                <div className="listings-grid">
                  {listings.map((l) => (
                    <ListingCard key={l._id} listing={l} />
                  ))}
                </div>
              )}

              {meta.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 26 }}>
                  {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={p === meta.page ? "btn btn-primary" : "btn btn-secondary"}
                      onClick={() => runSearch(p)}
                      style={{ padding: "8px 14px" }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Search;
