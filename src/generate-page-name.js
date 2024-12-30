export default (url) => {
  const { host, pathname, search } = URL.parse(url);

  return `${host}${pathname}${search}`
    .replace(/[\W_]/g, ' ')
    .trim()
    .replace(/ /g, '-')
    .concat('.html');
};
