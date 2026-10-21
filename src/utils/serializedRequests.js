export function createSerializedRequestLoader(requestFunction) {
  let requestQueue = Promise.resolve();
  const pendingRequests = new Map();

  return (key) => {
    const requestKey = String(key);
    const pendingRequest = pendingRequests.get(requestKey);
    if (pendingRequest) return pendingRequest;

    const request = requestQueue.then(() => requestFunction(key));
    requestQueue = request.then(
      () => undefined,
      () => undefined
    );
    pendingRequests.set(requestKey, request);

    request.then(
      () => {
        if (pendingRequests.get(requestKey) === request) {
          pendingRequests.delete(requestKey);
        }
      },
      () => {
        if (pendingRequests.get(requestKey) === request) {
          pendingRequests.delete(requestKey);
        }
      }
    );

    return request;
  };
}
