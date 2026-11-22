import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/* Strings every app needs. Apps pass their own strings, which are merged on top. */
const SHELL: Record<string, Record<string, string>> = {
  en: { online: "Online", offline: "Offline – still working", language: "Language", builtBy: "Built by",
    onDevice: "Data stays on this device. Nothing is sent to a server.", noStorage: "This browser is not keeping data. Download a backup before closing the page.",
    reviewNote: "Translations are drafts and are being reviewed by native speakers." },
  kn: { online: "ಆನ್‌ಲೈನ್", offline: "ಆಫ್‌ಲೈನ್ – ಕೆಲಸ ಮುಂದುವರಿದಿದೆ", language: "ಭಾಷೆ", builtBy: "ರಚನೆ",
    onDevice: "ಮಾಹಿತಿ ಈ ಸಾಧನದಲ್ಲೇ ಇರುತ್ತದೆ. ಯಾವುದೂ ಸರ್ವರ್‌ಗೆ ಹೋಗುವುದಿಲ್ಲ.", noStorage: "ಈ ಬ್ರೌಸರ್ ಮಾಹಿತಿ ಉಳಿಸುತ್ತಿಲ್ಲ. ಪುಟ ಮುಚ್ಚುವ ಮೊದಲು ಬ್ಯಾಕಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    reviewNote: "ಅನುವಾದಗಳು ಕರಡು ರೂಪದಲ್ಲಿವೆ; ಸ್ಥಳೀಯ ಭಾಷಿಕರು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದಾರೆ." },
  te: { online: "ఆన్‌లైన్", offline: "ఆఫ్‌లైన్ – పని కొనసాగుతోంది", language: "భాష", builtBy: "రూపకల్పన",
    onDevice: "సమాచారం ఈ పరికరంలోనే ఉంటుంది. ఏదీ సర్వర్‌కు వెళ్లదు.", noStorage: "ఈ బ్రౌజర్ సమాచారం నిల్వ చేయడం లేదు. పేజీ మూసే ముందు బ్యాకప్ డౌన్‌లోడ్ చేయండి.",
    reviewNote: "అనువాదాలు చిత్తు ప్రతులు; స్థానిక భాషా నిపుణులు సమీక్షిస్తున్నారు." },
  hi: { online: "ऑनलाइन", offline: "ऑफ़लाइन – काम जारी है", language: "भाषा", builtBy: "निर्माता",
    onDevice: "जानकारी इसी डिवाइस पर रहती है। कुछ भी सर्वर पर नहीं जाता।", noStorage: "यह ब्राउज़र डेटा नहीं रख रहा। पेज बंद करने से पहले बैकअप डाउनलोड करें।",
    reviewNote: "अनुवाद मसौदा हैं; मूल भाषी इनकी समीक्षा कर रहे हैं।" }
};

export function initI18n(app: Record<string, Record<string, unknown>>): typeof i18n {
  const langs = Object.keys(app);
  const resources = Object.fromEntries(langs.map(l => [l, { translation: { ...app[l], shell: SHELL[l] ?? SHELL.en } }]));
  let saved: string | null = null;
  try { const v = localStorage.getItem("aslp-kit-lang"); saved = v ? JSON.parse(v) : null; } catch { /* ignore */ }
  const nav = (navigator.language || "en").slice(0, 2);
  const lng = saved && langs.includes(saved) ? saved : langs.includes(nav) ? nav : "en";
  void i18n.use(initReactI18next).init({ resources, lng, fallbackLng: "en", interpolation: { escapeValue: false }, returnObjects: true });
  return i18n;
}
