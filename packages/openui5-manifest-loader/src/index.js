import jp from 'jsonpath';
import loaderUtils from 'loader-utils';

module.exports = function (source) {
  const defaultOptions = {
    translations: ["en"],
  };

  const options = Object.assign(
    {},
    defaultOptions,
    loaderUtils.getOptions(this),
  );

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
      const lib = libs[i].replace(/\./g, "/");
      addDependency(`${lib}/library`);

      // add messagebundles for UI texts
      addDependency(`${lib}/messagebundle.properties`);
      for (let j = 0; j < options.translations.length; j++) {
        const translation = options.translations[j];
        addDependency(`${lib}/messagebundle_${translation}.properties`);
      }
    }
  }

  const rootView = jp.value(manifest, jp.stringify(["$", "sap.ui5", "rootView"]));
  if (rootView) {
    if (rootView.type) {
      addDependency(`sap/ui/core/mvc/${rootView.type}View`);
    }
    if (rootView.viewName && rootView.type) {
      addDependency(`.${rootView.viewName.replace(appId, "").replace(/\./g, "/")}.view.${rootView.type.toLowerCase()}`);
    }
  }

  const models = jp.query(manifest, "$..models.*");
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    addDependency(model.type.replace(/\./g, "/"));

    // Add dependency for ResourceModel properties files
    if (model.type === "sap.ui.model.resource.ResourceModel" && model.settings && model.settings.bundleName) {
      const bundleName = `.${model.settings.bundleName.replace(appId, "").replace(/\./g, "/")}`;
      addDependency(`${bundleName}.properties`);
      for (let i = 0; i < options.translations.length; i++) {
        const translation = options.translations[i];
        addDependency(`${bundleName}_${translation}.properties`);
      }
    }
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
