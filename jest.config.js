/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/src/DirectedGraph/test-helpers/", , "/test.utilities.ts" ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/save/"],
  
};
