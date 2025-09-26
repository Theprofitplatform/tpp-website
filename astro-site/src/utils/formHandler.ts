/**
 * Form submission handler with loading states and error handling
 */

import { toast } from './toast';

export interface FormData {
  [key: string]: any;
}

export interface FormHandlerOptions {
  endpoint?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  validateFields?: boolean;
  resetOnSuccess?: boolean;
  showToast?: boolean;
}

export class FormHandler {
  private form: HTMLFormElement;
  private submitButton: HTMLButtonElement | null;
  private originalButtonText: string = '';
  private isSubmitting: boolean = false;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.submitButton = form.querySelector('button[type="submit"]');
    if (this.submitButton) {
      this.originalButtonText = this.submitButton.textContent || 'Submit';
    }
  }

  /**
   * Handle form submission with loading states
   */
  async submit(options: FormHandlerOptions = {}): Promise<void> {
    const {
      endpoint = '/api/contact',
      method = 'POST',
      headers = {},
      onSuccess,
      onError,
      validateFields = true,
      resetOnSuccess = true,
      showToast = true
    } = options;

    // Prevent double submission
    if (this.isSubmitting) return;

    // Validate form
    if (validateFields && !this.validateForm()) {
      return;
    }

    // Set loading state
    this.setLoadingState(true);

    try {
      // Get form data
      const formData = this.getFormData();

      // Make API request
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Failed to submit form: ${response.statusText}`);
      }

      const data = await response.json();

      // Success handling
      if (showToast) {
        toast.success('Form submitted successfully!');
      }

      if (resetOnSuccess) {
        this.form.reset();
      }

      if (onSuccess) {
        onSuccess(data);
      }

      // Track conversion
      this.trackConversion('form_submission', formData);

    } catch (error) {
      // Error handling
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      if (showToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(error as Error);
      }

      console.error('Form submission error:', error);
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Get form data as object
   */
  private getFormData(): FormData {
    const formData = new FormData(this.form);
    const data: FormData = {};

    // Convert FormData to plain object
    formData.forEach((value, key) => {
      // Handle multiple values (checkboxes, multi-select)
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    // Add metadata
    data.timestamp = new Date().toISOString();
    data.url = window.location.href;
    data.referrer = document.referrer;

    // Remove honeypot field if present
    delete data.honeypot;
    delete data.website; // Common honeypot field names

    return data;
  }

  /**
   * Validate form fields
   */
  private validateForm(): boolean {
    const requiredFields = this.form.querySelectorAll('[required]');
    let isValid = true;
    const errors: string[] = [];

    requiredFields.forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        const value = field.value.trim();

        // Remove previous error state
        field.classList.remove('error');
        const errorElement = field.parentElement?.querySelector('.field-error');
        if (errorElement) {
          errorElement.remove();
        }

        // Check if empty
        if (!value) {
          isValid = false;
          field.classList.add('error');
          this.showFieldError(field, 'This field is required');
          errors.push(`${field.name || 'Field'} is required`);
        }

        // Email validation
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            field.classList.add('error');
            this.showFieldError(field, 'Please enter a valid email address');
            errors.push('Invalid email address');
          }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            isValid = false;
            field.classList.add('error');
            this.showFieldError(field, 'Please enter a valid phone number');
            errors.push('Invalid phone number');
          }
        }
      }
    });

    // Check honeypot (should be empty)
    const honeypot = this.form.querySelector('[name="honeypot"], [name="website"]') as HTMLInputElement;
    if (honeypot && honeypot.value) {
      isValid = false;
      console.warn('Honeypot field filled - possible bot submission');
    }

    // Show toast with first error
    if (!isValid && errors.length > 0) {
      toast.error(errors[0]);
    }

    return isValid;
  }

  /**
   * Show field-specific error message
   */
  private showFieldError(field: HTMLElement, message: string): void {
    const errorElement = document.createElement('span');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    `;
    field.parentElement?.appendChild(errorElement);
  }

  /**
   * Set loading state on submit button
   */
  private setLoadingState(loading: boolean): void {
    this.isSubmitting = loading;

    if (this.submitButton) {
      this.submitButton.disabled = loading;

      if (loading) {
        this.submitButton.innerHTML = `
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Submitting...
        `;
      } else {
        this.submitButton.textContent = this.originalButtonText;
      }
    }

    // Disable all form inputs while loading
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement) {
        input.disabled = loading;
      }
    });
  }

  /**
   * Track form conversion
   */
  private trackConversion(event: string, data: FormData): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, {
        form_name: this.form.id || 'contact_form',
        form_data: data
      });
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead', {
        content_name: 'Contact Form',
        value: 0,
        currency: 'AUD'
      });
    }

    // Custom tracking endpoint
    fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        data,
        timestamp: new Date().toISOString()
      })
    }).catch(err => console.error('Tracking error:', err));
  }
}

/**
 * Initialize form handler for a form element
 */
export function initFormHandler(
  formSelector: string,
  options?: FormHandlerOptions
): FormHandler | null {
  const form = document.querySelector(formSelector) as HTMLFormElement;

  if (!form) {
    console.error(`Form not found: ${formSelector}`);
    return null;
  }

  const handler = new FormHandler(form);

  // Add submit event listener
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handler.submit(options);
  });

  return handler;
}

/**
 * Mock API endpoint for development
 */
export async function mockSubmitForm(data: FormData): Promise<any> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate random success/failure
  if (Math.random() > 0.8) {
    throw new Error('Network error - please try again');
  }

  return {
    success: true,
    message: 'Form submitted successfully',
    id: `submission_${Date.now()}`,
    data
  };
}