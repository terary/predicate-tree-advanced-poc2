/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/src/DirectedGraph/test-helpers/"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/save/" ],
};
