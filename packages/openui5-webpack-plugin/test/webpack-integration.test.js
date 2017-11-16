'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const OpenUI5Plugin = require('../lib/OpenUI5Plugin');

const cases = fs.readdirSync(path.join(__dirname, 'cases'));
describe('Integration TestCases', () => {
  cases.forEach((testCase) => {
    it(testCase, (done) => {
      let options = {
        entry: {
          build: './index.js'
        },
        plugins: [
          new OpenUI5Plugin()
        ]
      };

      const testDirectory = path.join(__dirname, 'cases', testCase);
      const outputDirectory = path.join(__dirname, 'js', testCase);
      const configFile = path.join(testDirectory, 'webpack.config.js');

      if (fs.existsSync(configFile)) {
        options = require(configFile);
      }

      options.context = testDirectory;
      if (!options.output) options.output = { filename: '[name].js' };
      if (!options.output.path) options.output.path = outputDirectory;

      webpack(options, (err, stats) => {
        if (err) {
          done(err);
          return;
        }
        if (stats.hasErrors()) {
          done(new Error(stats.toString()));
          return;
        }

        const actualPath = path.join(outputDirectory, 'build.js');
        expect(readFileOrEmpty(actualPath)).toMatchSnapshot();
        done();
      });
    });
  });
});

function readFileOrEmpty(path) {
  try {
    return fs.readFileSync(path, 'utf-8');
  } catch (e) {
    return '';
  }
}
