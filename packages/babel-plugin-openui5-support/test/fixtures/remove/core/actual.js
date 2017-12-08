sap.ui.define([], function() {
  var bAsync = sPreloadMode === "async";

  // Initialize support info stack
  if (this.oConfiguration.getSupportMode() !== null) {
    var iSupportInfoTask = oSyncPoint2.startTask("support info script");

    var fnCallbackBootstrap = function(Bootstrap) {
      Bootstrap.initSupportRules(that.oConfiguration.getSupportMode());

      oSyncPoint2.finishTask(iSupportInfoTask);
    };

    var fnCallbackSupportInfo = function(Support) {
      Support.initializeSupportMode(that.oConfiguration.getSupportMode(), bAsync);

      if (bAsync) {
        sap.ui.require(["sap/ui/support/Bootstrap"], fnCallbackBootstrap);
      } else {
        fnCallbackBootstrap(sap.ui.requireSync("sap/ui/support/Bootstrap"));
      }
    };

    if (bAsync) {
      sap.ui.require(["sap/ui/core/support/Support"], fnCallbackSupportInfo);
    } else {
      fnCallbackSupportInfo(sap.ui.requireSync("sap/ui/core/support/Support"));
    }
  }
});
