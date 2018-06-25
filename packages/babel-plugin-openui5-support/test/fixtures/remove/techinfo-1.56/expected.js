sap.ui.define([], function () {
  this._pingUrl(sUrl).then(function success() {
    this.close();
    var aSettings = [oSettings.support];
  });
});
