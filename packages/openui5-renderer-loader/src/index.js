module.exports = function (source) {
  const path = this.resourcePath;
  const control = path.match(/[/\\]resources[/\\](.*)\.js$/);

  let output = source;

  if (control) {
    const callback = this.async();
    const name = control[1].replace(/\\/g, '/');
    const rendererName = `${name}Renderer`;
    this.resolve(this.context, rendererName, (err) => {
      if (!err) {
        this.addDependency(rendererName);
        output = `${source}\njQuery.sap.setObject("${rendererName.replace(/\//g, '.')}", require("${rendererName}"));`;
      }
      callback(null, output);
    });
  } else {
    return output;
  }
  return '';
};
