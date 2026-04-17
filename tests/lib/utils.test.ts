import { describe, it, expect } from 'vitest';
import { formatPrice, isFreeModel, isVisionModel, isCodingModel, generateId, debounce } from '@/lib/utils';

describe('formatPrice', () => {
  it('should return "Free" for zero price', () => {
    expect(formatPrice('0')).toBe('Free');
    expect(formatPrice('0.0')).toBe('Free');
  });

  it('should format price correctly', () => {
    expect(formatPrice('0.00001')).toBe('$10.00');
    expect(formatPrice('0.000001')).toBe('$1.00');
    expect(formatPrice('0.0000001')).toBe('$0.10');
  });
});

describe('isFreeModel', () => {
  it('should return true for free models', () => {
    expect(isFreeModel({ pricing: { prompt: '0', completion: '0' } })).toBe(true);
    expect(isFreeModel({ pricing: { prompt: '0.0', completion: '0.0' } })).toBe(true);
  });

  it('should return false for paid models', () => {
    expect(isFreeModel({ pricing: { prompt: '0.00001', completion: '0' } })).toBe(false);
  });
});

describe('isVisionModel', () => {
  it('should detect vision models by pricing', () => {
    expect(isVisionModel({ id: 'test', name: 'Test', pricing: { image: '0.0001' } })).toBe(true);
  });

  it('should detect vision models by name', () => {
    expect(isVisionModel({ id: 'test', name: 'GPT-4 Vision' })).toBe(true);
  });

  it('should detect vision models by id', () => {
    expect(isVisionModel({ id: 'gpt-4-vision', name: 'Test' })).toBe(true);
  });
});

describe('isCodingModel', () => {
  it('should detect coding models by name', () => {
    expect(isCodingModel({ id: 'test', name: 'Code Llama' })).toBe(true);
    expect(isCodingModel({ id: 'test', name: 'DeepSeek Coder' })).toBe(true);
  });

  it('should detect coding models by id', () => {
    expect(isCodingModel({ id: 'code llama', name: 'Test' })).toBe(true);
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    let callCount = 0;
    const fn = debounce(() => callCount++, 100);
    
    fn();
    fn();
    fn();
    
    expect(callCount).toBe(0);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(callCount).toBe(1);
  });
});