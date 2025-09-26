/**
 * The Profit Platform Chatbot Integration Script
 * Easy integration for existing website pages
 * Simply include this script on any page to add the chatbot
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        // Chatbot behavior settings
        autoOpen: false,                    // Auto-open chatbot on page load
        autoOpenDelay: 0,                   // Delay before auto-opening (ms)
        showNotificationAfter: 10000,       // Show notification badge after (ms)
        proactiveMessageDelay: 30000,       // Show proactive message after (ms)

        // Appearance settings
        position: 'bottom-right',           // bottom-right, bottom-left, top-right, top-left
        theme: 'default',                   // default, dark, custom
        primaryColor: '#4F46E5',           // Brand color

        // Features
        enableFileUpload: true,             // Allow file attachments
        enableQuickActions: true,           // Show quick action buttons
        enableTypingIndicator: true,        // Show typing animation
        enableSounds: false,                // Enable notification sounds

        // Analytics
        enableAnalytics: true,              // Track chatbot interactions
        analyticsEndpoint: '/api/chatbot-analytics',  // Analytics API endpoint

        // API endpoints
        appointmentEndpoint: '/api/appointments',     // Appointment booking API
        chatEndpoint: '/api/chat',                    // Chat API (future AI backend)
    };

    class ChatbotIntegration {
        constructor() {
            this.isLoaded = false;
            this.chatbotInstance = null;
            this.loadChatbot();
        }

        loadChatbot() {
            if (this.isLoaded) return;

            // Create chatbot container
            this.createChatbotContainer();

            // Load required styles and scripts
            this.loadAssets().then(() => {
                this.initializeChatbot();
                this.isLoaded = true;
            });
        }

        createChatbotContainer() {
            const container = document.createElement('div');
            container.id = 'tpp-chatbot-container';
            container.innerHTML = this.getChatbotHTML();
            document.body.appendChild(container);

            // Apply position styles
            this.applyChatbotStyles(container);
        }

        applyChatbotStyles(container) {
            const positions = {
                'bottom-right': { bottom: '20px', right: '20px' },
                'bottom-left': { bottom: '20px', left: '20px' },
                'top-right': { top: '20px', right: '20px' },
                'top-left': { top: '20px', left: '20px' }
            };

            const position = positions[CONFIG.position] || positions['bottom-right'];

            Object.assign(container.style, {
                position: 'fixed',
                zIndex: '2000',
                ...position
            });

            // Apply custom theme colors if specified
            if (CONFIG.primaryColor !== '#4F46E5') {
                this.applyCustomColors();
            }
        }

        applyCustomColors() {
            const style = document.createElement('style');
            style.textContent = `
                :root {
                    --chatbot-primary-color: ${CONFIG.primaryColor} !important;
                }

                .chat-toggle {
                    background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${this.darkenColor(CONFIG.primaryColor, 20)}) !important;
                }

                .chat-header {
                    background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${this.darkenColor(CONFIG.primaryColor, 20)}) !important;
                }

                .send-btn {
                    background: ${CONFIG.primaryColor} !important;
                }

                .send-btn:hover {
                    background: ${this.darkenColor(CONFIG.primaryColor, 10)} !important;
                }

                .quick-action-btn:hover {
                    background: ${CONFIG.primaryColor} !important;
                    border-color: ${CONFIG.primaryColor} !important;
                }

                .btn-primary {
                    background: ${CONFIG.primaryColor} !important;
                }

                .btn-primary:hover {
                    background: ${this.darkenColor(CONFIG.primaryColor, 10)} !important;
                }
            `;
            document.head.appendChild(style);
        }

        darkenColor(color, percent) {
            const num = parseInt(color.replace("#", ""), 16);
            const amt = Math.round(2.55 * percent);
            const R = (num >> 16) + amt;
            const B = (num >> 8 & 0x00FF) + amt;
            const G = (num & 0x0000FF) + amt;
            return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
        }

        async loadAssets() {
            const baseUrl = this.getBaseUrl();

            // Load CSS
            await this.loadCSS(`${baseUrl}/src/chatbot/chatbot.css`);

            // Load main chatbot script
            await this.loadScript(`${baseUrl}/src/chatbot/chatbot.js`);
        }

        getBaseUrl() {
            // Try to determine base URL from script src
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src && script.src.includes('integration.js')) {
                    return script.src.replace('/src/chatbot/integration.js', '');
                }
            }

            // Fallback to current origin
            return window.location.origin;
        }

        loadCSS(href) {
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                link.onload = resolve;
                link.onerror = reject;
                document.head.appendChild(link);
            });
        }

        loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        initializeChatbot() {
            // Wait for ProfitPlatformChatbot class to be available
            const checkForChatbot = () => {
                if (typeof ProfitPlatformChatbot !== 'undefined') {
                    this.chatbotInstance = new ProfitPlatformChatbot();
                    this.applyConfiguration();
                } else {
                    setTimeout(checkForChatbot, 100);
                }
            };
            checkForChatbot();
        }

        applyConfiguration() {
            if (!this.chatbotInstance) return;

            // Apply configuration settings
            if (CONFIG.autoOpen) {
                setTimeout(() => {
                    this.chatbotInstance.openChat();
                }, CONFIG.autoOpenDelay);
            }

            // Override default timing if configured
            if (CONFIG.showNotificationAfter !== 10000) {
                this.chatbotInstance.showNotificationAfter = CONFIG.showNotificationAfter;
            }

            if (CONFIG.proactiveMessageDelay !== 30000) {
                this.chatbotInstance.proactiveMessageDelay = CONFIG.proactiveMessageDelay;
            }

            // Disable features if configured
            if (!CONFIG.enableFileUpload) {
                const attachBtn = document.getElementById('attach-btn');
                if (attachBtn) attachBtn.style.display = 'none';
            }

            if (!CONFIG.enableQuickActions) {
                const quickActions = document.getElementById('quick-actions');
                if (quickActions) quickActions.style.display = 'none';
            }

            // Override API endpoints
            if (this.chatbotInstance.submitAppointmentToBackend) {
                const originalSubmit = this.chatbotInstance.submitAppointmentToBackend.bind(this.chatbotInstance);
                this.chatbotInstance.submitAppointmentToBackend = async (data) => {
                    return await this.submitAppointment(data);
                };
            }

            if (this.chatbotInstance.sendAnalyticsEvent) {
                const originalAnalytics = this.chatbotInstance.sendAnalyticsEvent.bind(this.chatbotInstance);
                this.chatbotInstance.sendAnalyticsEvent = async (eventData) => {
                    return await this.sendAnalytics(eventData);
                };
            }
        }

        async submitAppointment(data) {
            try {
                const response = await fetch(CONFIG.appointmentEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...data,
                        source: 'chatbot',
                        page_url: window.location.href,
                        user_agent: navigator.userAgent,
                        timestamp: new Date().toISOString()
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('Appointment submission failed:', error);
                // Fallback: Store in localStorage for later sync
                this.storeOfflineAppointment(data);
                return { success: false, error: error.message };
            }
        }

        async sendAnalytics(eventData) {
            if (!CONFIG.enableAnalytics) return;

            try {
                await fetch(CONFIG.analyticsEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...eventData,
                        page_url: window.location.href,
                        page_title: document.title
                    })
                });
            } catch (error) {
                console.error('Analytics failed:', error);
            }
        }

        storeOfflineAppointment(data) {
            const offline = JSON.parse(localStorage.getItem('tpp_offline_appointments') || '[]');
            offline.push({
                ...data,
                timestamp: new Date().toISOString(),
                page_url: window.location.href
            });
            localStorage.setItem('tpp_offline_appointments', JSON.stringify(offline));
        }

        getChatbotHTML() {
            return `
                <!-- Chatbot Widget -->
                <div id="chatbot-widget" class="chatbot-widget">
                    <!-- Floating Chat Button -->
                    <div id="chat-toggle" class="chat-toggle" role="button" tabindex="0" aria-label="Open chat">
                        <i class="fas fa-comments"></i>
                        <span class="chat-badge" id="notification-badge">!</span>
                    </div>

                    <!-- Chat Container -->
                    <div id="chat-container" class="chat-container" role="dialog" aria-labelledby="chatbot-title">
                        <!-- Chat Header -->
                        <div class="chat-header">
                            <div class="chat-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="chat-title-section">
                                <h3 id="chatbot-title">The Profit Platform AI</h3>
                                <span class="chat-status">
                                    <span class="status-indicator online"></span>
                                    Online • Ready to help
                                </span>
                            </div>
                            <div class="chat-controls">
                                <button class="minimize-btn" id="minimize-chat" aria-label="Minimize chat">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <button class="close-btn" id="close-chat" aria-label="Close chat">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Chat Messages -->
                        <div class="chat-messages" id="chat-messages" role="log" aria-live="polite">
                            <div class="message bot-message welcome-message">
                                <div class="message-avatar">
                                    <i class="fas fa-robot"></i>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <p>👋 Welcome to The Profit Platform! I'm your AI assistant.</p>
                                        <p>I can help you with:</p>
                                        <ul>
                                            <li>🚀 Digital marketing strategies</li>
                                            <li>📊 SEO and Google Ads</li>
                                            <li>🎨 Web design solutions</li>
                                            <li>📅 Booking consultations</li>
                                            <li>❓ Any questions about our services</li>
                                        </ul>
                                        <p>How can I help you grow your business today?</p>
                                    </div>
                                    <div class="message-time">Just now</div>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="quick-actions" id="quick-actions">
                            <button class="quick-action-btn" data-action="services">
                                <i class="fas fa-cogs"></i>
                                Our Services
                            </button>
                            <button class="quick-action-btn" data-action="consultation">
                                <i class="fas fa-calendar-alt"></i>
                                Book Consultation
                            </button>
                            <button class="quick-action-btn" data-action="pricing">
                                <i class="fas fa-dollar-sign"></i>
                                Pricing
                            </button>
                            <button class="quick-action-btn" data-action="contact">
                                <i class="fas fa-phone"></i>
                                Contact Us
                            </button>
                        </div>

                        <!-- Chat Input -->
                        <div class="chat-input-container">
                            <div class="chat-input-wrapper">
                                <textarea
                                    id="chat-input"
                                    class="chat-input"
                                    placeholder="Type your message..."
                                    rows="1"
                                    aria-label="Type your message"
                                    maxlength="500"
                                ></textarea>
                                <div class="input-actions">
                                    <button id="attach-btn" class="action-btn" aria-label="Attach file" title="Attach file">
                                        <i class="fas fa-paperclip"></i>
                                    </button>
                                    <button id="send-btn" class="send-btn" aria-label="Send message" title="Send message">
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="input-footer">
                                <div class="typing-indicator" id="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    AI is typing...
                                </div>
                                <div class="char-counter" id="char-counter">0/500</div>
                            </div>
                        </div>

                        <!-- Powered by footer -->
                        <div class="chat-footer">
                            <div class="powered-by">
                                <span>Powered by</span>
                                <strong>The Profit Platform AI</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Appointment Booking Modal -->
                <div id="appointment-modal" class="modal" role="dialog" aria-labelledby="appointment-title" aria-hidden="true">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="appointment-title">Book Your Free Consultation</h3>
                            <button class="modal-close" aria-label="Close modal">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <form id="appointment-form">
                                <div class="form-group">
                                    <label for="client-name">Full Name *</label>
                                    <input type="text" id="client-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="client-email">Email Address *</label>
                                    <input type="email" id="client-email" name="email" required>
                                </div>
                                <div class="form-group">
                                    <label for="client-phone">Phone Number</label>
                                    <input type="tel" id="client-phone" name="phone">
                                </div>
                                <div class="form-group">
                                    <label for="client-company">Company/Website</label>
                                    <input type="text" id="client-company" name="company">
                                </div>
                                <div class="form-group">
                                    <label for="service-interest">Service Interest *</label>
                                    <select id="service-interest" name="service" required>
                                        <option value="">Select a service</option>
                                        <option value="seo">SEO Optimization</option>
                                        <option value="google-ads">Google Ads Management</option>
                                        <option value="web-design">Web Design</option>
                                        <option value="social-media">Social Media Marketing</option>
                                        <option value="content">Content Marketing</option>
                                        <option value="full-service">Full Digital Marketing</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="preferred-date">Preferred Date</label>
                                    <input type="date" id="preferred-date" name="date">
                                </div>
                                <div class="form-group">
                                    <label for="preferred-time">Preferred Time</label>
                                    <select id="preferred-time" name="time">
                                        <option value="">Select time</option>
                                        <option value="9:00">9:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="14:00">2:00 PM</option>
                                        <option value="15:00">3:00 PM</option>
                                        <option value="16:00">4:00 PM</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="message">Additional Details</label>
                                    <textarea id="message" name="message" rows="3" placeholder="Tell us about your business goals..."></textarea>
                                </div>
                                <div class="form-actions">
                                    <button type="button" class="btn-secondary" id="cancel-appointment">Cancel</button>
                                    <button type="submit" class="btn-primary">Book Consultation</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- File Input for attachments -->
                <input type="file" id="file-input" accept="image/*,application/pdf,.doc,.docx" style="display: none;">
            `;
        }
    }

    // Public API for external configuration
    window.TPPChatbot = {
        config: CONFIG,

        init: function(options = {}) {
            Object.assign(CONFIG, options);
            new ChatbotIntegration();
        },

        open: function() {
            if (window.profitPlatformChatbot) {
                window.profitPlatformChatbot.openChat();
            }
        },

        close: function() {
            if (window.profitPlatformChatbot) {
                window.profitPlatformChatbot.closeChat();
            }
        },

        sendMessage: function(message) {
            if (window.profitPlatformChatbot) {
                window.profitPlatformChatbot.addMessage('user', message);
                window.profitPlatformChatbot.processMessage(message).then(response => {
                    window.profitPlatformChatbot.addMessage('bot', response);
                });
            }
        }
    };

    // Auto-initialize if not configured otherwise
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.TPPChatbot.init();
        });
    } else {
        window.TPPChatbot.init();
    }

})();