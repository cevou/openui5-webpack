import jp from 'jsonpath';

module.exports = function (source) {
  const manifest = JSON.parse(source);
  const dependencies = [];

  const addDependency = (dep) => {
    dependencies.push(dep);
    this.addDependency(dep);
  }

  // Get app ID
  const appId = jp.value(manifest, jp.stringify(["$", "sap.app", "id"])) || "";

  // Load libraries
  const libraries = jp.value(manifest, jp.stringify(["$", "sap.ui5", "dependencies", "libs"]));
  if (libraries) {
    const libs = Object.keys(libraries);
    for (let i = 0; i < libs.length; i++) {
      const lib = libs[i];
      addDependency(`${lib.replace(/\./g, "/")}/library`);
    }
  }

  const rootView = jp.value(manifest, jp.stringify(["$", "sap.ui5", "rootView"]));
  if (rootView) {
    if (rootView.type) {
      this.addDependency(`sap/ui/core/mvc/${rootView.type}View`);
    }
    if (rootView.viewName) {
      addDependency(`.${rootView.viewName.replace(appId, "").replace(/\./g, "/")}.view.${rootView.type.toLowerCase()}`);
    }
  }

  const models = jp.query(manifest, "$..models.*.type");
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    addDependency(model.replace(/\./g, "/"));
  }

  const routerClass = jp.value(manifest, "$..routerClass");
  if (routerClass) {
    addDependency(routerClass.replace(/\./g, "/"));
  }

  const deps = dependencies.reduce((str, dep) => {
    return str + `sap.ui.requireSync("${dep}");\n`;
  }, "");

  return `${deps}module.exports=${source}`;
}
