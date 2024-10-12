const config = require('./jest.config.js');

// packagejwt/jest.config.test.js


describe('Jest Configuration', () => {
  test('should have ts-jest preset', () => {
    expect(config.preset).toBe('ts-jest');
  });

  test('should have node test environment', () => {
    expect(config.testEnvironment).toBe('node');
  });

  test('should have correct roots', () => {
    expect(config.roots).toContain('<rootDir>/src/__tests__');
  });

  test('should have correct module file extensions', () => {
    expect(config.moduleFileExtensions).toEqual(expect.arrayContaining(['ts', 'js']));
  });

  test('should have correct transform configuration', () => {
    expect(config.transform).toEqual({
      '^.+\\.ts$': 'ts-jest',
    });
  });

  test('should have correct test regex', () => {
    expect(config.testRegex).toBe('(/__tests__/.*|(\\.|/)(test|spec))\\.ts$');
  });
});