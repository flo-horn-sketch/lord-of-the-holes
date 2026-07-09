/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Der Regex /[-:.TZ]/g (ISO-Timestamp bereinigen) wird vom Tailwind-Scanner
  // faelschlich als Arbitrary-Property-Klasse "[-:.TZ]" erkannt und erzeugt
  // ungueltiges CSS. Hier explizit ausschliessen.
  blocklist: ["[-:.TZ]"],
  theme: {
    extend: {},
  },
  plugins: [],
};
