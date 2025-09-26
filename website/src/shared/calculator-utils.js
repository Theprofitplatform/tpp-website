// Shared Calculator Utilities

class CalculatorUtils {
  // Number formatting utilities
  static formatCurrency(amount, currency = 'AUD') {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatNumber(number, decimals = 0) {
    return new Intl.NumberFormat('en-AU', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number);
  }

  static formatPercentage(value, decimals = 1) {
    return (value * 100).toFixed(decimals) + '%';
  }

  // Validation utilities
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  }

  // Animation utilities
  static animateValue(element, start, end, duration = 1000, formatter = null) {
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + (end - start) * easeOutQuart;

      element.textContent = formatter ? formatter(current) : Math.round(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Progress bar animation
  static animateProgressBar(element, percentage, duration = 1000) {
    element.style.width = '0%';
    setTimeout(() => {
      element.style.transition = `width ${duration}ms ease-out`;
      element.style.width = percentage + '%';
    }, 100);
  }

  // Chart color generation
  static generateChartColors(count) {
    const colors = [
      '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    if (count <= colors.length) {
      return colors.slice(0, count);
    }

    // Generate additional colors if needed
    const additional = [];
    for (let i = colors.length; i < count; i++) {
      const hue = (i * 137.5) % 360;
      additional.push(`hsl(${hue}, 70%, 50%)`);
    }

    return [...colors, ...additional];
  }

  // Local storage utilities
  static saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  static loadFromLocalStorage(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  }

  // Debounce utility
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  // Tab functionality
  static initializeTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const tabButtons = container.querySelectorAll('.tab-button');
    const tabContents = container.querySelectorAll('.tab-content');

    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        if (tabContents[index]) {
          tabContents[index].classList.add('active');
        }
      });
    });
  }

  // Form validation
  static validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required]');
    let isValid = true;
    const errors = [];

    inputs.forEach(input => {
      const value = input.value.trim();
      const fieldName = input.name || input.id || 'Unknown field';

      if (!value) {
        isValid = false;
        errors.push(`${fieldName} is required`);
        input.classList.add('error');
      } else {
        input.classList.remove('error');
      }

      // Specific validations
      if (input.type === 'email' && value && !this.validateEmail(value)) {
        isValid = false;
        errors.push(`${fieldName} must be a valid email`);
        input.classList.add('error');
      }

      if (input.type === 'number' && value) {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        if (!this.validateNumber(value, min, max)) {
          isValid = false;
          errors.push(`${fieldName} must be a valid number${min !== null ? ` >= ${min}` : ''}${max !== null ? ` <= ${max}` : ''}`);
          input.classList.add('error');
        }
      }
    });

    return { isValid, errors };
  }

  // Show notifications
  static showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} fade-in`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  // Generate PDF report
  static generatePDFReport(title, data) {
    // This would require a PDF library like jsPDF
    // For now, we'll create a downloadable text report
    const content = [
      `${title} Report`,
      '='.repeat(title.length + 7),
      `Generated on: ${new Date().toLocaleString()}`,
      '',
      ...Object.entries(data).map(([key, value]) => `${key}: ${value}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Share results
  static shareResults(title, data, url = window.location.href) {
    const text = `${title}\n${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n')}`;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
        this.showNotification('Results copied to clipboard!', 'success');
      });
    }
  }

  // SEO scoring algorithms
  static calculateSEOScore(metrics) {
    let score = 0;
    let maxScore = 0;

    // Page speed (20 points)
    maxScore += 20;
    if (metrics.pageSpeed >= 90) score += 20;
    else if (metrics.pageSpeed >= 70) score += 15;
    else if (metrics.pageSpeed >= 50) score += 10;
    else score += 5;

    // Meta tags (15 points)
    maxScore += 15;
    if (metrics.metaTags) {
      if (metrics.metaTags.title) score += 5;
      if (metrics.metaTags.description) score += 5;
      if (metrics.metaTags.keywords) score += 5;
    }

    // Content quality (20 points)
    maxScore += 20;
    if (metrics.wordCount >= 1000) score += 10;
    else if (metrics.wordCount >= 500) score += 7;
    else if (metrics.wordCount >= 300) score += 5;

    if (metrics.headingStructure) score += 10;

    // Mobile optimization (15 points)
    maxScore += 15;
    if (metrics.mobileOptimized) score += 15;
    else if (metrics.responsive) score += 10;

    // Technical SEO (15 points)
    maxScore += 15;
    if (metrics.sitemap) score += 3;
    if (metrics.robotsTxt) score += 3;
    if (metrics.sslCertificate) score += 3;
    if (metrics.structuredData) score += 3;
    if (metrics.xmlSitemap) score += 3;

    // Backlinks (15 points)
    maxScore += 15;
    if (metrics.backlinks >= 100) score += 15;
    else if (metrics.backlinks >= 50) score += 12;
    else if (metrics.backlinks >= 20) score += 8;
    else if (metrics.backlinks >= 5) score += 5;

    return Math.round((score / maxScore) * 100);
  }

  // Keyword difficulty calculation
  static calculateKeywordDifficulty(metrics) {
    let difficulty = 0;

    // Search volume impact (40%)
    if (metrics.searchVolume > 10000) difficulty += 40;
    else if (metrics.searchVolume > 1000) difficulty += 30;
    else if (metrics.searchVolume > 100) difficulty += 20;
    else difficulty += 10;

    // Competition level (30%)
    if (metrics.competition === 'high') difficulty += 30;
    else if (metrics.competition === 'medium') difficulty += 20;
    else difficulty += 10;

    // Domain authority of competitors (20%)
    if (metrics.competitorDA > 80) difficulty += 20;
    else if (metrics.competitorDA > 60) difficulty += 15;
    else if (metrics.competitorDA > 40) difficulty += 10;
    else difficulty += 5;

    // Content quality of competitors (10%)
    if (metrics.competitorContentQuality === 'high') difficulty += 10;
    else if (metrics.competitorContentQuality === 'medium') difficulty += 7;
    else difficulty += 3;

    return Math.min(difficulty, 100);
  }

  // ROI calculation utilities
  static calculateROI(investment, returns, timeframe = 12) {
    const totalReturns = returns * timeframe;
    const roi = ((totalReturns - investment) / investment) * 100;

    return {
      roi: roi,
      totalReturns: totalReturns,
      netProfit: totalReturns - investment,
      monthlyROI: roi / timeframe,
      paybackPeriod: investment / returns
    };
  }

  // Conversion rate optimization
  static calculateConversionImpact(currentRate, visits, improvement) {
    const newRate = currentRate * (1 + improvement / 100);
    const currentConversions = visits * (currentRate / 100);
    const newConversions = visits * (newRate / 100);

    return {
      currentConversions: Math.round(currentConversions),
      newConversions: Math.round(newConversions),
      additionalConversions: Math.round(newConversions - currentConversions),
      newRate: newRate.toFixed(2)
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculatorUtils;
} else {
  window.CalculatorUtils = CalculatorUtils;
}