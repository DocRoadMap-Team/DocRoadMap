import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

window.HTMLElement.prototype.scrollIntoView = jest.fn();

(global as any).chrome = {
  storage: {
    local: {
      set: jest.fn((_data, callback) => {
        if (callback) callback();
      }),
    },
  },
};
