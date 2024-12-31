export default (tagName) => {
  switch (tagName) {
    case 'img':
    case 'script':
      return 'src';
    case 'link':
      return 'href';
    default:
      return 'href';
  }
};
