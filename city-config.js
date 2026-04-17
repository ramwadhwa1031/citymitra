// ════════════════════════════════════════════════════════════
// CITY MITRA — Dynamic City Configuration
// ════════════════════════════════════════════════════════════
// This file MUST be loaded BEFORE script.js
//
// It reads the subdomain from the URL and provides all
// city-specific configuration to the rest of the app.
//
// Examples:
//   citymitra.app         → Kurukshetra (default)
//   kkr.citymitra.app     → Kurukshetra
//   karnal.citymitra.app  → Karnal
//   ambala.citymitra.app  → Ambala
//   panchkula.citymitra.app → Panchkula
//
// To add a new city:
//   1. Add a new entry to the CITIES object below
//   2. Set up DNS for {city}.citymitra.app
//   3. Create autocomplete-data-{city}.json (optional)
// ════════════════════════════════════════════════════════════

(function () {
    'use strict';

    // ══════════════════════════════════
    // CITY DATABASE
    // ══════════════════════════════════
    // Key = subdomain identifier
    // Add new cities by copying a block and customizing it.

    const CITIES = {

        // ─────────────────────────────────
        // KURUKSHETRA (DEFAULT)
        // ─────────────────────────────────
        kkr: {
            id: 'kkr',

            // ── Identity ──
            name: { en: 'Kurukshetra', hi: 'कुरुक्षेत्र' },
            district: { en: 'Kurukshetra', hi: 'कुरुक्षेत्र' },
            state: { en: 'Haryana', hi: 'हरियाणा' },
            heroEmoji: '🕉️',

            // ── Government ──
            govWebsite: 'https://kurukshetra.gov.in',
            privacyPolicy: 'https://kurukshetra.gov.in/privacy-policy/',

            // ── Brand Colors ──
            colors: {
                city: '#E07B2A',       // Saffron
                cityLt: '#FFF4EB',
                cityDeep: '#B85E18'
            },

            // ── Feature Flags ──
            features: {
                gita: true,       // Enable Gita Q&A routing
                heritage: true    // Show heritage question sets
            },

            // ── Webhooks (n8n) ──
            webhooks: {
                chat: 'https://n8n-workflow-test.duckdns.org/webhook/chat',
                feedback: 'https://n8n-workflow-test.duckdns.org/webhook/InfoBot_Feed',
                gita: 'https://n8n-workflow-test.duckdns.org/webhook/InfoBot_AskGita'
            },

            // ── Service Worker API Patterns ──
            apiPatterns: [
                'n8n-workflow-test',
                'kurukshetra.gov.in/api',
                'webhook'
            ],

            // ── Data Files ──
            autocompleteFile: 'autocomplete-data.json',
            storageKey: 'kwr_chat_history', // kept for backward compat

            // ── Devanagari welcome line ──
            welcomeDevanagari: 'कुरुक्षेत्र — आपकी सेवा में',

            // ── Rotating Question Sets ──
            questionSets: {
                en: [
                    {
                        title: "🏛️ General Info",
                        questions: [
                            { icon: "👤", text: "Who is DC?" },
                            { icon: "🚨", text: "Emergency" },
                            { icon: "🏛️", text: "Tourist Places" },
                            { icon: "📊", text: "Population" }
                        ]
                    },
                    {
                        title: "📋 Services",
                        questions: [
                            { icon: "📋", text: "Birth Certificate" },
                            { icon: "🏥", text: "Hospitals" },
                            { icon: "🎓", text: "Universities" },
                            { icon: "🚍", text: "How to reach?" }
                        ]
                    },
                    {
                        title: "🕉️ Heritage",
                        questions: [
                            { icon: "🕉️", text: "48 Kos Parikrama" },
                            { icon: "🛕", text: "Brahma Sarovar" },
                            { icon: "🏺", text: "Archaeological sites" },
                            { icon: "📿", text: "Gita Jayanti" }
                        ]
                    },
                    {
                        title: "📖 Bhagavad Gita",
                        questions: [
                            { icon: "📖", text: "What is Bhagavad Gita?" },
                            { icon: "🙏", text: "Karma Yoga meaning" },
                            { icon: "🧘", text: "Meditation in Gita" },
                            { icon: "⚔️", text: "Arjuna's dilemma" }
                        ]
                    },
                    {
                        title: "🏢 Government",
                        questions: [
                            { icon: "🏢", text: "SDM Office" },
                            { icon: "📝", text: "Latest Tenders" },
                            { icon: "💼", text: "Job Vacancies" },
                            { icon: "🌾", text: "Agriculture Dept" }
                        ]
                    }
                ],
                hi: [
                    {
                        title: "🏛️ सामान्य जानकारी",
                        questions: [
                            { icon: "👤", text: "DC कौन हैं?" },
                            { icon: "🚨", text: "आपातकालीन नंबर" },
                            { icon: "🏛️", text: "पर्यटन स्थल" },
                            { icon: "📊", text: "जनसंख्या" }
                        ]
                    },
                    {
                        title: "📋 सेवाएं",
                        questions: [
                            { icon: "📋", text: "जन्म प्रमाण पत्र" },
                            { icon: "🏥", text: "अस्पताल" },
                            { icon: "🎓", text: "विश्वविद्यालय" },
                            { icon: "🚍", text: "कैसे पहुंचें?" }
                        ]
                    },
                    {
                        title: "🕉️ विरासत",
                        questions: [
                            { icon: "🕉️", text: "48 कोस परिक्रमा" },
                            { icon: "🛕", text: "ब्रह्म सरोवर" },
                            { icon: "🏺", text: "पुरातात्विक स्थल" },
                            { icon: "📿", text: "गीता जयंती" }
                        ]
                    },
                    {
                        title: "📖 भगवद गीता",
                        questions: [
                            { icon: "📖", text: "भगवद गीता क्या है?" },
                            { icon: "🙏", text: "कर्म योग का अर्थ" },
                            { icon: "🧘", text: "गीता में ध्यान" },
                            { icon: "⚔️", text: "अर्जुन की दुविधा" }
                        ]
                    },
                    {
                        title: "🏢 सरकारी",
                        questions: [
                            { icon: "🏢", text: "SDM कार्यालय" },
                            { icon: "📝", text: "नवीनतम निविदाएं" },
                            { icon: "💼", text: "नौकरी रिक्तियां" },
                            { icon: "🌾", text: "कृषि विभाग" }
                        ]
                    }
                ]
            },

            // ── Share Messages ──
            shareMessages: {
                appInvite: {
                    en: (url) => `🕉️ *City Mitra - AI Chatbot*\n\nDiscover Kurukshetra's heritage digitally!\n\n✨ Features:\n- 90+ Heritage Sites\n- Bhagavad Gita Wisdom\n- Emergency Contacts\n- Tourism Information\n- Bilingual (Hindi/English)\n\n🔗 Chat now:\n${url}\n\n_Experience spiritual heritage digitally!_ 🙏`,
                    hi: (url) => `🕉️ *City Mitra - AI Chatbot*\n\nकुरुक्षेत्र की विरासत को डिजिटल रूप से खोजें!\n\n✨ विशेषताएं:\n- 90+ धरोहर स्थल\n- भगवद गीता ज्ञान\n- आपातकालीन संपर्क\n- पर्यटन जानकारी\n- द्विभाषी (हिंदी/अंग्रेजी)\n\n🔗 अभी चैट करें:\n${url}\n\n_आध्यात्मिक विरासत का डिजिटल अनुभव!_ 🙏`
                },
                botMessageFooter: {
                    en: '_Discover Kurukshetra Heritage_',
                    hi: '_कुरुक्षेत्र विरासत खोजें_'
                }
            }
        },

        // ─────────────────────────────────
        // KARNAL
        // ─────────────────────────────────
        karnal: {
            id: 'karnal',
            name: { en: 'Karnal', hi: 'करनाल' },
            district: { en: 'Karnal', hi: 'करनाल' },
            state: { en: 'Haryana', hi: 'हरियाणा' },
            heroEmoji: '🌾',
            govWebsite: 'https://karnal.gov.in',
            privacyPolicy: 'https://karnal.gov.in/privacy-policy/',
            colors: {
                city: '#2E7D32',
                cityLt: '#E8F5E9',
                cityDeep: '#1B5E20'
            },
            features: { gita: false, heritage: true },
            webhooks: {
                chat: 'https://n8n-workflow-test.duckdns.org/webhook/chat',
                feedback: 'https://n8n-workflow-test.duckdns.org/webhook/InfoBot_Feed',
                gita: null
            },
            apiPatterns: ['n8n-workflow-test', 'karnal.gov.in/api', 'webhook'],
            autocompleteFile: 'autocomplete-data-karnal.json',
            storageKey: 'city_mitra_chat_karnal',
            welcomeDevanagari: 'करनाल — आपकी सेवा में',
            questionSets: {
                en: [
                    {
                        title: "🏛️ General Info",
                        questions: [
                            { icon: "👤", text: "Who is DC?" },
                            { icon: "🚨", text: "Emergency" },
                            { icon: "🏛️", text: "Tourist Places" },
                            { icon: "📊", text: "Population" }
                        ]
                    },
                    {
                        title: "📋 Services",
                        questions: [
                            { icon: "📋", text: "Birth Certificate" },
                            { icon: "🏥", text: "Hospitals" },
                            { icon: "🎓", text: "Universities" },
                            { icon: "🚍", text: "How to reach?" }
                        ]
                    },
                    {
                        title: "🌾 Agriculture",
                        questions: [
                            { icon: "🌾", text: "NDRI Karnal" },
                            { icon: "🐄", text: "Dairy industry" },
                            { icon: "🏭", text: "Agro industries" },
                            { icon: "📋", text: "Farmer Schemes" }
                        ]
                    },
                    {
                        title: "🏢 Government",
                        questions: [
                            { icon: "🏢", text: "SDM Office" },
                            { icon: "📝", text: "Latest Tenders" },
                            { icon: "💼", text: "Job Vacancies" },
                            { icon: "🌾", text: "Agriculture Dept" }
                        ]
                    }
                ],
                hi: [
                    {
                        title: "🏛️ सामान्य जानकारी",
                        questions: [
                            { icon: "👤", text: "DC कौन हैं?" },
                            { icon: "🚨", text: "आपातकालीन नंबर" },
                            { icon: "🏛️", text: "पर्यटन स्थल" },
                            { icon: "📊", text: "जनसंख्या" }
                        ]
                    },
                    {
                        title: "📋 सेवाएं",
                        questions: [
                            { icon: "📋", text: "जन्म प्रमाण पत्र" },
                            { icon: "🏥", text: "अस्पताल" },
                            { icon: "🎓", text: "विश्वविद्यालय" },
                            { icon: "🚍", text: "कैसे पहुंचें?" }
                        ]
                    },
                    {
                        title: "🌾 कृषि",
                        questions: [
                            { icon: "🌾", text: "NDRI करनाल" },
                            { icon: "🐄", text: "डेयरी उद्योग" },
                            { icon: "🏭", text: "कृषि उद्योग" },
                            { icon: "📋", text: "किसान योजनाएं" }
                        ]
                    },
                    {
                        title: "🏢 सरकारी",
                        questions: [
                            { icon: "🏢", text: "SDM कार्यालय" },
                            { icon: "📝", text: "नवीनतम निविदाएं" },
                            { icon: "💼", text: "नौकरी रिक्तियां" },
                            { icon: "🌾", text: "कृषि विभाग" }
                        ]
                    }
                ]
            },
            shareMessages: {
                appInvite: {
                    en: (url) => `🌾 *City Mitra - AI Chatbot*\n\nDiscover Karnal digitally!\n\n✨ Features:\n- District Information\n- Emergency Contacts\n- Government Schemes\n- Bilingual (Hindi/English)\n\n🔗 Chat now:\n${url}\n\n_Your civic AI assistant!_ 🙏`,
                    hi: (url) => `🌾 *City Mitra - AI Chatbot*\n\nकरनाल को डिजिटल रूप से खोजें!\n\n✨ विशेषताएं:\n- जिला जानकारी\n- आपातकालीन संपर्क\n- सरकारी योजनाएं\n- द्विभाषी (हिंदी/अंग्रेजी)\n\n🔗 अभी चैट करें:\n${url}\n\n_आपका नागरिक AI सहायक!_ 🙏`
                },
                botMessageFooter: {
                    en: '_Discover Karnal_',
                    hi: '_करनाल खोजें_'
                }
            }
        },

        // ─────────────────────────────────
        // AMBALA
        // ─────────────────────────────────
        ambala: {
            id: 'ambala',
            name: { en: 'Ambala', hi: 'अंबाला' },
            district: { en: 'Ambala', hi: 'अंबाला' },
            state: { en: 'Haryana', hi: 'हरियाणा' },
            heroEmoji: '🏛️',
            govWebsite: 'https://ambala.gov.in',
            privacyPolicy: 'https://ambala.gov.in/privacy-policy/',
            colors: {
                city: '#1565C0',
                cityLt: '#E3F2FD',
                cityDeep: '#0D47A1'
            },
            features: { gita: false, heritage: true },
            webhooks: {
                chat: 'https://n8n-workflow-test.duckdns.org/webhook/chat',
                feedback: 'https://n8n-workflow-test.duckdns.org/webhook/InfoBot_Feed',
                gita: null
            },
            apiPatterns: ['n8n-workflow-test', 'ambala.gov.in/api', 'webhook'],
            autocompleteFile: 'autocomplete-data-ambala.json',
            storageKey: 'city_mitra_chat_ambala',
            welcomeDevanagari: 'अंबाला — आपकी सेवा में',
            questionSets: {
                en: [
                    {
                        title: "🏛️ General Info",
                        questions: [
                            { icon: "👤", text: "Who is DC?" },
                            { icon: "🚨", text: "Emergency" },
                            { icon: "🏛️", text: "Tourist Places" },
                            { icon: "📊", text: "Population" }
                        ]
                    },
                    {
                        title: "📋 Services",
                        questions: [
                            { icon: "📋", text: "Birth Certificate" },
                            { icon: "🏥", text: "Hospitals" },
                            { icon: "🎓", text: "Colleges" },
                            { icon: "🚍", text: "How to reach?" }
                        ]
                    },
                    {
                        title: "🏢 Government",
                        questions: [
                            { icon: "🏢", text: "SDM Office" },
                            { icon: "📝", text: "Latest Tenders" },
                            { icon: "💼", text: "Job Vacancies" },
                            { icon: "🌾", text: "Agriculture Dept" }
                        ]
                    }
                ],
                hi: [
                    {
                        title: "🏛️ सामान्य जानकारी",
                        questions: [
                            { icon: "👤", text: "DC कौन हैं?" },
                            { icon: "🚨", text: "आपातकालीन नंबर" },
                            { icon: "🏛️", text: "पर्यटन स्थल" },
                            { icon: "📊", text: "जनसंख्या" }
                        ]
                    },
                    {
                        title: "📋 सेवाएं",
                        questions: [
                            { icon: "📋", text: "जन्म प्रमाण पत्र" },
                            { icon: "🏥", text: "अस्पताल" },
                            { icon: "🎓", text: "कॉलेज" },
                            { icon: "🚍", text: "कैसे पहुंचें?" }
                        ]
                    },
                    {
                        title: "🏢 सरकारी",
                        questions: [
                            { icon: "🏢", text: "SDM कार्यालय" },
                            { icon: "📝", text: "नवीनतम निविदाएं" },
                            { icon: "💼", text: "नौकरी रिक्तियां" },
                            { icon: "🌾", text: "कृषि विभाग" }
                        ]
                    }
                ]
            },
            shareMessages: {
                appInvite: {
                    en: (url) => `🏛️ *City Mitra - AI Chatbot*\n\nDiscover Ambala digitally!\n\n✨ Features:\n- District Information\n- Emergency Contacts\n- Government Schemes\n- Bilingual (Hindi/English)\n\n🔗 Chat now:\n${url}\n\n_Your civic AI assistant!_ 🙏`,
                    hi: (url) => `🏛️ *City Mitra - AI Chatbot*\n\nअंबाला को डिजिटल रूप से खोजें!\n\n✨ विशेषताएं:\n- जिला जानकारी\n- आपातकालीन संपर्क\n- सरकारी योजनाएं\n- द्विभाषी (हिंदी/अंग्रेजी)\n\n🔗 अभी चैट करें:\n${url}\n\n_आपका नागरिक AI सहायक!_ 🙏`
                },
                botMessageFooter: {
                    en: '_Discover Ambala_',
                    hi: '_अंबाला खोजें_'
                }
            }
        },

        // ─────────────────────────────────
        // PANCHKULA
        // ─────────────────────────────────
        panchkula: {
            id: 'panchkula',
            name: { en: 'Panchkula', hi: 'पंचकूला' },
            district: { en: 'Panchkula', hi: 'पंचकूला' },
            state: { en: 'Haryana', hi: 'हरियाणा' },
            heroEmoji: '🏔️',
            govWebsite: 'https://panchkula.gov.in',
            privacyPolicy: 'https://panchkula.gov.in/privacy-policy/',
            colors: {
                city: '#00695C',
                cityLt: '#E0F2F1',
                cityDeep: '#004D40'
            },
            features: { gita: false, heritage: true },
            webhooks: {
                chat: 'https://n8n-workflow-test.duckdns.org/webhook/chat',
                feedback: 'https://n8n-workflow-test.duckdns.org/webhook/InfoBot_Feed',
                gita: null
            },
            apiPatterns: ['n8n-workflow-test', 'panchkula.gov.in/api', 'webhook'],
            autocompleteFile: 'autocomplete-data-panchkula.json',
            storageKey: 'city_mitra_chat_panchkula',
            welcomeDevanagari: 'पंचकूला — आपकी सेवा में',
            questionSets: {
                en: [
                    {
                        title: "🏛️ General Info",
                        questions: [
                            { icon: "👤", text: "Who is DC?" },
                            { icon: "🚨", text: "Emergency" },
                            { icon: "🏛️", text: "Tourist Places" },
                            { icon: "📊", text: "Population" }
                        ]
                    },
                    {
                        title: "📋 Services",
                        questions: [
                            { icon: "📋", text: "Birth Certificate" },
                            { icon: "🏥", text: "Hospitals" },
                            { icon: "🎓", text: "Colleges" },
                            { icon: "🚍", text: "How to reach?" }
                        ]
                    },
                    {
                        title: "🏔️ Nature & Parks",
                        questions: [
                            { icon: "🏔️", text: "Morni Hills" },
                            { icon: "🌿", text: "Cactus Garden" },
                            { icon: "🦚", text: "Bird watching" },
                            { icon: "🏞️", text: "Tikkar Taal" }
                        ]
                    },
                    {
                        title: "🏢 Government",
                        questions: [
                            { icon: "🏢", text: "SDM Office" },
                            { icon: "📝", text: "Latest Tenders" },
                            { icon: "💼", text: "Job Vacancies" },
                            { icon: "🌾", text: "Agriculture Dept" }
                        ]
                    }
                ],
                hi: [
                    {
                        title: "🏛️ सामान्य जानकारी",
                        questions: [
                            { icon: "👤", text: "DC कौन हैं?" },
                            { icon: "🚨", text: "आपातकालीन नंबर" },
                            { icon: "🏛️", text: "पर्यटन स्थल" },
                            { icon: "📊", text: "जनसंख्या" }
                        ]
                    },
                    {
                        title: "📋 सेवाएं",
                        questions: [
                            { icon: "📋", text: "जन्म प्रमाण पत्र" },
                            { icon: "🏥", text: "अस्पताल" },
                            { icon: "🎓", text: "कॉलेज" },
                            { icon: "🚍", text: "कैसे पहुंचें?" }
                        ]
                    },
                    {
                        title: "🏔️ प्रकृति और पार्क",
                        questions: [
                            { icon: "🏔️", text: "मोरनी हिल्स" },
                            { icon: "🌿", text: "कैक्टस गार्डन" },
                            { icon: "🦚", text: "पक्षी अवलोकन" },
                            { icon: "🏞️", text: "टिक्कर ताल" }
                        ]
                    },
                    {
                        title: "🏢 सरकारी",
                        questions: [
                            { icon: "🏢", text: "SDM कार्यालय" },
                            { icon: "📝", text: "नवीनतम निविदाएं" },
                            { icon: "💼", text: "नौकरी रिक्तियां" },
                            { icon: "🌾", text: "कृषि विभाग" }
                        ]
                    }
                ]
            },
            shareMessages: {
                appInvite: {
                    en: (url) => `🏔️ *City Mitra - AI Chatbot*\n\nDiscover Panchkula digitally!\n\n✨ Features:\n- District Information\n- Emergency Contacts\n- Government Schemes\n- Bilingual (Hindi/English)\n\n🔗 Chat now:\n${url}\n\n_Your civic AI assistant!_ 🙏`,
                    hi: (url) => `🏔️ *City Mitra - AI Chatbot*\n\nपंचकूला को डिजिटल रूप से खोजें!\n\n✨ विशेषताएं:\n- जिला जानकारी\n- आपातकालीन संपर्क\n- सरकारी योजनाएं\n- द्विभाषी (हिंदी/अंग्रेजी)\n\n🔗 अभी चैट करें:\n${url}\n\n_आपका नागरिक AI सहायक!_ 🙏`
                },
                botMessageFooter: {
                    en: '_Discover Panchkula_',
                    hi: '_पंचकूला खोजें_'
                }
            }
        }
    };

    // ── Subdomain aliases ──
    // Map alternative subdomains to the main city ID
    const ALIASES = {
        'kurukshetra': 'kkr',
        'localhost': 'kkr'     // localhost → default for dev
    };

    // ══════════════════════════════════
    // SUBDOMAIN DETECTION
    // ══════════════════════════════════

    function detectCity() {
        const hostname = window.location.hostname;

        // localhost / 127.0.0.1 / direct IP → default
        if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            console.log('[CityConfig] Dev environment detected → default city');
            return 'kkr';
        }

        const parts = hostname.split('.');

        // citymitra.app (no subdomain) OR www.citymitra.app → generic/default fallback
        if (parts.length <= 2 || (parts.length === 3 && parts[0].toLowerCase() === 'www')) {
            console.log('[CityConfig] Bare domain detected → defaulting to kkr');
            return 'kkr';
        }

        // karnal.citymitra.app → subdomain = "karnal"
        const subdomain = parts[0].toLowerCase();

        // Check aliases first
        if (ALIASES[subdomain]) {
            console.log(`[CityConfig] Alias "${subdomain}" → "${ALIASES[subdomain]}"`);
            return ALIASES[subdomain];
        }

        // Check direct match
        if (CITIES[subdomain]) {
            console.log(`[CityConfig] City matched: "${subdomain}"`);
            return subdomain;
        }

        // Unknown subdomain → default
        console.warn(`[CityConfig] Unknown subdomain "${subdomain}" → default city`);
        return 'kkr';
    }

    // ══════════════════════════════════
    // APPLY CONFIGURATION
    // ══════════════════════════════════

    const cityId = detectCity();
    const config = CITIES[cityId];

    // Expose globally
    window.CITY_CONFIG = config;

    // Also expose the full cities map and detection function for debugging
    window.CITY_CONFIG_ALL = CITIES;
    window.CITY_CONFIG_DETECT = detectCity;

    // ── Inject city-specific CSS variables ──
    const style = document.createElement('style');
    style.id = 'city-config-colors';
    style.textContent = `
        :root {
            --city: ${config.colors.city};
            --city-lt: ${config.colors.cityLt};
            --city-deep: ${config.colors.cityDeep};
        }
    `;
    // Insert early so it overrides defaults
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));
    }

    // ── Update page title and meta ──
    function updateMeta() {
        document.title = `City Mitra — ${config.name.en} Civic AI`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content',
                `City Mitra is your AI-powered civic assistant for ${config.name.en} district. Get instant info on tourism, officers, schemes, emergency contacts and more.`
            );
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateMeta);
    } else {
        updateMeta();
    }

    console.log(`[CityConfig] ✅ Loaded: ${config.name.en} (${config.id})`);
    console.log(`[CityConfig] Gov: ${config.govWebsite}`);
    console.log(`[CityConfig] Features:`, config.features);

})();
