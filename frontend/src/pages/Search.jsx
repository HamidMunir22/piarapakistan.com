import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings, fetchCategories } from "../api/listings";
import ListingCard from "../components/ListingCard.jsx";
import MapView from "../components/MapView.jsx";
import { MapPin, List, Map as MapIcon, SlidersHorizontal, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

const Search = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1, sortedByDistance: false });
  // "loading" only drives the small spinner next to the results count now —
  // it no longer replaces that count with a "Loading..." text, which used to
  // flash/flicker every time a filter changed (e.g. picking a category).
  const [loading, setLoading] = useState(true);
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);
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
        .finally(() => {
          setLoading(false);
          setHasSearchedOnce(true);
        });
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
      alert(t("search.locationUnsupported"));
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
        alert(t("search.locationError"));
      }
    );
  };

  return (
    <div className="container">
      <div className="search-layout">
        <aside className="filters-panel">
          <h3>
            <SlidersHorizontal size={16} className="filters-panel-icon" />
            {t("search.filtersTitle")}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{t("search.keyword")}</label>
              <input
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                placeholder={t("search.keywordPlaceholder")}
              />
            </div>
            <div className="field">
              <label>{t("search.category")}</label>
              <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)}>
                <option value="">{t("search.allCategories")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("search.city")}</label>
              <input
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder={t("search.cityPlaceholder")}
              />
            </div>
            <div className="field">
              <label>{t("search.type")}</label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange("listingType", e.target.value)}
              >
                <option value="">{t("search.typeServicesProducts")}</option>
                <option value="service">{t("search.typeServices")}</option>
                <option value="product">{t("search.typeProducts")}</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>{t("search.minPrice")}</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>
              <div className="field">
                <label>{t("search.maxPrice")}</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit">
              {t("search.searchButton")}
            </button>
          </form>

          <button
            className="btn btn-secondary btn-block"
            style={{ marginTop: 12 }}
            onClick={useMyLocation}
            disabled={locating}
            type="button"
          >
            <MapPin size={15} /> {locating ? t("search.locating") : t("search.nearMe")}
          </button>
        </aside>

        <main>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="search-results-count">
              {loading && <Loader2 size={14} className="search-loading-spinner" />}
              <span>
                {meta.total} {t("search.resultsCountSuffix")}
                {meta.sortedByDistance ? ` ${t("search.sortedByDistance")}` : ""}
              </span>
            </div>
            <div className="view-toggle">
              <button
                type="button"
                className={`view-toggle-btn ${view === "list" ? "active" : ""}`}
                onClick={() => setView("list")}
              >
                <List size={14} /> {t("search.list")}
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${view === "map" ? "active" : ""}`}
                onClick={() => setView("map")}
              >
                <MapIcon size={14} /> {t("search.map")}
              </button>
            </div>
          </div>

          {view === "map" ? (
            !loading && (
              <MapView listings={listings} userLocation={coords} height={560} />
            )
          ) : (
            <>
              {hasSearchedOnce && !loading && listings.length === 0 ? (
                <div className="empty-state">{t("search.noResults")}</div>
              ) : (
                <div className="listings-grid">
                  {listings.map((l, i) => (
                    <div key={l._id} className="listing-card-enter" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                      <ListingCard listing={l} />
                    </div>
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
