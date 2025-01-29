import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // React & Next.js
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Enhanced Import Path Rules
      "sort-imports": [
        "error",
        {
          "ignoreCase": true,
          "ignoreDeclarationSort": true,
          "ignoreMemberSort": false,
          "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
        }
      ],

      // Path Alias Rules
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["../*"],
              "message": "Use @/ path alias instead of relative imports"
            },
            {
              "group": ["./*"],
              "message": "Use @/ path alias for imports from the same directory"
            },
            {
              "group": ["@/components/**/index"],
              "message": "Import component directly instead of using index"
            },
            {
              "group": ["src/*"],
              "message": "Use @/ path alias instead of src/"
            }
          ]
        }
      ],

      // Import Organization
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          "prefer": "type-imports",
          "disallowTypeAnnotations": false
        }
      ],

      // Accessibility
      "jsx-a11y/anchor-is-valid": [
        "error",
        {
          "components": ["Link"],
          "specialLink": ["hrefLeft", "hrefRight"],
          "aspects": ["invalidHref", "preferButton"]
        }
      ],

      // Code Style
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "warn",
      "prefer-const": "error",
      "no-unused-expressions": "warn",
      "no-duplicate-imports": "error"
    }
  }
];

export default eslintConfig;
