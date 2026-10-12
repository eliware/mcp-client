import { jest } from "@jest/globals";

export function createClientMocks() {
  const connect = jest.fn();
  const events = {};
  const log = { debug: jest.fn(), error: jest.fn() };
  class MockTransport {
    constructor(url, options) {
      this.url = url;
      this.options = options;
    }
    on(event, fn) {
      events[event] = fn;
    }
    close = jest.fn();
  }
  class MockClient {
    constructor(info, options) {
      this.info = info;
      this.options = options;
      this.connect = connect;
    }
  }
  return { connect, events, log, MockTransport, MockClient };
}
