export default (name, suffix = '') => {
  let sourceStr = name;

  if (URL.canParse(name)) {
    const url = new URL(name);
    sourceStr = `${url.host}${url.pathname}${url.search}`;
  }

  return sourceStr
    .replace(/[\W_]/g, ' ')
    .trim()
    .replace(/ /g, '-')
    .concat(suffix);
};
