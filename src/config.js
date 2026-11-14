// Store settings: edit these
export const WHATSAPP_NUMBER = "2349132852419"; // country code + number, no + or spaces
export const CURRENCY = "₦";
export const PHONE_DISPLAY = "0913 285 2419";
export const ADDRESS = "No 26 Enugu Road, Agbani, Nkanu West, Enugu State";
export const EMAIL = "[Add email address]";
// Exact map pin. In Google Maps, right-click the shop's real spot and click the
// numbers at the top of the menu to copy them, then paste here, e.g. "6.2861, 7.5512".
// Leave empty ("") to fall back to searching the ADDRESS text.
export const MAP_COORDS = "";

export const fmt = (n) => CURRENCY + n.toLocaleString("en-NG");
export const waLink = (text = "") =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? "?text=" + encodeURIComponent(text) : ""}`;
export const DEFAULT_WA_TEXT = "Hello ANIGOOD COMMUNICATION LTD, I would like to make an enquiry.";
