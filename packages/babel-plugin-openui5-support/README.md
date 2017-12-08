# babel-plugin-openui5-support

Plugin to modify OpenUI5 to exclude or lazy load support modules. 

## Examples

### Load Async (default)

This will load the support module async when the configuration is enabled. It will replace the UI5 code 
with an ES6 import statement, which can be understood by webpack.

```json
{
  "plugins": ["openui5-support"]
}
```

### Remove completely

This will remove the support module bootstrapping from the code completely

```json
{
  "plugins": [
    [
      "openui5-support",
      {
        "mode": "remove"
      }
    ]
  ]
}
```
