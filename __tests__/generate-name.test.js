import generateName from '../src/generate-name.js';

describe('Generate file name', () => {
  test('output should be without protocol', () => {
    const url = 'https://ru.hexlet.io/courses';
    const result = generateName(url, '.html');
    const { protocol } = new URL(url);
    expect(result).toEqual(expect.not.stringContaining(protocol));
  });

  test.each([
    { name: 'test', suffix: '.html', expectation: 'test.html' },
    { name: 'test', suffix: '.png', expectation: 'test.png' },
    { name: 'test', suffix: '_files', expectation: 'test_files' },
  ])('output should end with specified suffix: "$suffix"', ({ name, suffix, expectation }) => {
    const result = generateName(name, suffix);
    expect(result).toEqual(expectation);
  });

  test.each([
    { input: 'http://hexlet.io', output: 'hexlet-io.html' },
    { input: 'https://ru.hexlet.io/courses', output: 'ru-hexlet-io-courses.html' },
    { input: 'http://test-01/path/1', output: 'test-01-path-1.html' },
    { input: 'http://test-02/path/search?q=test', output: 'test-02-path-search-q-test.html' },
  ])('input "$input" should match "$output"', ({ input, output }) => {
    const result = generateName(input, '.html');
    expect(result).toEqual(expect.stringMatching(output));
  });
});
