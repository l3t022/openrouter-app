import { describe, it, expect } from 'vitest';
import { 
  ChatRequestSchema, 
  safeValidateChatRequest,
  validateChatRequest 
} from '@/lib/validations';

describe('ChatRequestSchema', () => {
  it('should validate a correct chat request', () => {
    const validRequest = {
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' }
      ],
      model: 'openrouter/free',
      apiKey: 'sk-or-v1-1234567890',
    };

    const result = safeValidateChatRequest(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages).toHaveLength(2);
      expect(result.data.model).toBe('openrouter/free');
    }
  });

  it('should reject request without apiKey', () => {
    const invalidRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
    };

    const result = safeValidateChatRequest(invalidRequest);
    expect(result.success).toBe(false);
    if (!result.success) {
      const apiKeyError = result.error.errors.find(e => e.path.includes('apiKey'));
      expect(apiKeyError).toBeDefined();
    }
  });

  it('should reject request with empty messages', () => {
    const invalidRequest = {
      messages: [],
      apiKey: 'sk-or-v1-1234567890',
    };

    const result = safeValidateChatRequest(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject request with invalid role', () => {
    const invalidRequest = {
      messages: [{ role: 'invalid', content: 'Hello' }],
      apiKey: 'sk-or-v1-1234567890',
    };

    const result = safeValidateChatRequest(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject request with non-string content', () => {
    const invalidRequest = {
      messages: [{ role: 'user', content: 123 }],
      apiKey: 'sk-or-v1-1234567890',
    };

    const result = safeValidateChatRequest(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should throw on invalid input when using validateChatRequest', () => {
    expect(() => validateChatRequest({})).toThrow();
  });

  it('should handle optional model field', () => {
    const validRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      apiKey: 'sk-or-v1-1234567890',
    };

    const result = safeValidateChatRequest(validRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.model).toBeUndefined();
    }
  });
});