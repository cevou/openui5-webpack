import path from 'path';
import loader from '../src/index';

describe('XML Loader', () => {
  it('should handle custom rootPaths', (done) => {
    const xml = `<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:c="my.custom.namespace">
  <c:TestControl />
</mvc:View>`;

    const addDependency = jest.fn();

    loader.apply({
      query: {
        modulePaths: {
          'my.custom.namespace': path.resolve(__dirname, 'fixtures/custom')
        }
      },
      async: () => (err, data) => {
        expect(data).toMatchSnapshot();
        done();
      },
      context: __dirname,
      addDependency,
    }, [xml]);
  })
});
