export const CMS_CONTENT_CHANGED_EVENT = "exocorpse:cms-content-changed";
const CMS_CONTENT_CHANNEL = "exocorpse-cms-content";

export function publishCmsContentChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(CMS_CONTENT_CHANGED_EVENT));

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CMS_CONTENT_CHANNEL);
    channel.postMessage({ type: CMS_CONTENT_CHANGED_EVENT });
    channel.close();
  }
}

export function subscribeToCmsContentChanges(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleWindowEvent = () => listener();
  window.addEventListener(CMS_CONTENT_CHANGED_EVENT, handleWindowEvent);

  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(CMS_CONTENT_CHANNEL)
      : null;
  const handleChannelMessage = (event: MessageEvent<unknown>) => {
    if (
      event.data &&
      typeof event.data === "object" &&
      "type" in event.data &&
      event.data.type === CMS_CONTENT_CHANGED_EVENT
    ) {
      listener();
    }
  };
  channel?.addEventListener("message", handleChannelMessage);

  return () => {
    window.removeEventListener(CMS_CONTENT_CHANGED_EVENT, handleWindowEvent);
    channel?.removeEventListener("message", handleChannelMessage);
    channel?.close();
  };
}
