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
  });

  it('should handle custom name for root element in view', (done) => {
    const xml = `<m:View xmlns:m="sap.ui.core.mvc" xmlns="sap.m"><Button /></m:View>`;

    loader.apply({
      async: () => (err, data) => {
        expect(data).toMatchSnapshot();
        done();
      },
      addDependency: jest.fn(),
    }, [xml]);
  });

  it('should handle a fragment', (done) => {
    const xml = `<core:FragmentDefinition xmlns:core="sap.ui.core" xmlns="sap.m"><Button/></core:FragmentDefinition>`;

    loader.apply({
      async: () => (err, data) => {
        expect(data).toMatchSnapshot();
        done();
      },
      addDependency: jest.fn(),
    }, [xml]);
  });

  it('should return an error if the XML is invalid', (done) => {
    const xml = `<m:View xmlns:m="sap.ui.core.mvc" xmlns="sap.m"><Button></m:View>`;

    loader.apply({
      async: () => (err) => {
        expect(err.toString()).toContain("Invalid XML");
        done();
      },
      addDependency: jest.fn(),
    }, [xml]);
  });
});
