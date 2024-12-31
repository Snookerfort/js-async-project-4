export default (name, suffix = '') => {
  let sourceStr = name;

  if (URL.canParse(name)) {
    const { host, pathname, search } = URL.parse(name);
    sourceStr = `${host}${pathname}${search}`;
  }

  return sourceStr
    .replace(/[\W_]/g, ' ')
    .trim()
    .replace(/ /g, '-')
    .concat(suffix);
};
