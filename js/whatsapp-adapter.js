
/**
 * ============================================================================
 * KURUKSHETRA MITRA - WHATSAPP ADAPTER MODULE
 * WhatsApp Integration & Share Functionality
 * Version: 1.0.0
 * ============================================================================
 * 
 * This module provides WhatsApp integration for Kurukshetra Mitra:
 * - Share sites via WhatsApp
 * - Share Q&A via WhatsApp
 * - Format messages for WhatsApp
 * - Generate WhatsApp links
 * - QR code generation
 * - Deep linking support
 * 
 * Features:
 * - One-click sharing
 * - Pre-formatted messages
 * - Contact info sharing
 * - Location sharing
 * - Image sharing support
 * - Group message templates
 * - Business account integration
 * - Console logging
 * 
 * WhatsApp API:
 * - Uses wa.me links (official)
 * - Mobile & desktop support
 * - No authentication required
 * - Works worldwide
 * 
 * Dependencies: None (vanilla JavaScript)
 * Last Updated: January 23, 2026
 */

const WhatsAppAdapter = (function () {
    'use strict';

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    const CONFIG = {
        logging: {
            enabled: true,
            prefix: '📱'
        },
        version: '1.0.0',

        // WhatsApp settings
        whatsapp: {
            baseUrl: 'https://wa.me/',
            webUrl: 'https://web.whatsapp.com/send',
            apiUrl: 'https://api.whatsapp.com/send'
        },

        // Business info (optional)
        business: {
            phoneNumber: null,      // Set if you have a business number
            name: 'City Mitra',
            tagline: 'Your Digital Guide to Sacred Kurukshetra'
        },

        // Message templates
        templates: {
            siteShare: `🕉️ *{siteName}*\n\n{description}\n\n📍 Location: {location}\n🕐 Timings: {timings}\n💰 Entry: {entryFee}\n\n_Shared via Kurukshetra Mitra_\n{url}`,

            questionShare: `❓ *{question}*\n\n{answer}\n\n_Learn more about Kurukshetra with Kurukshetra Mitra_\n{url}`,

            weatherShare: `☀️ *Weather in Kurukshetra*\n\n🌡️ Temperature: {temp}°C\n💨 Wind: {wind} m/s\n💧 Humidity: {humidity}%\n\n_Check live weather at:_\n{url}`,

            eventsShare: `📅 *Upcoming Events in Kurukshetra*\n\n{events}\n\n_View full calendar at:_\n{url}`,

            directionsShare: `🚗 *Directions to Kurukshetra*\n\nFrom: {from}\nDistance: {distance}\nDuration: {duration}\n\n_Get detailed directions at:_\n{url}`,

            generalShare: `🕉️ *Kurukshetra Mitra*\n\n{message}\n\n_Your Digital Guide to Sacred Kurukshetra_\n{url}`,

            invitation: `🙏 Namaste!\n\nDiscover the sacred land of Kurukshetra with our digital guide!\n\n✨ 90+ Heritage Sites\n❓ Comprehensive Q&A\n☀️ Live Weather\n📅 Events Calendar\n🎤 Voice Search\n\nExplore now: {url}`
        },

        // URLs
        urls: {
            base: window.location.origin,
            site: window.location.origin + '/site/',
            question: window.location.origin + '/question/',
            weather: window.location.origin + '/weather',
            events: window.location.origin + '/events',
            directions: window.location.origin + '/directions'
        },

        // Options
        options: {
            useWebVersion: false,    // Use web.whatsapp.com instead of wa.me
            openInNewTab: true,
            encodeMessage: true
        }
    };

    // =========================================================================
    // DYNAMIC CITY CONFIG PATCH
    // =========================================================================
    // Override Kurukshetra-specific values with CITY_CONFIG if available
    if (typeof CITY_CONFIG !== 'undefined') {
        const cn = CITY_CONFIG.name.en;
        const st = CITY_CONFIG.state ? CITY_CONFIG.state.en : 'Haryana';

        // Patch business info
        CONFIG.business.tagline = 'Your Digital Guide to ' + cn;

        // Patch all template strings — replace city references dynamically
        Object.keys(CONFIG.templates).forEach(function(key) {
            if (typeof CONFIG.templates[key] === 'string') {
                CONFIG.templates[key] = CONFIG.templates[key]
                    .replace(/Kurukshetra Mitra/g, cn + ' Mitra')
                    .replace(/Sacred Kurukshetra/g, cn)
                    .replace(/Kurukshetra/g, cn);
            }
        });

        console.log('[WhatsApp Adapter] City config applied:', cn);
    }

    // =========================================================================
    // STATE
    // =========================================================================

    let state = {
        initialized: false,
        shareCount: 0,
        lastShared: null,

        // Callbacks
        callbacks: {
            onShare: null,
            onError: null
        }
    };

    // =========================================================================
    // LOGGING
    // =========================================================================

    function log(message, type = 'info') {
        if (!CONFIG.logging.enabled) return;

        const prefix = CONFIG.logging.prefix;
        const timestamp = new Date().toLocaleTimeString();

        switch (type) {
            case 'warn':
                console.warn(`${prefix} [${timestamp}] ${message}`);
                break;
            case 'error':
                console.error(`${prefix} [${timestamp}] ${message}`);
                break;
            case 'success':
                console.log(`${prefix} ✅ [${timestamp}] ${message}`);
                break;
            default:
                console.log(`${prefix} [${timestamp}] ${message}`);
        }
    }

    // =========================================================================
    // MESSAGE FORMATTING
    // =========================================================================

    /**
     * Format message using template
     * @param {string} template - Template string
     * @param {Object} data - Data to fill template
     * @returns {string} - Formatted message
     */
    function formatMessage(template, data) {
        let message = template;

        // Replace all placeholders
        for (const [key, value] of Object.entries(data)) {
            const placeholder = `{${key}}`;
            message = message.replace(new RegExp(placeholder, 'g'), value || 'N/A');
        }

        return message;
    }

    /**
     * Format site for sharing
     * @param {Object} site - Site object
     * @returns {string} - Formatted message
     */
    function formatSiteMessage(site) {
        const url = CONFIG.urls.site + (site.id || site.name.replace(/\s+/g, '-').toLowerCase());

        return formatMessage(CONFIG.templates.siteShare, {
            siteName: site.name,
            description: site.description || ((typeof CITY_CONFIG !== 'undefined') ? ('A notable site in ' + CITY_CONFIG.name.en) : 'A sacred heritage site in Kurukshetra'),
            location: site.location?.address || ((typeof CITY_CONFIG !== 'undefined') ? (CITY_CONFIG.name.en + ', ' + CITY_CONFIG.state.en) : 'Kurukshetra, Haryana'),
            timings: site.timings || 'Open all days',
            entryFee: site.entryFee || 'Free',
            url: url
        });
    }

    /**
     * Format question for sharing
     * @param {Object} question - Question object
     * @returns {string} - Formatted message
     */
    function formatQuestionMessage(question) {
        const url = CONFIG.urls.question + question.id;

        return formatMessage(CONFIG.templates.questionShare, {
            question: question.question,
            answer: question.answer,
            url: url
        });
    }

    /**
     * Format weather for sharing
     * @param {Object} weather - Weather object
     * @returns {string} - Formatted message
     */
    function formatWeatherMessage(weather) {
        return formatMessage(CONFIG.templates.weatherShare, {
            temp: weather.temp,
            wind: weather.wind_speed,
            humidity: weather.humidity,
            url: CONFIG.urls.weather
        });
    }

    /**
     * Format events for sharing
     * @param {Array} events - Events array
     * @returns {string} - Formatted message
     */
    function formatEventsMessage(events) {
        const eventsList = events.slice(0, 3).map((event, i) =>
            `${i + 1}. ${event.title} - ${event.date}`
        ).join('\n');

        return formatMessage(CONFIG.templates.eventsShare, {
            events: eventsList,
            url: CONFIG.urls.events
        });
    }

    /**
     * Format directions for sharing
     * @param {Object} directions - Directions object
     * @returns {string} - Formatted message
     */
    function formatDirectionsMessage(directions) {
        return formatMessage(CONFIG.templates.directionsShare, {
            from: directions.from || 'Your location',
            distance: directions.distance,
            duration: directions.duration,
            url: CONFIG.urls.directions
        });
    }

    /**
     * Format custom message
     * @param {string} message - Custom message
     * @param {string} url - Optional URL
     * @returns {string} - Formatted message
     */
    function formatCustomMessage(message, url = null) {
        return formatMessage(CONFIG.templates.generalShare, {
            message: message,
            url: url || CONFIG.urls.base
        });
    }

    // =========================================================================
    // WHATSAPP URL GENERATION
    // =========================================================================

    /**
     * Generate WhatsApp share URL
     * @param {string} message - Message to share
     * @param {string} phoneNumber - Optional phone number
     * @returns {string} - WhatsApp URL
     */
    function generateWhatsAppUrl(message, phoneNumber = null) {
        let baseUrl;

        if (CONFIG.options.useWebVersion) {
            baseUrl = CONFIG.whatsapp.webUrl;
        } else if (phoneNumber) {
            baseUrl = CONFIG.whatsapp.baseUrl + phoneNumber;
        } else {
            baseUrl = CONFIG.whatsapp.apiUrl;
        }

        // Encode message
        const encodedMessage = CONFIG.options.encodeMessage ?
            encodeURIComponent(message) : message;

        // Build URL
        const url = phoneNumber ?
            `${baseUrl}?text=${encodedMessage}` :
            `${baseUrl}?text=${encodedMessage}`;

        return url;
    }

    /**
     * Generate WhatsApp business URL
     * @param {string} message - Message to send
     * @returns {string} - WhatsApp business URL
     */
    function generateBusinessUrl(message) {
        if (!CONFIG.business.phoneNumber) {
            log('Business phone number not configured', 'warn');
            return generateWhatsAppUrl(message);
        }

        return generateWhatsAppUrl(message, CONFIG.business.phoneNumber);
    }

    // =========================================================================
    // SHARE FUNCTIONS
    // =========================================================================

    /**
     * Share content via WhatsApp
     * @param {string} message - Message to share
     * @param {Object} options - Share options
     */
    function share(message, options = {}) {
        try {
            // Generate URL
            const url = options.phoneNumber ?
                generateWhatsAppUrl(message, options.phoneNumber) :
                generateWhatsAppUrl(message);

            log(`Sharing via WhatsApp: "${message.substring(0, 50)}..."`);

            // Open WhatsApp
            if (CONFIG.options.openInNewTab) {
                window.open(url, '_blank');
            } else {
                window.location.href = url;
            }

            // Update state
            state.shareCount++;
            state.lastShared = {
                message: message,
                timestamp: new Date(),
                type: options.type || 'custom'
            };

            // Callback
            if (state.callbacks.onShare) {
                state.callbacks.onShare({
                    message: message,
                    url: url,
                    type: options.type
                });
            }

            log('Share successful', 'success');
            return true;

        } catch (error) {
            log(`Share error: ${error.message}`, 'error');

            if (state.callbacks.onError) {
                state.callbacks.onError(error);
            }

            return false;
        }
    }

    /**
     * Share site via WhatsApp
     * @param {Object} site - Site object
     */
    function shareSite(site) {
        const message = formatSiteMessage(site);
        return share(message, { type: 'site' });
    }

    /**
     * Share question via WhatsApp
     * @param {Object} question - Question object
     */
    function shareQuestion(question) {
        const message = formatQuestionMessage(question);
        return share(message, { type: 'question' });
    }

    /**
     * Share weather via WhatsApp
     * @param {Object} weather - Weather object
     */
    function shareWeather(weather) {
        const message = formatWeatherMessage(weather);
        return share(message, { type: 'weather' });
    }

    /**
     * Share events via WhatsApp
     * @param {Array} events - Events array
     */
    function shareEvents(events) {
        const message = formatEventsMessage(events);
        return share(message, { type: 'events' });
    }

    /**
     * Share directions via WhatsApp
     * @param {Object} directions - Directions object
     */
    function shareDirections(directions) {
        const message = formatDirectionsMessage(directions);
        return share(message, { type: 'directions' });
    }

    /**
     * Share app invitation
     */
    function shareInvitation() {
        const message = formatMessage(CONFIG.templates.invitation, {
            url: CONFIG.urls.base
        });
        return share(message, { type: 'invitation' });
    }

    /**
     * Share to business number
     * @param {string} message - Message to send
     */
    function shareToBusiness(message) {
        const url = generateBusinessUrl(message);

        if (CONFIG.options.openInNewTab) {
            window.open(url, '_blank');
        } else {
            window.location.href = url;
        }

        state.shareCount++;
        log('Shared to business number', 'success');
        return true;
    }

    // =========================================================================
    // SHARE BUTTON CREATION
    // =========================================================================

    /**
     * Create WhatsApp share button
     * @param {Object} options - Button options
     * @returns {HTMLElement} - Share button
     */
    function createShareButton(options = {}) {
        const button = document.createElement('button');
        button.className = options.className || 'whatsapp-share-btn';
        button.innerHTML = options.text || '<i class="fab fa-whatsapp"></i> Share';

        // Styling
        if (!options.customStyle) {
            button.style.cssText = `
                background: #25D366;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.2s;
            `;

            button.addEventListener('mouseenter', () => {
                button.style.background = '#20BA5A';
                button.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.background = '#25D366';
                button.style.transform = 'translateY(0)';
            });
        }

        // Click handler
        button.addEventListener('click', () => {
            if (options.onClick) {
                options.onClick();
            } else if (options.message) {
                share(options.message, options);
            }
        });

        return button;
    }

    /**
     * Create share button for site
     * @param {Object} site - Site object
     * @param {Object} options - Button options
     * @returns {HTMLElement} - Share button
     */
    function createSiteShareButton(site, options = {}) {
        return createShareButton({
            ...options,
            onClick: () => shareSite(site)
        });
    }

    /**
     * Create share button for question
     * @param {Object} question - Question object
     * @param {Object} options - Button options
     * @returns {HTMLElement} - Share button
     */
    function createQuestionShareButton(question, options = {}) {
        return createShareButton({
            ...options,
            onClick: () => shareQuestion(question)
        });
    }

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Check if WhatsApp is available
     * @returns {boolean} - Availability status
     */
    function isWhatsAppAvailable() {
        // Check if on mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // WhatsApp web works on desktop too
        return true;
    }

    /**
     * Get share statistics
     * @returns {Object} - Share statistics
     */
    function getStats() {
        return {
            totalShares: state.shareCount,
            lastShared: state.lastShared
        };
    }

    /**
     * Copy message to clipboard
     * @param {string} message - Message to copy
     * @returns {Promise<boolean>} - Success status
     */
    async function copyToClipboard(message) {
        try {
            await navigator.clipboard.writeText(message);
            log('Message copied to clipboard', 'success');
            return true;
        } catch (error) {
            log('Clipboard copy failed', 'error');
            return false;
        }
    }

    /**
     * Generate shareable link
     * @param {string} type - Content type
     * @param {string} id - Content ID
     * @returns {string} - Shareable URL
     */
    function generateShareableLink(type, id) {
        const baseUrl = CONFIG.urls.base;
        return `${baseUrl}/${type}/${id}`;
    }

    // =========================================================================
    // CONFIGURATION
    // =========================================================================

    /**
     * Set business phone number
     * @param {string} phoneNumber - Phone number with country code
     */
    function setBusinessNumber(phoneNumber) {
        // Remove all non-digits
        const cleaned = phoneNumber.replace(/\D/g, '');
        CONFIG.business.phoneNumber = cleaned;
        log(`Business number set: ${cleaned}`);
    }

    /**
     * Set base URL
     * @param {string} url - Base URL
     */
    function setBaseUrl(url) {
        CONFIG.urls.base = url;
        log(`Base URL set: ${url}`);
    }

    /**
     * Update template
     * @param {string} templateName - Template name
     * @param {string} template - Template string
     */
    function setTemplate(templateName, template) {
        if (CONFIG.templates[templateName]) {
            CONFIG.templates[templateName] = template;
            log(`Template updated: ${templateName}`);
        } else {
            log(`Template not found: ${templateName}`, 'warn');
        }
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize WhatsApp Adapter
     * @param {Object} options - Configuration options
     * @returns {Object} - Public API
     */
    function init(options = {}) {
        if (state.initialized) {
            log('WhatsApp Adapter already initialized', 'warn');
            return getPublicAPI();
        }

        log('WhatsApp Adapter initializing...', 'info');

        try {
            // Apply options
            if (options.businessNumber) {
                setBusinessNumber(options.businessNumber);
            }

            if (options.baseUrl) {
                setBaseUrl(options.baseUrl);
            }

            if (options.useWebVersion !== undefined) {
                CONFIG.options.useWebVersion = options.useWebVersion;
            }

            if (options.openInNewTab !== undefined) {
                CONFIG.options.openInNewTab = options.openInNewTab;
            }

            // Set callbacks
            if (options.onShare) state.callbacks.onShare = options.onShare;
            if (options.onError) state.callbacks.onError = options.onError;

            state.initialized = true;

            log('WhatsApp Adapter initialized successfully!', 'success');
            log(`Business: ${CONFIG.business.name}`);
            log(`WhatsApp available: ${isWhatsAppAvailable()}`);

        } catch (error) {
            log(`Initialization error: ${error.message}`, 'error');
            console.error(error);
        }

        return getPublicAPI();
    }

    /**
     * Get public API
     * @returns {Object} - Public API
     */
    function getPublicAPI() {
        return {
            // Share functions
            share,
            shareSite,
            shareQuestion,
            shareWeather,
            shareEvents,
            shareDirections,
            shareInvitation,
            shareToBusiness,

            // Button creation
            createShareButton,
            createSiteShareButton,
            createQuestionShareButton,

            // Message formatting
            formatSiteMessage,
            formatQuestionMessage,
            formatWeatherMessage,
            formatEventsMessage,
            formatDirectionsMessage,
            formatCustomMessage,

            // URL generation
            generateWhatsAppUrl,
            generateBusinessUrl,
            generateShareableLink,

            // Utility functions
            isWhatsAppAvailable,
            getStats,
            copyToClipboard,

            // Configuration
            setBusinessNumber,
            setBaseUrl,
            setTemplate,
            setLogging: (enabled) => { CONFIG.logging.enabled = enabled; },

            // Callbacks
            onShare: (callback) => { state.callbacks.onShare = callback; },
            onError: (callback) => { state.callbacks.onError = callback; },

            // Metadata
            version: CONFIG.version,
            templates: CONFIG.templates
        };
    }

    // =========================================================================
    // EXPORT PUBLIC API
    // =========================================================================

    return {
        init,
        get: getPublicAPI
    };

})();

// =========================================================================
// EXPORT (for module systems)
// =========================================================================

// CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhatsAppAdapter;
}

// AMD
if (typeof define === 'function' && define.amd) {
    define([], function () {
        return WhatsAppAdapter;
    });
}

// Global export
if (typeof window !== 'undefined') {
    window.WhatsAppAdapter = WhatsAppAdapter;
}
