import { JSDOM } from "jsdom";
export const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  Element: dom.window.Element,
  Node: dom.window.Node,
  Event: dom.window.Event,
  MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: (callback: FrameRequestCallback) =>
    setTimeout(callback, 0),
  cancelAnimationFrame: clearTimeout,
  ResizeObserver: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.assign(dom.window.Range.prototype, {
  getClientRects: () => [],
  getBoundingClientRect: () => new dom.window.DOMRect(),
});
const { render, cleanup, waitFor, fireEvent } =
  await import("@testing-library/react");
const { default: userEvent } = await import("@testing-library/user-event");

export { render, cleanup, waitFor, fireEvent, userEvent };
