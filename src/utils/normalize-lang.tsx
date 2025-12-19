const normalizeLang = (l?: string) => (l ?? "").replace(/^\/|\/$/g, ""); 
const withLang = (lang: string | undefined, path: string) => {
  const l = normalizeLang(lang);
  const p = path.startsWith("/") ? path : `/${path}`;

  if (!l) return p; 

  const alreadyHasLang = new RegExp(`^/${l}(/|$)`).test(p);
  return alreadyHasLang ? p : `/${l}${p}`;
};

export default withLang;
