import { jest } from "@jest/globals";

export function createClientMocks() {
  const connect = jest.fn();
  const events = {};
  const transports = [];
  const log = { debug: jest.fn(), error: jest.fn() };
  class MockTransport {
    constructor(url, options) {
      this.url = url;
      this.options = options;
      transports.push(this);
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
      this.sequence = ++MockClient.sequence;
    }
    currentSequence() {
      return this.sequence;
    }
  }
  MockClient.sequence = 0;
  return { connect, events, log, transports, MockTransport, MockClient };
}
