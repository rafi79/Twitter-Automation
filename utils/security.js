// Security utilities for API key and credential management

// Encrypt sensitive data (basic client-side obfuscation)
export function obfuscateCredentials(credentials) {
  if (typeof window === 'undefined') return credentials; // Server-side, no obfuscation needed
  
  const encoded = btoa(JSON.stringify(credentials));
  return encoded;
}

// Decrypt sensitive data
export function deobfuscateCredentials(encoded) {
  if (typeof window === 'undefined') return encoded; // Server-side
  
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode credentials:', error);
    return null;
  }
}

// Validate environment setup
export function validateEnvironment() {
  const requiredEnvVars = ['GEMINI_API_KEY'];
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    return false;
  }
  
  return true;
}

// Sanitize user input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/script/gi, '') // Remove script tags
    .slice(0, 1000); // Limit length
}

// Generate secure headers for API requests
export function getSecureHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
  };
}

// Rate limiting helper (simple client-side)
const rateLimiter = new Map();

export function checkRateLimit(endpoint, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const key = endpoint;
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, []);
  }
  
  const requests = rateLimiter.get(key);
  
  // Remove old requests outside the window
  while (requests.length > 0 && now - requests[0] > windowMs) {
    requests.shift();
  }
  
  // Check if we're over the limit
  if (requests.length >= maxRequests) {
    return false;
  }
  
  // Add this request
  requests.push(now);
  return true;
}

// Secure local storage wrapper
export const secureStorage = {
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    
    try {
      const encrypted = obfuscateCredentials(value);
      sessionStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },
  
  get: (key) => {
    if (typeof window === 'undefined') return null;
    
    try {
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      
      return deobfuscateCredentials(encrypted);
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove data:', error);
    }
  }
};

// Environment-specific configurations
export const config = {
  development: {
    apiTimeout: 30000,
    maxRetries: 3,
    enableLogging: true,
  },
  production: {
    apiTimeout: 60000,
    maxRetries: 5,
    enableLogging: false,
  }
};

export function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  return config[env] || config.development;
}
