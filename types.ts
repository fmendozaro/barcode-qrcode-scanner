export interface ScannedItem {
  id: string;
  rawValue: string;
  format: string;
  timestamp: number;
  aiAnalysis?: AIAnalysisResult;
  loading?: boolean;
}

export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  priceEstimate?: string;
  actionableType: 'PRODUCT' | 'URL' | 'TEXT' | 'WIFI' | 'UNKNOWN';
  safetyRating?: string;
}

export interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Native BarcodeDetector API types (experimental in some browsers)
export interface BarcodeDetectorOptions {
  formats?: string[];
}

export interface DetectedBarcode {
  boundingBox: DOMRectReadOnly;
  cornerPoints: { x: number; y: number }[];
  format: string;
  rawValue: string;
}

declare global {
  interface Window {
    BarcodeDetector: {
      new (options?: BarcodeDetectorOptions): any;
      getSupportedFormats(): Promise<string[]>;
    };
  }
}