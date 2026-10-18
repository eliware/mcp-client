import { expect, jest, test } from "@jest/globals";
import { createClientFacade, createLifecycleFacade } from "../../src/client/facade.mjs";

test("forwards client calls to the current SDK client", () => {
  class Client {
    constructor(value) {
      this.value = value;
    }
    read() {
      return this.value;
    }
  }
  const close = jest.fn();
  const { facade, update } = createClientFacade(new Client("first"), { close: { value: close } });
  expect(facade).toBeInstanceOf(Client);
  expect(facade.read()).toBe("first");
  update(new Client("second"));
  expect(facade.read()).toBe("second");
  facade.value = "updated";
  expect(facade.read()).toBe("updated");
  expect(facade.close).toBe(close);
});

test("keeps one lifecycle facade as SDK clients change", () => {
  class Client {
    constructor(value) {
      this.value = value;
    }
  }
  const close = jest.fn();
  let transport = { id: 1 };
  const attach = createLifecycleFacade({
    close,
    reconnect: jest.fn(),
    getTransport: () => transport,
  });
  const facade = attach(new Client("first"));
  transport = { id: 2 };
  expect(attach(new Client("second"))).toBe(facade);
  expect(facade.value).toBe("second");
  expect(facade.close).toBe(close);
  expect(facade.mcpConnection.transport).toBe(transport);
});
