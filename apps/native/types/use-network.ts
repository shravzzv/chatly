export interface UseNetworkResult {
  /**
   * Indicates whether the device currently reports
   * internet connectivity.
   *
   * This reflects operating system network status and
   * should be treated as a best-effort signal rather
   * than a guarantee that all backend services are
   * reachable.
   */
  isOnline: boolean
}
