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
  {
    // Scène 3D : three.js fonctionne par mutation d'objets (positions, uniforms, matériaux)
    // à chaque image, et le décor est tiré au hasard une seule fois, côté navigateur
    // (composants montés sans rendu serveur). Ces deux règles du compilateur React
    // ne s'appliquent donc pas à ce dossier.
    files: ["components/three/**"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
    },
  },
  // Désactive les règles de style qui entreraient en conflit avec Prettier.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", ".cache/**", "next-env.d.ts"]),
]);

export default eslintConfig;
