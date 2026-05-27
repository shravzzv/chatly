export interface UseNetworkResult {
  /**
   * Whether the browser currently reports internet connectivity.
   *
   * This reflects the browser's network status and updates in
   * response to the `online` and `offline` window events.
   *
   * Note: `true` does not guarantee backend availability —
   * the device may be connected to a network while external
   * services are still unreachable.
   */
  isOnline: boolean
}
