import React from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import Tilt from "./Tilt.jsx";
import { formatPKR, resolveImageUrl } from "../utils/format.js";
import { useLanguage } from "../context/LanguageContext.jsx";

const priceLabel = (listing, t) => {
  const amount = formatPKR(listing.price);
  if (listing.priceType === "hourly") return `${amount} ${t("listing.perHourSuffix")}`;
  if (listing.priceType === "starting_at") return `${amount} ${t("listing.onwardsSuffix")}`;
  return amount;
};

const ListingCard = ({ listing }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const seller = listing.seller || {};
  const image = resolveImageUrl(listing.images?.[0]);

  return (
    <Tilt max={6}>
      <div className="listing-card" onClick={() => navigate(`/listing/${listing._id}`)}>
        <div className="listing-card-img">
          {image ? <img src={image} alt={listing.title} /> : <div className="listing-card-img-placeholder">📷</div>}
        </div>
        <div className="listing-card-body">
          <div className="listing-card-title">{listing.title}</div>
          <div className="listing-card-seller">
            {seller.businessName || `${seller.firstName || ""} ${seller.lastName || ""}`}
          </div>
          <div className="listing-card-meta">
            <span className="listing-card-location">
              <MapPin size={13} /> {listing.area ? `${listing.area}, ` : ""}
              {listing.city}
            </span>
            <span className="listing-card-rating">
              <Star size={13} fill="var(--pp-orange)" color="var(--pp-orange)" />
              {listing.ratingCount > 0 ? listing.ratingAverage.toFixed(1) : t("listing.newBadge")}
            </span>
          </div>
          <div className="listing-card-price">{priceLabel(listing, t)}</div>
        </div>
      </div>
    </Tilt>
  );
};

export default ListingCard;
