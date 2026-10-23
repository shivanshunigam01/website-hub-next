/** Removed local debug ingest — was POSTing to 127.0.0.1:7651 in some builds. */
export function debugGtLog(
  _hypothesisId: string,
  _location: string,
  _message: string,
  _data?: Record<string, unknown>,
) {
  /* no-op */
}

export function gtDomSnapshot() {
  return {};
}
