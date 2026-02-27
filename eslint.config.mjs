import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        units: "readonly",
        techs: "readonly",
        buildings: "readonly",
        bonuses: "readonly",
        presets: "readonly",
        scenarios: "readonly",
        featuredScenarios: "readonly",
        TECH_MAP: "readonly",
        civs: "readonly",
        Chart: "readonly",
        Sortable: "readonly",
      },
    },
    rules: {
      "no-redeclare": "off",
      "no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^(units|techs|buildings|bonuses|presets|scenarios|featuredScenarios|TECH_MAP|civs)$",
        },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
  },
];
