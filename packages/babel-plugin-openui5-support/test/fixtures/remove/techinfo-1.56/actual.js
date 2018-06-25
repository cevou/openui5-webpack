sap.ui.define([], function() {
  this._pingUrl(sUrl).then(function success() {
    this.close();
    var aSettings = [oSettings.support];
    sap.ui.getCore().loadLibrary("sap.ui.support", { async: true, url: sUrl }).then(function () {
      if (oSettings.window) {
        aSettings.push("window");
      }

      if (aSettings[0].toLowerCase() === "true" || aSettings[0].toLowerCase() === "silent") {
        sap.ui.require(["sap/ui/support/Bootstrap"], function (oBootstrap) {
          oBootstrap.initSupportRules(aSettings);
        });
      }
    });
  });
});
