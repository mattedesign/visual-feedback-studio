
export interface TestResult {
  status: 'success' | 'error' | 'warning' | null;
  message: string;
  debugInfo: string;
}

export interface TestConfiguration {
  selectedConfig: any;
  testImageUrl: string;
  requestConfig: any;
}

export interface ErrorCategory {
  type: 'auth_error' | 'rate_limit' | 'network_error' | 'access_denied' | 'unknown_error';
  message: string;
  guidance: string;
}
