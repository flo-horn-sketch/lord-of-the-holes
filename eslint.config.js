import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },

  // App-Code (Browser, JSX)
  {
    files: ["src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, "react-hooks": reactHooks },
    settings: { react: { version: "detect" } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.flat.recommended.rules,

      // Die wertvollen Bug-Faenger:
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Mit dem neuen JSX-Transform (React 19) nicht noetig:
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Bewusst aus: liefern auf diesem Legacy-Monolithen nur Rauschen,
      // keine Bugs. Koennen spaeter beim Refactor scharf gestellt werden.
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",

      // Leere catch-Bloecke sind hier bewusst (localStorage-Fehler ignorieren).
      "no-empty": ["error", { allowEmptyCatch: true }],

      // Ungenutzte Variablen als Warnung (potenziell toter Code),
      // mit gaengigen Ausnahmen.
      "no-unused-vars": [
        "warn",
        { args: "none", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },

  // Node-Kontext: Vercel-Serverless-Function + Build-/Tool-Configs
  {
    files: ["api/**/*.js", "*.config.js", "vite.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
