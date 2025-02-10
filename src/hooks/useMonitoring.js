import { useEffect } from 'react';
import monitoringService from '../services/MonitoringService';

export const useMonitoring = () => {
  // Track page load performance
  useEffect(() => {
    const trackPageLoad = () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      monitoringService.trackPerformance({
        pageLoadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
        dnsTime: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
        ttfb: navigationTiming.responseStart - navigationTiming.requestStart
      });
    };

    window.addEventListener('load', trackPageLoad);
    return () => window.removeEventListener('load', trackPageLoad);
  }, []);

  return {
    trackTradeAttempt: (tradeData) => {
      monitoringService.trackUserAction('trade_attempt', tradeData);
    },
    trackTradeSuccess: (tradeData) => {
      monitoringService.logTradeExecution(tradeData);
    },
    trackError: (error, context) => {
      monitoringService.logError(error, context);
    },
    trackNetworkChange: (status) => {
      monitoringService.trackNetworkStatus(status);
    }
  };
}; 