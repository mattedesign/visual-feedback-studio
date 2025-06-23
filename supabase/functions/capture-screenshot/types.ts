
export interface ScreenshotRequest {
  url: string;
  fullPage?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  deviceScaleFactor?: number;
  format?: 'png' | 'jpg' | 'webp';
  cache?: boolean;
  delay?: number;
}

export interface Viewport {
  width: number;
  height: number;
}
