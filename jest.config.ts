export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(\\.|/)(test|spec)\\.[jt]sx?$",
};
