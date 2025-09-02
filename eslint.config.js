export default { root: true, env: { node: true, es2022: true, jest: true }, extends: ["eslint:recommended"], rules: { "no-console": "off" }, ignorePatterns: ["dist/", "node_modules/", "*.d.ts"] };
