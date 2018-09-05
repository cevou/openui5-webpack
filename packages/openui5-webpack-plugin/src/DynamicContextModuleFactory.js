const Tapable = require('tapable').Tapable;
const DynamicContextModule = require('./DynamicContextModule');

class DynamicContextModuleFactory extends Tapable {
  constructor(requireSync) {
    super();
    this.requireSync = requireSync || [];
  }

  create(data, callback) {
    return callback(null, new DynamicContextModule({
      requireSync: this.requireSync,
    }));
  }
}

module.exports = DynamicContextModuleFactory;
