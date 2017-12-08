sap.ui.define([], function () {
  var bAsync = sPreloadMode === "async";

  // Initialize support info stack
  if (this.oConfiguration.getSupportMode() !== null) {
    var iSupportInfoTask = oSyncPoint2.startTask("support info script");

    var fnCallbackBootstrap = function (Bootstrap) {
      Bootstrap.initSupportRules(that.oConfiguration.getSupportMode());

      oSyncPoint2.finishTask(iSupportInfoTask);
    };

    var fnCallbackSupportInfo = function (Support) {
      Support.initializeSupportMode(that.oConfiguration.getSupportMode(), bAsync);

      import( /* webpackChunkName: "support" */"sap/ui/support/Bootstrap").then(fnCallbackBootstrap);
    };

    import( /* webpackChunkName: "support" */"sap/ui/core/support/Support").then(fnCallbackSupportInfo);
  }
});
