sap.ui.define([], function() {
  jQuery.ajax({
    type: "HEAD",
    async: true,
    context:this,
    url: sUrl + "Bootstrap.js",
    success: function () {
      this.close();
      jQuery.sap.registerModulePath("sap.ui.support", sUrl);
      var oBootstrap = sap.ui.requireSync("sap/ui/support/Bootstrap"),
        // Settings needs to be converted to array required by initSupportRules function
        aSettings = [oSettings.support];
      if (oSettings.window) {
        aSettings.push("window");
      }
      oBootstrap.initSupportRules(aSettings);
    },
    error: function (jqXHR, exception) {
      var msg = this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.SupportAssistantNotFound");
      if (jqXHR.status === 0) {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.ErrorTryingToGetRecourse");
      } else if (jqXHR.status === 404) {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.ErrorNotFound");
      } else if (jqXHR.status === 500) {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.InternalServerError");
      } else if (exception === 'parsererror') {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.ErrorOnJsonParse");
      } else if (exception === 'timeout') {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.ErrorOnTimeout");
      } else if (exception === 'abort') {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.ErrorWhenAborted");
      } else {
        msg += this._oDialog.getModel("i18n").getProperty("TechInfo.SupportAssistantConfigPopup.UncaughtError") + jqXHR.responseText;
      }
      this._sErrorMessage = msg;
      this.onConfigureAssistantBootstrap();
      jQuery.sap.log.error("Support Assistant could not be loaded from the URL you entered");
    }
  });
});
