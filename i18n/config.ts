import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const modules = (import.meta as any).glob("./**/*.json", { eager: true });

const resources: Record<string, { translation: Record<string, any> }> = {};

for (const path in modules) {
  const match = path.match(/\.\/([^/]+)\/.*\.json$/);
  if (!match) continue;

  const lang = match[1]; 
  const data = modules[path] as Record<string, any>;

  if (!resources[lang]) resources[lang] = { translation: {} };

  Object.assign(resources[lang].translation, data);
}

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "th",
  interpolation: { escapeValue: false },
});

export default i18n;
