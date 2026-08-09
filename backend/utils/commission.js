/**
 * Works out what commission applies to an order.
 *
 * Priority: seller's own override (if the admin set one) > platform's global
 * default (set by admin in Settings > Commission). Two modes are supported:
 *   - "percent": commission = totalAmount * percent / 100
 *   - "fixed":   commission = a flat PKR amount, regardless of order size
 *                (capped at totalAmount so commission can never exceed the sale)
 */
const calculateCommission = (seller, settings, totalAmount) => {
  const hasOverride = seller.commissionType !== null && seller.commissionType !== undefined;

  const commissionType = hasOverride ? seller.commissionType : settings.commissionType;

  let commissionPercent = null;
  let commissionAmount;

  if (commissionType === "fixed") {
    const fixedAmount = hasOverride
      ? seller.commissionFixedAmount ?? settings.commissionFixedAmount
      : settings.commissionFixedAmount;
    commissionAmount = Math.min(Math.round(fixedAmount), totalAmount);
  } else {
    commissionPercent = hasOverride
      ? seller.commissionPercent ?? settings.commissionPercent
      : settings.commissionPercent;
    commissionAmount = Math.round((totalAmount * commissionPercent) / 100);
  }

  const sellerPayout = totalAmount - commissionAmount;

  return { commissionType, commissionPercent, commissionAmount, sellerPayout };
};

module.exports = { calculateCommission };
