/**
 * The Profit Platform - AI Chatbot System
 * Professional AI-powered chatbot with lead qualification and appointment booking
 * Created for theprofitplatform.com.au
 */

class ProfitPlatformChatbot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.conversationHistory = [];
        this.userProfile = {
            name: null,
            email: null,
            phone: null,
            company: null,
            interests: [],
            leadScore: 0,
            stage: 'initial' // initial, qualified, interested, booked
        };
        this.currentContext = null;

        // AI Response Templates and Knowledge Base
        this.knowledgeBase = {
            services: {
                seo: {
                    name: 'SEO Optimization',
                    description: 'Professional SEO services to boost your Google rankings and organic traffic',
                    benefits: ['Higher Google rankings', 'More organic traffic', 'Better ROI', 'Local SEO optimization'],
                    pricing: 'Starting from $799/month',
                    timeline: '3-6 months for significant results'
                },
                googleAds: {
                    name: 'Google Ads Management',
                    description: 'Expert Google Ads campaigns that convert visitors into customers',
                    benefits: ['Immediate visibility', 'Targeted traffic', 'Measurable ROI', 'Professional management'],
                    pricing: 'Starting from $599/month + ad spend',
                    timeline: 'Results within 1-2 weeks'
                },
                webDesign: {
                    name: 'Web Design & Development',
                    description: 'Modern, mobile-responsive websites that convert visitors into customers',
                    benefits: ['Professional design', 'Mobile optimized', 'Fast loading', 'SEO ready'],
                    pricing: 'Starting from $2,999',
                    timeline: '2-4 weeks delivery'
                },
                socialMedia: {
                    name: 'Social Media Marketing',
                    description: 'Engaging social media strategies to build your brand and attract customers',
                    benefits: ['Brand awareness', 'Audience engagement', 'Lead generation', 'Content creation'],
                    pricing: 'Starting from $499/month',
                    timeline: 'Ongoing monthly service'
                },
                content: {
                    name: 'Content Marketing',
                    description: 'Strategic content creation to establish authority and attract ideal customers',
                    benefits: ['Thought leadership', 'SEO benefits', 'Audience education', 'Trust building'],
                    pricing: 'Starting from $399/month',
                    timeline: 'Ongoing content strategy'
                }
            },
            faqs: {
                pricing: {
                    question: "What are your pricing packages?",
                    answer: "Our pricing varies by service:\n• SEO: From $799/month\n• Google Ads: From $599/month + ad spend\n• Web Design: From $2,999 (one-time)\n• Social Media: From $499/month\n• Content Marketing: From $399/month\n\nWe also offer custom packages combining multiple services for better value. Would you like me to book a free consultation to discuss your specific needs?"
                },
                timeline: {
                    question: "How long does it take to see results?",
                    answer: "Results timeline varies by service:\n• Google Ads: 1-2 weeks for initial results\n• Web Design: 2-4 weeks for completion\n• SEO: 3-6 months for significant rankings\n• Social Media: 2-4 weeks for engagement growth\n• Content Marketing: 1-3 months for traction\n\nWe provide regular progress reports to keep you informed!"
                },
                location: {
                    question: "Do you work with businesses outside Sydney?",
                    answer: "While we're based in Sydney and specialize in the Australian market, we work with businesses across Australia and internationally. Our digital marketing services are effective regardless of location, though we have particular expertise in the Sydney, Melbourne, Brisbane, and Perth markets."
                },
                experience: {
                    question: "How experienced is your team?",
                    answer: "Despite being founded in 2024, our team brings years of combined experience from leading agencies. We've already helped 15+ clients achieve an average of 3x increase in leads. Our fresh approach combined with proven strategies delivers exceptional results."
                },
                guarantee: {
                    question: "Do you offer any guarantees?",
                    answer: "We're so confident in our services that we offer:\n• 30-day money-back guarantee for new clients\n• No long-term contracts (month-to-month)\n• Transparent reporting and regular check-ins\n• Free strategy session to ensure we're the right fit\n\nYour success is our priority!"
                }
            },
            leadQualification: {
                businessSize: {
                    question: "What size is your business?",
                    options: ["Solo entrepreneur", "2-10 employees", "11-50 employees", "50+ employees"],
                    scoring: [1, 3, 5, 4]
                },
                budget: {
                    question: "What's your monthly marketing budget?",
                    options: ["Under $1,000", "$1,000-$2,500", "$2,500-$5,000", "$5,000-$10,000", "Over $10,000"],
                    scoring: [1, 3, 4, 5, 5]
                },
                urgency: {
                    question: "How soon do you need to get started?",
                    options: ["Just exploring", "Within 3 months", "Within 1 month", "ASAP"],
                    scoring: [1, 2, 4, 5]
                },
                currentMarketing: {
                    question: "What marketing are you currently doing?",
                    options: ["None", "DIY/Basic", "Working with another agency", "Have internal team"],
                    scoring: [2, 3, 4, 3]
                }
            }
        };

        this.responses = {
            greetings: [
                "Hi there! 👋 I'm the AI assistant for The Profit Platform. How can I help you grow your business today?",
                "Hello! Welcome to The Profit Platform. I'm here to help you with digital marketing questions. What brings you here today?",
                "Hey! I'm your AI marketing assistant. Whether you need SEO, Google Ads, or web design help, I'm here for you!"
            ],
            serviceInquiry: [
                "Great question! Let me tell you about our services.",
                "I'd be happy to explain our offerings!",
                "Perfect! Here's what we can do for your business:"
            ],
            leadQualification: [
                "To provide the best recommendations, I'd love to learn more about your business.",
                "Let me ask a few quick questions to better understand your needs.",
                "Great! A few questions will help me suggest the best solutions for you."
            ],
            appointment: [
                "Excellent! I'd love to set up a free consultation for you.",
                "Perfect timing! Let's book your free strategy session.",
                "Great choice! Our free consultation will help create a custom strategy for your business."
            ]
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadUserProfile();
        this.startWelcomeSequence();
        this.initializeAnalytics();
    }

    bindEvents() {
        // Chat toggle
        document.getElementById('chat-toggle').addEventListener('click', () => this.toggleChat());
        document.getElementById('chat-toggle').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleChat();
            }
        });

        // Chat controls
        document.getElementById('minimize-chat').addEventListener('click', () => this.minimizeChat());
        document.getElementById('close-chat').addEventListener('click', () => this.closeChat());

        // Message input
        const chatInput = document.getElementById('chat-input');
        chatInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        chatInput.addEventListener('input', () => this.handleInputChange());

        // Send button
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.dataset.action));
        });

        // File upload
        document.getElementById('attach-btn').addEventListener('click', () => this.handleFileUpload());
        document.getElementById('file-input').addEventListener('change', (e) => this.processFileUpload(e));

        // Appointment modal
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-appointment').addEventListener('click', () => this.closeModal());
        document.getElementById('appointment-form').addEventListener('submit', (e) => this.handleAppointmentSubmission(e));

        // Click outside modal to close
        document.getElementById('appointment-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (document.getElementById('appointment-modal').classList.contains('active')) {
                    this.closeModal();
                } else if (this.isOpen) {
                    this.closeChat();
                }
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.isMinimized = false;
        document.getElementById('chat-container').classList.add('open');
        document.getElementById('chat-container').classList.remove('minimized');
        document.getElementById('notification-badge').classList.add('hidden');
        this.focusChatInput();
        this.trackEvent('chat_opened');
    }

    closeChat() {
        this.isOpen = false;
        this.isMinimized = false;
        document.getElementById('chat-container').classList.remove('open', 'minimized');
        this.trackEvent('chat_closed');
    }

    minimizeChat() {
        this.isMinimized = !this.isMinimized;
        document.getElementById('chat-container').classList.toggle('minimized', this.isMinimized);
        if (!this.isMinimized) {
            this.focusChatInput();
        }
        this.trackEvent('chat_minimized', { minimized: this.isMinimized });
    }

    focusChatInput() {
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) {
                input.focus();
            }
        }, 100);
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputChange() {
        const input = document.getElementById('chat-input');
        const counter = document.getElementById('char-counter');
        const currentLength = input.value.length;

        counter.textContent = `${currentLength}/500`;

        if (currentLength > 400) {
            counter.classList.add('warning');
        } else {
            counter.classList.remove('warning');
        }

        if (currentLength >= 500) {
            counter.classList.add('error');
        } else {
            counter.classList.remove('error');
        }

        // Auto-resize textarea
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';

        // Enable/disable send button
        const sendBtn = document.getElementById('send-btn');
        sendBtn.disabled = currentLength === 0;
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';
        this.handleInputChange();

        // Show typing indicator
        this.showTypingIndicator();

        // Process message and generate response
        setTimeout(async () => {
            const response = await this.processMessage(message);
            this.hideTypingIndicator();

            if (typeof response === 'string') {
                this.addMessage('bot', response);
            } else if (response.type === 'multiple') {
                for (const msg of response.messages) {
                    await this.delay(800);
                    this.addMessage('bot', msg);
                }
            } else if (response.type === 'action') {
                this.addMessage('bot', response.message);
                if (response.action === 'openAppointmentModal') {
                    setTimeout(() => this.openAppointmentModal(), 1000);
                } else if (response.action === 'leadQualification') {
                    setTimeout(() => this.startLeadQualification(), 1000);
                }
            }

            this.trackEvent('message_sent', { message_type: 'user', content_length: message.length });
            this.trackEvent('bot_response', { response_type: typeof response === 'string' ? 'simple' : response.type });
        }, this.getTypingDelay(message));
    }

    addMessage(sender, content, options = {}) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;

        const avatarElement = document.createElement('div');
        avatarElement.className = 'message-avatar';
        avatarElement.innerHTML = sender === 'user'
            ? '<i class="fas fa-user"></i>'
            : '<i class="fas fa-robot"></i>';

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';

        const bubbleElement = document.createElement('div');
        bubbleElement.className = 'message-bubble';

        if (typeof content === 'string') {
            bubbleElement.innerHTML = this.formatMessage(content);
        } else {
            bubbleElement.appendChild(content);
        }

        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = this.formatTime(new Date());

        contentElement.appendChild(bubbleElement);
        contentElement.appendChild(timeElement);

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in conversation history
        this.conversationHistory.push({
            sender,
            content: typeof content === 'string' ? content : content.textContent || '',
            timestamp: new Date(),
            ...options
        });

        // Animate message appearance
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
            messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 50);
    }

    formatMessage(message) {
        // Convert line breaks and format text
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    showTypingIndicator() {
        document.getElementById('typing-indicator').classList.add('active');
    }

    hideTypingIndicator() {
        document.getElementById('typing-indicator').classList.remove('active');
    }

    getTypingDelay(message) {
        // Simulate realistic typing delay based on message length
        return Math.min(Math.max(message.length * 20, 1000), 3000);
    }

    async processMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Extract user information from messages
        this.extractUserInfo(message);

        // Intent classification
        if (this.isGreeting(lowerMessage)) {
            return this.getRandomResponse('greetings');
        }

        if (this.isServiceInquiry(lowerMessage)) {
            return this.handleServiceInquiry(lowerMessage);
        }

        if (this.isPricingInquiry(lowerMessage)) {
            return this.knowledgeBase.faqs.pricing.answer;
        }

        if (this.isAppointmentRequest(lowerMessage)) {
            return {
                type: 'action',
                message: this.getRandomResponse('appointment'),
                action: 'openAppointmentModal'
            };
        }

        if (this.isFAQ(lowerMessage)) {
            return this.handleFAQ(lowerMessage);
        }

        // Check if we should start lead qualification
        if (this.shouldStartLeadQualification()) {
            return {
                type: 'action',
                message: this.getRandomResponse('leadQualification'),
                action: 'leadQualification'
            };
        }

        // Default intelligent response
        return this.generateIntelligentResponse(message);
    }

    isGreeting(message) {
        const greetingPatterns = [
            /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i,
            /\b(greetings|howdy|what's up|whats up)\b/i
        ];
        return greetingPatterns.some(pattern => pattern.test(message));
    }

    isServiceInquiry(message) {
        const servicePatterns = [
            /\b(services|seo|google ads|web design|marketing|social media)\b/i,
            /\b(what do you do|help with|offer|provide)\b/i
        ];
        return servicePatterns.some(pattern => pattern.test(message));
    }

    isPricingInquiry(message) {
        const pricingPatterns = [
            /\b(price|pricing|cost|how much|rates|packages|budget)\b/i
        ];
        return pricingPatterns.some(pattern => pattern.test(message));
    }

    isAppointmentRequest(message) {
        const appointmentPatterns = [
            /\b(book|schedule|appointment|consultation|meeting|call)\b/i,
            /\b(talk to|speak with|discuss|free consultation)\b/i
        ];
        return appointmentPatterns.some(pattern => pattern.test(message));
    }

    isFAQ(message) {
        const faqPatterns = [
            /\b(how long|timeline|results|guarantee|experience|location)\b/i
        ];
        return faqPatterns.some(pattern => pattern.test(message));
    }

    handleServiceInquiry(message) {
        const services = [];

        if (/seo/i.test(message)) services.push('seo');
        if (/google ads|ppc|paid/i.test(message)) services.push('googleAds');
        if (/web design|website/i.test(message)) services.push('webDesign');
        if (/social media/i.test(message)) services.push('socialMedia');
        if (/content/i.test(message)) services.push('content');

        if (services.length === 1) {
            const service = this.knowledgeBase.services[services[0]];
            return {
                type: 'multiple',
                messages: [
                    `Great choice! Here's what you need to know about our **${service.name}**:`,
                    service.description,
                    `**Key Benefits:**\n${service.benefits.map(b => `• ${b}`).join('\n')}`,
                    `**Investment:** ${service.pricing}\n**Timeline:** ${service.timeline}`,
                    "Would you like to book a free consultation to discuss how this can help your specific business? 📅"
                ]
            };
        } else if (services.length > 1) {
            return "I can see you're interested in multiple services! That's great - we often combine services for maximum impact. Would you like me to book a free consultation where we can discuss a custom package for your business?";
        } else {
            return {
                type: 'multiple',
                messages: [
                    this.getRandomResponse('serviceInquiry'),
                    "🚀 **SEO Optimization** - Boost your Google rankings\n📢 **Google Ads Management** - Get immediate visibility\n🎨 **Web Design** - Convert visitors to customers\n📱 **Social Media Marketing** - Build your brand\n✍️ **Content Marketing** - Establish authority",
                    "Which service interests you most? Or would you prefer a free consultation to discuss a custom solution? 💬"
                ]
            };
        }
    }

    handleFAQ(message) {
        if (/timeline|how long|results/i.test(message)) {
            return this.knowledgeBase.faqs.timeline.answer;
        }
        if (/guarantee|risk/i.test(message)) {
            return this.knowledgeBase.faqs.guarantee.answer;
        }
        if (/location|sydney|australia/i.test(message)) {
            return this.knowledgeBase.faqs.location.answer;
        }
        if (/experience|team/i.test(message)) {
            return this.knowledgeBase.faqs.experience.answer;
        }

        return "I'd be happy to answer any questions! Common questions we get are about pricing, timelines, guarantees, and our experience. What would you like to know?";
    }

    extractUserInfo(message) {
        // Extract name
        const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z]+)/i);
        if (nameMatch && !this.userProfile.name) {
            this.userProfile.name = nameMatch[1];
            this.saveUserProfile();
        }

        // Extract email
        const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch && !this.userProfile.email) {
            this.userProfile.email = emailMatch[0];
            this.saveUserProfile();
        }

        // Extract phone
        const phoneMatch = message.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch && !this.userProfile.phone) {
            this.userProfile.phone = phoneMatch[0];
            this.saveUserProfile();
        }

        // Extract company/website
        const companyMatch = message.match(/(?:my company|business|website)(?:\s+is)?\s+([a-zA-Z0-9\-\.]+(?:\.[a-zA-Z]{2,})?)/i);
        if (companyMatch && !this.userProfile.company) {
            this.userProfile.company = companyMatch[1];
            this.saveUserProfile();
        }
    }

    shouldStartLeadQualification() {
        // Start qualification after 3 messages if user hasn't booked consultation
        return this.conversationHistory.length >= 6 &&
               this.userProfile.stage === 'initial' &&
               !this.hasAskedQualificationQuestions();
    }

    hasAskedQualificationQuestions() {
        return this.conversationHistory.some(msg =>
            msg.sender === 'bot' && msg.type === 'qualification'
        );
    }

    async startLeadQualification() {
        const questions = this.knowledgeBase.leadQualification;
        const questionKeys = Object.keys(questions);

        for (const key of questionKeys) {
            await this.delay(2000);
            this.askQualificationQuestion(key, questions[key]);
        }
    }

    askQualificationQuestion(key, questionData) {
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `
            <p><strong>${questionData.question}</strong></p>
            <div class="qualification-options">
                ${questionData.options.map((option, index) =>
                    `<button class="qualification-btn" data-key="${key}" data-index="${index}" data-score="${questionData.scoring[index]}">${option}</button>`
                ).join('')}
            </div>
        `;

        this.addMessage('bot', questionElement, { type: 'qualification' });

        // Bind option click events
        setTimeout(() => {
            document.querySelectorAll('.qualification-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.handleQualificationAnswer(e));
            });
        }, 100);
    }

    handleQualificationAnswer(e) {
        const key = e.target.dataset.key;
        const score = parseInt(e.target.dataset.score);
        const answer = e.target.textContent;

        // Update lead score
        this.userProfile.leadScore += score;
        this.userProfile[key] = answer;

        // Remove all qualification buttons
        document.querySelectorAll('.qualification-btn').forEach(btn => btn.remove());

        // Add user's selected answer as a message
        this.addMessage('user', answer);

        // Provide follow-up response
        setTimeout(() => {
            this.addMessage('bot', "Thanks for that information! 👍");

            // After all questions, provide recommendation
            if (this.allQualificationQuestionsAnswered()) {
                setTimeout(() => {
                    this.provideServiceRecommendation();
                }, 1500);
            }
        }, 800);

        this.saveUserProfile();
        this.trackEvent('qualification_answer', { question: key, score: score });
    }

    allQualificationQuestionsAnswered() {
        const questions = Object.keys(this.knowledgeBase.leadQualification);
        return questions.every(key => this.userProfile[key]);
    }

    provideServiceRecommendation() {
        const score = this.userProfile.leadScore;
        let recommendation;

        if (score >= 15) {
            // High-value lead
            recommendation = {
                type: 'multiple',
                messages: [
                    "Based on your answers, I can see your business has excellent potential! 🚀",
                    "I'd recommend our **Premium Package** which includes:\n• Complete SEO optimization\n• Google Ads management\n• Social media marketing\n• Monthly strategy calls",
                    "This typically delivers 300-500% ROI within 6 months. Would you like to book a free strategy session to create a custom plan?"
                ]
            };
            this.userProfile.stage = 'qualified';
        } else if (score >= 10) {
            // Medium-value lead
            recommendation = {
                type: 'multiple',
                messages: [
                    "Perfect! Based on your needs, I'd suggest starting with our most popular services:",
                    "🎯 **SEO + Google Ads Combo** for maximum visibility\n📈 Average clients see 3x more leads within 90 days",
                    "Would you like to schedule a free consultation to discuss the best approach for your business?"
                ]
            };
            this.userProfile.stage = 'interested';
        } else {
            // Lower-value lead but still valuable
            recommendation = {
                type: 'multiple',
                messages: [
                    "Thanks for sharing that information! 😊",
                    "I'd recommend starting with either **SEO** or **Google Ads** to test the waters and see immediate impact.",
                    "We offer flexible month-to-month packages. Would you like to chat with our team about the best starting point for your business?"
                ]
            };
        }

        setTimeout(() => {
            if (typeof recommendation === 'string') {
                this.addMessage('bot', recommendation);
            } else {
                recommendation.messages.forEach((msg, index) => {
                    setTimeout(() => this.addMessage('bot', msg), index * 1500);
                });
            }
        }, 1000);

        this.saveUserProfile();
        this.trackEvent('recommendation_provided', { lead_score: score, stage: this.userProfile.stage });
    }

    generateIntelligentResponse(message) {
        // Fallback intelligent responses
        const responses = [
            "That's a great question! Let me connect you with our team for a detailed answer. Would you like to book a free consultation?",
            "I'd love to help you with that! Our experts can provide specific guidance. Shall we schedule a quick chat?",
            "Thanks for asking! For personalized advice on your situation, I'd recommend speaking with our specialists. Want to book a free call?",
            "Interesting point! Every business is unique, so our team would need to understand your specific needs. Ready for a free consultation?",
            "I appreciate your question! While I can provide general information, our strategists can give you tailored recommendations. Shall we set up a meeting?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    getRandomResponse(category) {
        const responses = this.responses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handleQuickAction(action) {
        this.trackEvent('quick_action_clicked', { action });

        switch (action) {
            case 'services':
                this.addMessage('user', "Tell me about your services");
                setTimeout(() => {
                    this.addMessage('bot', this.handleServiceInquiry('services'));
                }, 1000);
                break;

            case 'consultation':
                this.addMessage('user', "I'd like to book a consultation");
                setTimeout(() => {
                    this.openAppointmentModal();
                }, 1000);
                break;

            case 'pricing':
                this.addMessage('user', "What are your prices?");
                setTimeout(() => {
                    this.addMessage('bot', this.knowledgeBase.faqs.pricing.answer);
                }, 1000);
                break;

            case 'contact':
                this.addMessage('user', "How can I contact you?");
                setTimeout(() => {
                    this.addMessage('bot', "You can reach us at:\n📧 hello@theprofitplatform.com.au\n📞 (02) 1234 5678\n🌐 theprofitplatform.com.au\n\nOr book a free consultation and we'll call you! 📅");
                }, 1000);
                break;
        }
    }

    handleFileUpload() {
        document.getElementById('file-input').click();
    }

    processFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.addMessage('bot', "Sorry, the file is too large. Please upload files under 5MB.");
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!allowedTypes.includes(file.type)) {
            this.addMessage('bot', "Sorry, we only accept images, PDFs, and Word documents.");
            return;
        }

        // Create file message
        const fileElement = document.createElement('div');
        fileElement.className = 'file-attachment';
        fileElement.innerHTML = `
            <div class="file-info">
                <i class="fas fa-paperclip"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            </div>
        `;

        this.addMessage('user', fileElement);

        setTimeout(() => {
            this.addMessage('bot', "Thanks for sharing that file! 📎 I've noted it for our team. They'll review it during your consultation. Would you like to schedule a meeting to discuss your project in detail?");
        }, 1000);

        this.trackEvent('file_uploaded', { file_type: file.type, file_size: file.size });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    openAppointmentModal() {
        const modal = document.getElementById('appointment-modal');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');

        // Pre-fill form if we have user info
        if (this.userProfile.name) {
            document.getElementById('client-name').value = this.userProfile.name;
        }
        if (this.userProfile.email) {
            document.getElementById('client-email').value = this.userProfile.email;
        }
        if (this.userProfile.phone) {
            document.getElementById('client-phone').value = this.userProfile.phone;
        }
        if (this.userProfile.company) {
            document.getElementById('client-company').value = this.userProfile.company;
        }

        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('preferred-date').min = tomorrow.toISOString().split('T')[0];

        setTimeout(() => {
            document.getElementById('client-name').focus();
        }, 300);

        this.trackEvent('appointment_modal_opened');
    }

    closeModal() {
        const modal = document.getElementById('appointment-modal');
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        this.trackEvent('appointment_modal_closed');
    }

    handleAppointmentSubmission(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const appointmentData = Object.fromEntries(formData);

        // Update user profile
        this.userProfile = { ...this.userProfile, ...appointmentData };
        this.userProfile.stage = 'booked';
        this.saveUserProfile();

        // Close modal
        this.closeModal();

        // Show success message
        setTimeout(() => {
            this.addMessage('bot', `🎉 **Excellent!** Your consultation is booked.\n\n**Details:**\n• **Name:** ${appointmentData.name}\n• **Email:** ${appointmentData.email}\n• **Service:** ${appointmentData.service}\n• **Preferred Date:** ${appointmentData.date}\n• **Time:** ${appointmentData.time}\n\nWe'll send you a confirmation email shortly with the meeting link. Looking forward to helping you grow your business! 🚀`);
        }, 500);

        // Reset form
        e.target.reset();

        this.trackEvent('appointment_booked', appointmentData);

        // Send to backend/CRM (implement based on your system)
        this.submitAppointmentToBackend(appointmentData);
    }

    async submitAppointmentToBackend(data) {
        try {
            // Replace with your actual endpoint
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    source: 'chatbot',
                    session_id: window.chatbotAnalytics.sessionId,
                    lead_score: this.userProfile.leadScore,
                    conversation_history: this.conversationHistory.slice(-10) // Last 10 messages
                })
            });

            if (response.ok) {
                console.log('Appointment submitted successfully');
            } else {
                console.error('Failed to submit appointment');
            }
        } catch (error) {
            console.error('Error submitting appointment:', error);
            // Could implement fallback like email or local storage
        }
    }

    loadUserProfile() {
        const saved = localStorage.getItem('tpp_chatbot_profile');
        if (saved) {
            this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
        }
    }

    saveUserProfile() {
        localStorage.setItem('tpp_chatbot_profile', JSON.stringify(this.userProfile));
    }

    startWelcomeSequence() {
        // Show notification badge after 10 seconds if user hasn't opened chat
        setTimeout(() => {
            if (!this.isOpen) {
                document.getElementById('notification-badge').classList.remove('hidden');
            }
        }, 10000);

        // Show proactive message after 30 seconds
        setTimeout(() => {
            if (!this.isOpen && this.conversationHistory.length === 0) {
                this.addMessage('bot', "👋 Hi there! Need help with digital marketing? I'm here to help!");
                document.getElementById('notification-badge').classList.remove('hidden');
            }
        }, 30000);
    }

    initializeAnalytics() {
        this.trackEvent('chatbot_initialized', {
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            referrer: document.referrer,
            url: window.location.href
        });
    }

    trackEvent(eventName, properties = {}) {
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            session_id: window.chatbotAnalytics.sessionId,
            user_id: window.chatbotAnalytics.userId,
            properties: {
                ...properties,
                conversation_length: this.conversationHistory.length,
                user_stage: this.userProfile.stage,
                lead_score: this.userProfile.leadScore
            }
        };

        window.chatbotAnalytics.interactions.push(eventData);

        // Send to analytics service (Google Analytics, Mixpanel, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }

        // Send to your backend analytics
        this.sendAnalyticsEvent(eventData);

        console.log('Chatbot Event:', eventData);
    }

    async sendAnalyticsEvent(eventData) {
        try {
            // Replace with your analytics endpoint
            await fetch('/api/chatbot-analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profitPlatformChatbot = new ProfitPlatformChatbot();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfitPlatformChatbot;
}