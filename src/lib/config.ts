import { logger } from './logger';

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    description: string;
    url: string;
  };
  features: {
    analytics: boolean;
    errorReporting: boolean;
    offlineSupport: boolean;
  };
  development: {
    showDevTools: boolean;
    logLevel: string;
  };
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

function validateEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return import.meta.env[name] || defaultValue;
}

function getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
  const value = import.meta.env[name];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

// Validate required environment variables
function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(name => !import.meta.env[name]);
  
  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
}

// Initialize configuration
let config: AppConfig;

try {
  validateEnvironment();
  
  config = {
    supabase: {
      url: validateEnvVar('VITE_SUPABASE_URL'),
      anonKey: validateEnvVar('VITE_SUPABASE_ANON_KEY'),
    },
    app: {
      name: getOptionalEnvVar('VITE_APP_NAME', 'Future Resume'),
      description: getOptionalEnvVar('VITE_APP_DESCRIPTION', 'AI-powered resume builder'),
      url: getOptionalEnvVar('VITE_APP_URL', window.location.origin),
    },
    features: {
      analytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
      errorReporting: getBooleanEnvVar('VITE_ENABLE_ERROR_REPORTING', false),
      offlineSupport: getBooleanEnvVar('VITE_ENABLE_OFFLINE_SUPPORT', true),
    },
    development: {
      showDevTools: getBooleanEnvVar('VITE_SHOW_DEV_TOOLS', import.meta.env.DEV),
      logLevel: getOptionalEnvVar('VITE_LOG_LEVEL', import.meta.env.DEV ? 'debug' : 'error'),
    },
  };

  logger.debug('Application configuration loaded:', {
    supabaseUrl: config.supabase.url,
    appName: config.app.name,
    features: config.features,
  });

} catch (error) {
  // Fallback configuration for development
  if (import.meta.env.DEV) {
    logger.warn('Using fallback configuration for development');
    config = {
      supabase: {
        url: 'https://whfmypoeliexhdoiyvkv.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoZm15cG9lbGlleGhkb2l5dmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTgwMzksImV4cCI6MjA3MTAzNDAzOX0.T23kr94lHF5Irrj5Kqeft4aT-kEiE5mj7IgHM1vPAH0',
      },
      app: {
        name: 'Future Resume',
        description: 'AI-powered resume builder',
        url: window.location.origin,
      },
      features: {
        analytics: false,
        errorReporting: false,
        offlineSupport: true,
      },
      development: {
        showDevTools: true,
        logLevel: 'debug',
      },
    };
  } else {
    throw error;
  }
}

export { config };

// Helper functions
export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const getSupabaseConfig = () => config.supabase;
export const getAppConfig = () => config.app;
export const getFeatureFlags = () => config.features;
export const getDevelopmentConfig = () => config.development;