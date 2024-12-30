import generateFileName from '../src/generate-page-name.js';

describe('Generate file name', () => {
  test('output should be without protocol', () => {
    const url = 'https://ru.hexlet.io/courses';
    const result = generateFileName(url);
    const { protocol } = new URL(url);
    expect(result).toEqual(expect.not.stringContaining(protocol));
  });

  test('output should end with .html', () => {
    const url = 'https://ru.hexlet.io/courses';
    const result = generateFileName(url);
    expect(result).toEqual(expect.stringMatching(/\.html$/));
  });

  test.each([
    { input: 'http://hexlet.io', output: 'hexlet-io.html' },
    { input: 'https://ru.hexlet.io/courses', output: 'ru-hexlet-io-courses.html' },
    { input: 'http://test-01/path/1', output: 'test-01-path-1.html' },
    { input: 'http://test-02/path/search?q=test', output: 'test-02-path-search-q-test.html' },
  ])('input "$input" should match "$output"', ({ input, output }) => {
    const result = generateFileName(input);
    expect(result).toEqual(expect.stringMatching(output));
  });
});
