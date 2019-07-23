module.exports = () => {
  global.browser = {
    runtime: {
      onMessage: { addListener: jest.fn() },
      getURL: jest.fn(() => "")
    },
    webRequest: { onBeforeRedirect: { addListener: jest.fn() } },
    notifications: {
      onButtonClicked: { addListener: jest.fn() },
      onClicked: { addListener: jest.fn() },
      create: jest.fn()
    },
    storage: {
      local: {
        __values: {},
        get: jest.fn().mockImplementation(async function(keys) {
          if (keys === null) {
            return this.__values;
          }
          return keys.reduce((initial, key) => {
            initial[key] = this.__values[key];
            return initial;
          }, {});
        }),
        set: jest.fn().mockImplementation(async function(obj) {
          Object.assign(this.__values, obj);
        }),
        remove: jest.fn(async function(keys) {
          keys.forEach(key => {
            if (this.__values[key]) {
              delete this.__values[key];
            }
          });
        })
      }
    }
  };
};
