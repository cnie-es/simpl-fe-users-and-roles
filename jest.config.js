/* eslint-disable */
export default {
  displayName: 'fe-users-and-roles',
  preset: 'jest-preset-angular',
  testEnvironment: "allure-jest/jsdom",
  testEnvironmentOptions: {
    resultsDir: "allure-results",
  },
  coveragePathIgnorePatterns: [
    "src/app/shared/api-clients"
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: 'coverage',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!@eui/core|@eui/.*\\.mjs$|.*\\.mjs$)@eui/.*',
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  moduleNameMapper: {
    'lodash-es': 'lodash',
    // flat: 'node_modules/flat-cjs-for-jest/index.js',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@fe-simpl/landing-page$': '<rootDir>/src/app/shared/landing-page/index.ts',
    '^@fe-simpl/core/pipes$': '<rootDir>/src/app/shared/pipes/index.ts',
    '^@fe-simpl/utils': '<rootDir>/src/app/shared/utils/index.ts',
    '^@fe-simpl/filter-chips': '<rootDir>/src/app/shared/filter-chips/filter-chips.component.ts',
  },
};
