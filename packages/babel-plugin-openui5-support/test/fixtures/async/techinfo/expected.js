sap.ui.define([], function () {
  import( /* webpackChunkName: "support" */"sap/ui/support/Bootstrap").then(function (Bootstrap) {
    var aSettings = [oSettings.support];

    if (oSettings.window) {
      aSettings.push("window");
    }

    Bootstrap.initSupportRules(aSettings);
  });
});
