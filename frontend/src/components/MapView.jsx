import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import theme from "../theme.js";
import { formatPKR } from "../utils/format.js";
import { useLanguage } from "../context/LanguageContext.jsx";

// Custom SVG pin icon (avoids the classic leaflet marker-asset bundling issue,
// and lets the pin match the PiaraPakistan brand colors).
const makePinIcon = (color = theme.orangeDark) =>
  L.divIcon({
    className: "pp-map-pin",
    html: `
      <svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 13 21.7 14.1 22.6a1.4 1.4 0 0 0 1.8 0C17 36.7 30 25.5 30 15 30 6.7 23.3 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="15" r="6.5" fill="white"/>
      </svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

const orangePin = makePinIcon(theme.orangeDark);
const greenPin = makePinIcon(theme.greenDark);

// Recenters the map whenever `center` changes (e.g. after geolocation resolves)
const RecenterOnChange = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

/**
 * MapView
 * @param {Array} listings - array of listing docs with `.location.coordinates = [lng, lat]`
 * @param {{lat:number,lng:number}} userLocation - optional, shows a distinct pin for "you are here"
 * @param {number} height - px height of the map container
 */
const MapView = ({ listings = [], userLocation = null, height = 420 }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const points = useMemo(
    () =>
      listings
        .filter((l) => l.location?.coordinates?.some((c) => c !== 0))
        .map((l) => ({
          id: l._id,
          title: l.title,
          price: l.price,
          city: l.city,
          lat: l.location.coordinates[1],
          lng: l.location.coordinates[0],
        })),
    [listings]
  );

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : points.length > 0
    ? [points[0].lat, points[0].lng]
    : [33.6844, 73.0479]; // fallback: Islamabad

  return (
    <div style={{ height, borderRadius: "var(--pp-radius)", overflow: "hidden", border: "1px solid var(--pp-border)" }}>
      <MapContainer center={center} zoom={userLocation ? 13 : 11} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange center={userLocation ? [userLocation.lat, userLocation.lng] : null} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={greenPin}>
            <Popup>{t("map.youAreHere")}</Popup>
          </Marker>
        )}

        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={orangePin}>
            <Popup>
              <div style={{ minWidth: 140 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: theme.greenDark, fontWeight: 700 }}>{formatPKR(p.price)}</div>
                <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>{p.city}</div>
                <button
                  className="btn btn-primary"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                  onClick={() => navigate(`/listing/${p.id}`)}
                >
                  {t("map.viewBtn")}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
