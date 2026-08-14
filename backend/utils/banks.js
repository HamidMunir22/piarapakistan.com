// Central list of payout options sellers/shops can attach to their profile —
// major Pakistani commercial banks plus the two mobile wallets already wired
// into the payment gateway (JazzCash/Easypaisa). Shown as a dropdown on the
// frontend so sellers aren't limited to just JazzCash/Easypaisa for receiving
// their payout/commission statements.
const BANKS = [
  "JazzCash",
  "Easypaisa",
  "HBL (Habib Bank Limited)",
  "UBL (United Bank Limited)",
  "MCB Bank",
  "Allied Bank (ABL)",
  "National Bank of Pakistan (NBP)",
  "Bank Alfalah",
  "Meezan Bank",
  "Faysal Bank",
  "Askari Bank",
  "Bank Al Habib",
  "Standard Chartered Pakistan",
  "Soneri Bank",
  "JS Bank",
  "Habib Metropolitan Bank",
  "Al Baraka Bank",
  "Dubai Islamic Bank Pakistan",
  "Summit Bank",
  "Sindh Bank",
  "Bank of Punjab",
  "Bank of Khyber",
  "Silk Bank",
  "First Women Bank",
  "Other",
];

module.exports = { BANKS };
