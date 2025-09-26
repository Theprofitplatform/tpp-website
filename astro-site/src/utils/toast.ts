/**
 * Modern toast notification system
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  dismissible?: boolean;
}

class ToastManager {
  private container: HTMLElement | null = null;
  private toasts: Map<string, HTMLElement> = new Map();

  constructor() {
    this.init();
  }

  private init(): void {
    if (typeof document === 'undefined') return;

    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.getElementById('toast-container') as HTMLElement;
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.container);
        this.addStyles();
      }
    }
  }

  private addStyles(): void {
    if (document.getElementById('toast-styles')) return;

    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      #toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        pointer-events: none;
      }

      .toast {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 16px 20px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        pointer-events: auto;
        animation: slideIn 0.3s ease-out;
        transition: all 0.3s ease-out;
      }

      .toast.removing {
        animation: slideOut 0.3s ease-out;
        opacity: 0;
        transform: translateX(100%);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .toast-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }

      .toast-content {
        flex: 1;
        color: #1a1a1a;
        font-size: 14px;
        line-height: 1.5;
      }

      .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .toast-close:hover {
        color: #333;
      }

      .toast.success {
        border-left: 4px solid #10b981;
      }

      .toast.success .toast-icon {
        color: #10b981;
      }

      .toast.error {
        border-left: 4px solid #ef4444;
      }

      .toast.error .toast-icon {
        color: #ef4444;
      }

      .toast.warning {
        border-left: 4px solid #f59e0b;
      }

      .toast.warning .toast-icon {
        color: #f59e0b;
      }

      .toast.info {
        border-left: 4px solid #3b82f6;
      }

      .toast.info .toast-icon {
        color: #3b82f6;
      }

      /* Position variations */
      #toast-container.top-left {
        top: 20px;
        left: 20px;
        right: auto;
      }

      #toast-container.bottom-right {
        top: auto;
        bottom: 20px;
        right: 20px;
      }

      #toast-container.bottom-left {
        top: auto;
        bottom: 20px;
        left: 20px;
        right: auto;
      }

      #toast-container.top-center {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
      }

      #toast-container.bottom-center {
        top: auto;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        right: auto;
      }

      @media (max-width: 640px) {
        #toast-container {
          top: 10px;
          left: 10px;
          right: 10px;
        }

        .toast {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>`
    };
    return icons[type];
  }

  show(options: ToastOptions): string {
    this.init();

    const {
      message,
      type = 'info',
      duration = 4000,
      position = 'top-right',
      dismissible = true
    } = options;

    // Update container position
    if (this.container) {
      this.container.className = '';
      this.container.classList.add(position);
    }

    // Create toast element
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');

    toast.innerHTML = `
      <div class="toast-icon">${this.getIcon(type)}</div>
      <div class="toast-content">${message}</div>
      ${dismissible ? `
        <button class="toast-close" aria-label="Close notification">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      ` : ''}
    `;

    // Add to container
    if (this.container) {
      this.container.appendChild(toast);
      this.toasts.set(toastId, toast);
    }

    // Add close functionality if dismissible
    if (dismissible) {
      const closeBtn = toast.querySelector('.toast-close');
      closeBtn?.addEventListener('click', () => this.remove(toastId));
    }

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toastId), duration);
    }

    return toastId;
  }

  remove(toastId: string): void {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    toast.classList.add('removing');
    setTimeout(() => {
      toast.remove();
      this.toasts.delete(toastId);
    }, 300);
  }

  success(message: string, options?: Partial<ToastOptions>): string {
    return this.show({ ...options, message, type: 'success' });
  }

  error(message: string, options?: Partial<ToastOptions>): string {
    return this.show({ ...options, message, type: 'error' });
  }

  warning(message: string, options?: Partial<ToastOptions>): string {
    return this.show({ ...options, message, type: 'warning' });
  }

  info(message: string, options?: Partial<ToastOptions>): string {
    return this.show({ ...options, message, type: 'info' });
  }

  clear(): void {
    this.toasts.forEach((_, id) => this.remove(id));
  }
}

// Export singleton instance
export const toast = new ToastManager();

// Export for use in components
export default toast;