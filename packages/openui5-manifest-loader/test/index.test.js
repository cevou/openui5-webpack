import loader from '../src/index';

const manifest = JSON.stringify({
  "sap.app": {
    "id": "sap.ui.demo.todo",
    "type": "application"
  },
  "sap.ui5": {
    "dependencies": {
      "libs": {
        "sap.ui.core": {},
        "sap.m": {}
      }
    },
    "rootView": {
      "viewName": "sap.ui.demo.todo.view.App",
      "type": "XML",
    },
    "models": {
      "i18n": {
        "type": "sap.ui.model.resource.ResourceModel"
      },
      "": {
        "type": "sap.ui.model.json.JSONModel"
      }
    },
    "routing": {
      "config": {
        "routerClass": "sap.ui.core.routing.Router"
      }
    }
  }
});

describe('Renderer Loader', () => {
  it('should add dependencies', () => {
    const addDependency = jest.fn();
    const data = loader.apply({
      addDependency,
    }, [manifest]);


    expect(addDependency.mock.calls.length).toBe(7);
    expect(addDependency.mock.calls[0][0]).toBe("sap/ui/core/library");
    expect(addDependency.mock.calls[1][0]).toBe("sap/m/library");
    expect(addDependency.mock.calls[2][0]).toBe("sap/ui/core/mvc/XMLView");
    expect(addDependency.mock.calls[3][0]).toBe("./view/App.view.xml");
    expect(addDependency.mock.calls[4][0]).toBe("sap/ui/model/resource/ResourceModel");
    expect(addDependency.mock.calls[5][0]).toBe("sap/ui/model/json/JSONModel");
    expect(addDependency.mock.calls[6][0]).toBe("sap/ui/core/routing/Router");
    expect(data).toMatchSnapshot();
  })
});
