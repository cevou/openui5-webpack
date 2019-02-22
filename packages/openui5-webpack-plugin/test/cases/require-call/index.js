function test() {
  return "./a"
}

sap.ui.require(test(), function(a) {
  const c = a;
});
