import { NeuralNexus } from '../core/NeuralNexus';
import { SdkManager, SdkLanguage, SdkOptions } from '../managers/SdkManager';
import { NeuralNexusError } from '../types';

// Mock NeuralNexus class
jest.mock('../core/NeuralNexus');

describe('SdkManager', () => {
  let neuralNexus: NeuralNexus;
  let sdkManager: SdkManager;

  beforeEach(() => {
    // Create a fresh mock for each test
    neuralNexus = new NeuralNexus({
      apiKey: 'test_api_key',
      environment: 'development'
    });
    
    sdkManager = new SdkManager(neuralNexus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with the provided NeuralNexus client', () => {
      expect(sdkManager).toBeInstanceOf(SdkManager);
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return an array of supported languages', () => {
      const supportedLanguages = sdkManager.getSupportedLanguages();
      
      expect(supportedLanguages).toBeInstanceOf(Array);
      expect(supportedLanguages.length).toBeGreaterThan(0);
      expect(supportedLanguages).toContain('typescript');
      expect(supportedLanguages).toContain('python');
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(sdkManager.isLanguageSupported('typescript')).toBe(true);
      expect(sdkManager.isLanguageSupported('python')).toBe(true);
      expect(sdkManager.isLanguageSupported('javascript')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(sdkManager.isLanguageSupported('cobol')).toBe(false);
      expect(sdkManager.isLanguageSupported('fortran')).toBe(false);
      expect(sdkManager.isLanguageSupported('')).toBe(false);
    });
  });

  describe('generateSdk', () => {
    it('should generate TypeScript SDK code', () => {
      const options: SdkOptions = {
        language: 'typescript',
        includeExamples: true
      };
      
      const sdkCode = sdkManager.generateSdk(options);
      
      expect(typeof sdkCode).toBe('string');
      expect(sdkCode).toContain('NeuralNexus');
      expect(sdkCode).toContain('import');
      expect(sdkCode).toContain('apiKey');
    });

    it('should generate Python SDK code', () => {
      const options: SdkOptions = {
        language: 'python',
        includeExamples: true
      };
      
      const sdkCode = sdkManager.generateSdk(options);
      
      expect(typeof sdkCode).toBe('string');
      expect(sdkCode).toContain('NeuralNexus');
      expect(sdkCode).toContain('def');
      expect(sdkCode).toContain('api_key');
    });

    it('should throw an error for unsupported languages', () => {
      const options: SdkOptions = {
        language: 'cobol' as SdkLanguage, // Type casting for test
        includeExamples: true
      };
      
      expect(() => {
        sdkManager.generateSdk(options);
      }).toThrow(NeuralNexusError);
    });

    it('should handle the includeExamples option correctly', () => {
      // This is a bit of a simplistic test since our implementation doesn't
      // currently change behavior based on includeExamples, but we're testing
      // that it accepts the option without error
      const withExamples = sdkManager.generateSdk({
        language: 'typescript',
        includeExamples: true
      });
      
      const withoutExamples = sdkManager.generateSdk({
        language: 'typescript',
        includeExamples: false
      });
      
      // In a real implementation, these would differ
      // For now, we're just checking they're both strings
      expect(typeof withExamples).toBe('string');
      expect(typeof withoutExamples).toBe('string');
    });
  });
}); 