/**
 * Application logger for development and debugging
 */

import { FEATURES } from '@/config/constants';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isDebugEnabled = FEATURES.debug;

  private log(level: LogLevel, message: string, data?: any) {
    if (!this.isDevelopment && level === 'debug') return;
    if (!this.isDebugEnabled && level === 'debug') return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    const styles = this.getStyles(level);
    
    console[level === 'debug' ? 'log' : level](
      `%c[${entry.level.toUpperCase()}]%c ${entry.message}`,
      styles.label,
      styles.message,
      data || ''
    );

    // In production, you could send errors to a logging service
    if (level === 'error' && !this.isDevelopment) {
      this.sendToLoggingService(entry);
    }
  }

  private getStyles(level: LogLevel) {
    const colors = {
      info: { label: 'background: #3b82f6; color: white', message: 'color: #3b82f6' },
      warn: { label: 'background: #f59e0b; color: white', message: 'color: #f59e0b' },
      error: { label: 'background: #ef4444; color: white', message: 'color: #ef4444' },
      debug: { label: 'background: #8b5cf6; color: white', message: 'color: #8b5cf6' },
    };
    return colors[level];
  }

  private sendToLoggingService(entry: LogEntry) {
    // Implement error tracking service integration here
    // e.g., Sentry, LogRocket, etc.
    // For now, just store in sessionStorage for debugging
    try {
      const logs = JSON.parse(sessionStorage.getItem('error-logs') || '[]');
      logs.push(entry);
      sessionStorage.setItem('error-logs', JSON.stringify(logs.slice(-10))); // Keep last 10 errors
    } catch (e) {
      // Ignore storage errors
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  // API request logger
  logRequest(method: string, url: string, data?: any) {
    this.debug(`API ${method.toUpperCase()} ${url}`, data);
  }

  // API response logger
  logResponse(method: string, url: string, status: number, data?: any) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'debug';
    this.log(level, `API ${method.toUpperCase()} ${url} - ${status}`, data);
  }
}

export const logger = new Logger();
