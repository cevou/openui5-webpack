const a = 'a.xml';
const bAsync = true;
LoaderExtensions.loadResource(a, { async: true });
LoaderExtensions.loadResource(a, { async: typeof bAsync !== "undefined" ? bAsync : false });
