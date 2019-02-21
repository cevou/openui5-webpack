import loader from '../src/index';

describe('Renderer Loader', () => {
  it('should handle control filter', (done) => {
    const content = 'test-content';
    const addDependency = jest.fn();
    loader.apply({
      query: {
        filterRegEx: /[/\\]src[/\\](.*)\.js$/
      },
      async: () => (err, data) => {
        expect(addDependency.mock.calls.length).toBe(1);
        expect(addDependency.mock.calls[0][0]).toEqual('abc/TestRenderer');
        expect(data).toMatchSnapshot();
        done();
      },
      resolve: (context, name, callback) => {
        callback();
      },
      addDependency,
      resourcePath: 'test/src/abc/Test.js',
    }, [content]);
  })
});
