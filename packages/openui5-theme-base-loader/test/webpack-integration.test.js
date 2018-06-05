const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const cases = fs.readdirSync(path.join(__dirname, 'cases'));
describe('Integration TestCases', () => {
  cases.forEach((testCase) => {
    it(testCase, (done) => {
      const options = {
        entry: {
          build: './index.js',
        },
        resolve: {
          modules: [
            "test_components/test-library"
          ]
        },
        resolveLoader: {
          alias: {
            'openui5-theme-base-loader': path.join(__dirname, "../src/index")
          }
        },
        module: {
          rules: [
            {
              test: /\.less$/,
              use: 'less-loader'
            },
          ],
        },
        optimization: {
          minimize: false,
          runtimeChunk: 'single',
        },
        mode: 'production'
      };

      const testDirectory = path.join(__dirname, 'cases', testCase);
      const outputDirectory = path.join(__dirname, 'js', testCase);

      options.context = testDirectory;
      options.output = { filename: '[name].js' };
      options.output.path = outputDirectory;

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
