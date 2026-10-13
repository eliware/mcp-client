export function createClientFacade(client, lifecycleProperties) {
  let currentClient = client;
  const lifecycleKeys = new Set(Object.keys(lifecycleProperties));
  Object.defineProperties(client, lifecycleProperties);
  const facade = new Proxy(client, {
    get(target, key) {
      if (lifecycleKeys.has(key)) return Reflect.get(target, key, target);
      const value = Reflect.get(currentClient, key, currentClient);
      return typeof value === "function" && key !== "constructor"
        ? value.bind(currentClient)
        : value;
    },
    set(_target, key, value) {
      return Reflect.set(currentClient, key, value, currentClient);
    },
  });
  return { facade, update: (nextClient) => (currentClient = nextClient) };
}

export function createLifecycleFacade({ close, reconnect, getTransport }) {
  let facade;
  let updateClient;
  return (client) => {
    if (!updateClient) {
      const view = createClientFacade(client, {
        close: { value: close },
        disconnect: { value: close },
        reconnect: { value: reconnect },
        mcpConnection: {
          value: {
            get transport() {
              return getTransport();
            },
            close,
          },
        },
      });
      facade = view.facade;
      updateClient = view.update;
    } else updateClient(client);
    return facade;
  };
}
