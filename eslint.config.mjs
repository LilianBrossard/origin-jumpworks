import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Autorise `const { a, ...rest } = props` pour retirer des props avant de les transmettre.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_" },
      ],
    },
  },
  // Désactive les règles de style qui entreraient en conflit avec Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", ".cache/**", "next-env.d.ts"]),
]);

export default eslintConfig;
