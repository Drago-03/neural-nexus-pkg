/**
 * Checks if the code is running in a Node.js environment
 * @returns true if running in Node.js, false if in browser
 */
export function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && 
    process.versions != null && 
    process.versions.node != null;
}

/**
 * Checks if the code is running in a browser environment
 * @returns true if running in browser, false if in Node.js
 */
export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Gets information about the current environment
 * @returns Object with environment details
 */
export function getEnvironmentInfo(): {
  isNode: boolean;
  isBrowser: boolean;
  nodeVersion?: string;
  userAgent?: string;
} {
  const isNode = isNodeEnvironment();
  const isBrowser = isBrowserEnvironment();
  
  return {
    isNode,
    isBrowser,
    nodeVersion: isNode ? process.versions.node : undefined,
    userAgent: isBrowser ? navigator.userAgent : undefined,
  };
} 