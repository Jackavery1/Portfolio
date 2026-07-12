export function urlPageProd(htmlFile, siteBase) {
  if (htmlFile === 'index.html') return `${siteBase}/`;
  return `${siteBase}/${htmlFile}`;
}
