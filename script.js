// ============================================
// KURUKSHETRA INFOBOT - Main JavaScript File
// ============================================

// CONFIGURATION
const N8N_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/chat";
const FEEDBACK_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_Feed";
const GITA_WEBHOOK_URL = "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_AskGita";

// GLOBAL STATE
let currentLanguage = localStorage.getItem('preferred_language') || 'en';
let currentSetIndex = 0;
let rotationInterval;
let messages = JSON.parse(localStorage.getItem('kwr_chat_history')) || [];
let autocompleteData = { en: [], hi: [] };

// ============================================
// WHATSAPP ADAPTER INITIALIZATION
// ============================================
let whatsappAdapter = null;

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function () {
    try {
        whatsappAdapter = WhatsAppAdapter.init({
            baseUrl: window.location.origin,
            onShare: (data) => {
                console.log('✅ Content shared via WhatsApp:', data);
            }
        });

        console.log('✅ WhatsApp Adapter initialized successfully');
        console.log('📱 WhatsApp Available:', whatsappAdapter.isWhatsAppAvailable());
        console.log('📦 Adapter Version:', whatsappAdapter.version);

    } catch (error) {
        console.error('❌ WhatsApp Adapter initialization failed:', error);
    }
});
// TRANSLATIONS
const translations = {
    en: {
        title: "City Mitra",
        subtitle: "Kurukshetra's Civic AI · 24/7 Available",
        officialInfo: "Official Information",
        officialDesc: "All responses are sourced from",
        welcomeTitle: "Namaste!",
        welcomeText: "I'm City Mitra, your civic AI for Kurukshetra. Ask me about:",
        welcomeOfficers: "Officers & Departments",
        welcomeTourist: "Tourist Places & Heritage",
        welcomeServices: "Services & Schemes",
        welcomeDistrict: "District Information",
        welcomeEmergency: "Emergency Contacts",
        welcomeSuggestion: "Try the suggestions below to get started!",
        inputPlaceholder: "Ask me anything about Kurukshetra...",
        clearChat: "Clear chat",
        visitWebsite: "Visit Website",
        suggestions: "Suggestions",
        typing: "Typing...",
        menuFeedback: "Give Feedback",
        feedbackTitle: "Feedback Form",
        feedbackSubtitle: "Help us improve",
        feedbackPersonalInfo: "Personal Information",
        feedbackUsage: "Usage Information",
        feedbackPerformance: "Bot Performance",
        feedbackIssues: "Issues & Rating",
        feedbackAdditional: "Additional Feedback",
        feedbackSubmit: "Submit Feedback",
        feedbackSubmitting: "Submitting...",
        feedbackSuccess: "✅ Thank you for your feedback!",
        feedbackError: "❌ Failed to submit. Please try again."
    },
    hi: {
        title: "सिटी मित्र",
        subtitle: "कुरुक्षेत्र का नागरिक AI · 24/7 उपलब्ध",
        officialInfo: "आधिकारिक जानकारी",
        officialDesc: "सभी उत्तर यहाँ से प्राप्त किए गए हैं",
        welcomeTitle: "नमस्ते!",
        welcomeText: "मैं सिटी मित्र हूँ, कुरुक्षेत्र का आपका नागरिक AI। मुझसे पूछें:",
        welcomeOfficers: "अधिकारी और विभाग",
        welcomeTourist: "पर्यटन स्थल और विरासत",
        welcomeServices: "सेवाएं और योजनाएं",
        welcomeDistrict: "जिला जानकारी",
        welcomeEmergency: "आपातकालीन संपर्क",
        welcomeSuggestion: "शुरू करने के लिए नीचे दिए गए सुझाव आज़माएं!",
        inputPlaceholder: "कुरुक्षेत्र के बारे में कुछ भी पूछें...",
        clearChat: "चैट साफ़ करें",
        visitWebsite: "वेबसाइट पर जाएं",
        suggestions: "सुझाव",
        typing: "टाइप कर रहा है...",
        menuFeedback: "फीडबैक दें",
        feedbackTitle: "फीडबैक फॉर्म",
        feedbackSubtitle: "हमें बेहतर बनाने में मदद करें",
        feedbackPersonalInfo: "व्यक्तिगत जानकारी",
        feedbackUsage: "उपयोग की जानकारी",
        feedbackPerformance: "बॉट प्रदर्शन",
        feedbackIssues: "समस्याएं और रेटिंग",
        feedbackAdditional: "अतिरिक्त फीडबैक",
        feedbackSubmit: "फीडबैक सबमिट करें",
        feedbackSubmitting: "सबमिट हो रहा है...",
        feedbackSuccess: "✅ आपके फीडबैक के लिए धन्यवाद!",
        feedbackError: "❌ सबमिट विफल। कृपया पुनः प्रयास करें।"
    }
};

// ROTATING QUESTION SETS
const QUESTION_SETS = {
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
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();

    // Load autocomplete data
    await loadAutocompleteData();

    // Apply language on load
    updateUI();

    // Show or hide elements based on chat history
    if (messages.length > 0) {
        // Has chat history: hide welcome
        document.getElementById('welcome-message').style.display = 'none';
        const chipsEl = document.getElementById('chips-container');
        if (chipsEl) chipsEl.classList.add('hidden');
        stopRotation();
    } else {
        // No chat history: show welcome
        document.getElementById('welcome-message').style.display = '';
    }

    renderMessages();
    scrollToBottom();

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('autocomplete-dropdown');
        const input = document.getElementById('user-input');
        if (dropdown && input && e.target !== input && e.target !== dropdown) {
            dropdown.classList.add('hidden');
        }
    });
});
// ============================================
// SHARE APP INVITATION FUNCTION
// ============================================
function shareApp() {
    console.log('📱 Share App button clicked');

    if (!whatsappAdapter) {
        alert('WhatsApp sharing not available');
        return;
    }

    // Get current language
    const lang = currentLanguage || 'en';

    // Create invitation message based on language
    let inviteMessage;

    if (lang === 'hi') {
        inviteMessage = `🕉️ *City Mitra - AI Chatbot*

कुरुक्षेत्र की विरासत को डिजिटल रूप से खोजें!

✨ विशेषताएं:
- 90+ धरोहर स्थल
- भगवद गीता ज्ञान
- आपातकालीन संपर्क
- पर्यटन जानकारी
- द्विभाषी (हिंदी/अंग्रेजी)

🔗 अभी चैट करें:
${window.location.href}

_आध्यात्मिक विरासत का डिजिटल अनुभव!_ 🙏`;
    } else {
        inviteMessage = `🕉️ *City Mitra - AI Chatbot*

Discover Kurukshetra's heritage digitally!

✨ Features:
- 90+ Heritage Sites
- Bhagavad Gita Wisdom
- Emergency Contacts
- Tourism Information
- Bilingual (Hindi/English)

🔗 Chat now:
${window.location.href}

_Experience spiritual heritage digitally!_ 🙏`;
    }

    console.log('Sharing app invitation...');

    // Share via WhatsApp
    whatsappAdapter.share(inviteMessage);

    console.log('✅ App invitation shared');
}
// ============================================
// AUTOCOMPLETE FUNCTIONS
// ============================================

async function loadAutocompleteData() {
    try {
        const response = await fetch('autocomplete-data.json');
        autocompleteData = await response.json();
        console.log('Autocomplete data loaded:', autocompleteData);
    } catch (error) {
        console.error('Failed to load autocomplete data:', error);
        // Fallback to empty arrays if file doesn't exist
        autocompleteData = { en: [], hi: [] };
    }
}

function handleAutocomplete(event) {
    const input = event.target;
    const value = input.value.trim().toLowerCase();
    const dropdown = document.getElementById('autocomplete-dropdown');

    // Hide dropdown if input is empty or less than 2 characters
    if (value.length < 2) {
        dropdown.classList.add('hidden');
        return;
    }

    // Get suggestions based on current language
    const suggestions = getSuggestions(value);

    if (suggestions.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }

    // Render suggestions
    dropdown.innerHTML = suggestions.slice(0, 5).map(item => {
        const highlighted = highlightMatch(item.text, value);
        return `
            <div class="autocomplete-item" onclick="selectSuggestion('${escapeHtml(item.text)}')">
                <span class="text-lg">${item.icon}</span>
                <span class="text-sm">${highlighted}</span>
            </div>
        `;
    }).join('');

    dropdown.classList.remove('hidden');
}

function getSuggestions(query) {
    const data = autocompleteData[currentLanguage] || [];

    // Filter suggestions that match the query
    return data.filter(item =>
        item.text.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<span class="autocomplete-highlight">$1</span>');
}

function selectSuggestion(text) {
    document.getElementById('user-input').value = text;
    document.getElementById('autocomplete-dropdown').classList.add('hidden');
    document.getElementById('user-input').focus();
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

function renderMessages() {
    const container = document.getElementById('messages-list');
    if (!container) return;

    let html = '';

    // Date separator — always show with actual date
    const today = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    html += `<div class="dsep"><span>Today · ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}</span></div>`;

    // ── Welcome bot bubble — Only shown once chat begins to replace the Hero Card ──
    if (messages.length > 0) {
        const isHi = (typeof currentLanguage !== 'undefined' && currentLanguage === 'hi');
        const greeting = isHi
            ? '🙏 <strong>नमस्ते!</strong> मैं <em>कुरुक्षेत्र जिले</em> के लिए आपका समर्पित नागरिक सहायक हूँ — City Mitra द्वारा संचालित।<br><br>मुझसे पर्यटन स्थलों, सरकारी अधिकारियों, कल्याण योजनाओं, या आपातकालीन संपर्कों के बारे में पूछें। मैं 24×7 यहाँ हूँ।'
            : '🙏 <strong>Namaste!</strong> I\'m your dedicated civic assistant for <em>Kurukshetra district</em> — powered by City Mitra.<br><br>Ask me about tourist spots, government officers, welfare schemes, or emergency contacts. I\'m here 24×7.';

        const chipHeritage = isHi ? '🏛️ पर्यटन स्थल' : '🏛️ Tourist Places';
        const chipOfficers = isHi ? '👤 DC कौन हैं?' : '👤 Who is DC?';
        const chipEmergency = isHi ? '🚨 आपातकालीन नंबर' : '🚨 Emergency Numbers';
        const chipSchemes = isHi ? '📋 सरकारी योजनाएं' : '📋 Govt Schemes';
        const chipDistrict = isHi ? '📊 जिला जानकारी' : '📊 District Info';

        html += `<div class="ai-row new spaced">
            <div class="av"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
            <div class="ai-content">
                <div class="ai-sender">Kurukshetra Guide <span class="powered-badge">✦ City Mitra</span></div>
                <div class="bubble">
                    ${greeting}
                    <div class="qchips">
                        <div class="qc" onclick="handleChipClick('Tourist places in Kurukshetra')">${chipHeritage}</div>
                        <div class="qc" onclick="handleChipClick('Who is the DC of Kurukshetra?')">${chipOfficers}</div>
                        <div class="qc" onclick="handleChipClick('Emergency contacts Kurukshetra')">${chipEmergency}</div>
                        <div class="qc" onclick="handleChipClick('Government schemes in Kurukshetra')">${chipSchemes}</div>
                        <div class="qc" onclick="handleChipClick('District information Kurukshetra')">${chipDistrict}</div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    messages.forEach(function (msg, index) {
        const formattedContent = formatText(msg.content);

        if (msg.role === 'user') {
            // ── User bubble (brand style) ──
            html += `<div class="user-row new"><div class="ubub">${formattedContent}<div class="umeta">
                <svg viewBox="0 0 16 10" fill="none">
                    <path d="M1 5L5 9L15 1" stroke="rgba(255,255,255,0.45)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 5L10 9" stroke="rgba(255,255,255,0.3)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>${msg.time}</div></div></div>`;
        } else {
            // ── AI bubble (brand style) ──
            const cleanText = msg.content.replace(/<[^>]*>/g, '').replace(/"/g, '&quot;');
            const shareBtn = (typeof whatsappAdapter !== 'undefined' && whatsappAdapter) ?
                `<button class="share-btn" onclick="shareBotMessage(${index})"><i data-lucide="share-2"></i> Share</button>` : '';
            const listenBtn = `<button class="bubble-action-btn" onclick="speakText(this)" data-text="${cleanText}" title="Listen">
                <i data-lucide="volume-2"></i> Listen
            </button>`;

            html += `<div class="ai-row new spaced">
                <div class="av"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>
                <div class="ai-content">
                    <div class="ai-sender">Kurukshetra Guide <span class="powered-badge">✦ City Mitra</span></div>
                    <div class="bubble">
                        ${formattedContent}
                        <div class="bubble-actions">${listenBtn}${shareBtn}</div>
                    </div>
                    <div class="ai-time">${msg.time}</div>
                </div>
            </div>`;

            // Auto-detect context from last bot message for dynamic suggestions
            if (index === messages.length - 1 && typeof detectAndUpdateContext === 'function') {
                setTimeout(function () { detectAndUpdateContext(msg.content); }, 50);
            }
        }
    });

    container.innerHTML = html;

    // Render Lucide icons
    lucide.createIcons();
}

// ============================================
// SHARE BOT MESSAGE FUNCTION
// ============================================
function shareBotMessage(messageIndex) {
    console.log('📤 Sharing message index:', messageIndex);

    // Check if WhatsApp adapter is available
    if (!whatsappAdapter) {
        alert('WhatsApp sharing not available');
        console.error('whatsappAdapter is null');
        return;
    }

    // Get the message
    const msg = messages[messageIndex];
    if (!msg || msg.role !== 'bot') {
        console.error('Invalid message or not a bot message');
        return;
    }

    // Clean the message content (remove HTML tags and extra formatting)
    let cleanContent = msg.content
        .replace(/<[^>]*>/g, '')              // Remove HTML tags
        .replace(/\*\*/g, '*')                // Convert bold to single asterisk
        .replace(/#{1,6}\s/g, '')             // Remove markdown headers
        .replace(/\n\n+/g, '\n\n')            // Clean multiple line breaks
        .replace(/🔗\s*https?:\/\/[^\s]+/g, '') // Remove link URLs (keep text)
        .trim();

    // Limit length if too long
    if (cleanContent.length > 500) {
        cleanContent = cleanContent.substring(0, 497) + '...';
    }

    // Create shareable message with branding
    const shareMessage = `🕉️ *City Mitra*

${cleanContent}

💬 Chat with our bot: ${window.location.href}

_Discover Kurukshetra Heritage_`;

    console.log('📱 Sharing via WhatsApp:', shareMessage.substring(0, 100) + '...');

    // Share via WhatsApp
    try {
        whatsappAdapter.share(shareMessage);
        console.log('✅ Share triggered successfully');
    } catch (error) {
        console.error('❌ Share failed:', error);
        alert('Failed to share. Please try again.');
    }
}
function renderChips(skipAnimation = false) {
    const grid = document.getElementById('chips-grid');
    const titleEl = document.getElementById('chips-title');

    // Safety check
    if (!QUESTION_SETS[currentLanguage]) {
        currentLanguage = 'en';
    }

    if (currentSetIndex >= QUESTION_SETS[currentLanguage].length) {
        currentSetIndex = 0;
    }

    const currentSet = QUESTION_SETS[currentLanguage][currentSetIndex];

    if (!currentSet || !currentSet.questions) {
        console.error('Invalid question set');
        return;
    }

    if (skipAnimation) {
        titleEl.textContent = currentSet.title;
        grid.innerHTML = currentSet.questions.map(q => `
            <button onclick="handleChipClick('${q.text.replace(/'/g, "\\'")}')" 
                class="chip-button w-full bg-white text-[#008069] border-2 border-[#008069] px-3 py-2.5 rounded-xl text-sm shadow-md font-semibold hover:bg-[#008069] hover:text-white flex items-center justify-center gap-2">
                <span class="text-lg">${q.icon}</span>
                <span>${q.text}</span>
            </button>
        `).join('');
        grid.style.opacity = '1';
        titleEl.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
    } else {
        grid.style.opacity = '0';
        titleEl.style.opacity = '0';
        grid.style.transform = 'translateY(10px)';

        setTimeout(() => {
            titleEl.textContent = currentSet.title;
            grid.innerHTML = currentSet.questions.map(q => `
                <button onclick="handleChipClick('${q.text.replace(/'/g, "\\'")}')" 
                    class="chip-button w-full bg-white text-[#008069] border-2 border-[#008069] px-3 py-2.5 rounded-xl text-sm shadow-md font-semibold hover:bg-[#008069] hover:text-white flex items-center justify-center gap-2">
                    <span class="text-lg">${q.icon}</span>
                    <span>${q.text}</span>
                </button>
            `).join('');

            grid.style.transition = 'all 0.5s ease';
            titleEl.style.transition = 'all 0.5s ease';
            grid.style.opacity = '1';
            titleEl.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 300);
    }
}

function renderIndicators() {
    const container = document.getElementById('indicators');

    if (!QUESTION_SETS[currentLanguage]) {
        currentLanguage = 'en';
    }

    container.innerHTML = QUESTION_SETS[currentLanguage].map((_, index) => `
        <div onclick="jumpToQuestionSet(${index})" class="w-2 h-2 rounded-full transition-all cursor-pointer hover:scale-125 ${index === currentSetIndex ? 'bg-[#008069] w-6' : 'bg-gray-400'}"></div>
    `).join('');
}

function formatText(text) {
    if (!text) return '';

    // ── Pre-process: Clean up n8n's messy feedback/divider sections ──
    let cleaned = text;

    // Extract feedback URL before we strip the block
    let feedbackUrl = null;
    const fbMatch = cleaned.match(/Share your feedback[:\s]*(?:🔗\s*)?(https?:\/\/[^\s\n]+)/i);
    if (fbMatch) {
        feedbackUrl = fbMatch[1].replace(/[.,!;]+$/, '');
    }

    // Remove everything from the Unicode divider (───) to the end
    cleaned = cleaned.replace(/\n?[─━]{3,}[\s\S]*$/, '');

    // If there's no Unicode divider, try removing the feedback block directly
    cleaned = cleaned.replace(/\n?📊\s*\*?\*?Help us improve[\s\S]*$/i, '');

    // Clean up "Complete directory: URL" → clean text
    cleaned = cleaned.replace(/Complete directory[:\s]*(https?:\/\/[^\s\n]+)/gi, (_, url) => {
        const cleanUrl = url.replace(/[.,!;]+$/, '');
        return `📂 View directory: ${cleanUrl}`;
    });

    // Remove leftover --- dividers (3+ dashes on their own line)
    cleaned = cleaned.replace(/\n-{3,}\s*\n/g, '\n');
    cleaned = cleaned.replace(/\n-{3,}\s*$/g, '');

    // Trim trailing whitespace/empty lines
    cleaned = cleaned.trimEnd();

    // Add back the feedback link as a cleanly formatted markdown link
    if (feedbackUrl) {
        cleaned += `\n\n[📊 Share your feedback ↗](${feedbackUrl})`;
    }

    // ── AI Warning & Disclaimer formatting ──
    // Converts AI warning banners into a distinct highlighted block
    cleaned = cleaned.replace(/⚠️\s*AI-?Generated Information[^\n]*/gi, '<div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.2); border-left:3px solid #F59E0B; padding:8px 12px; border-radius:8px; display:flex; align-items:center; gap:8px; font-weight:600; color:#B45309; margin-bottom:12px; font-size:12.5px; box-shadow:0 1px 2px rgba(0,0,0,0.02);"><span style="font-size:16px; line-height:1;">⚠️</span> <span>AI-Generated Info (Unverified)</span></div>');
    
    // Converts 'Disclaimer: ...' into a soft red alert box
    cleaned = cleaned.replace(/^Disclaimer:\s*(.*)/gim, '<div style="background:rgba(239, 68, 68, 0.05); border:1px solid rgba(239, 68, 68, 0.15); border-left:3px solid #EF4444; padding:8px 12px; border-radius:8px; margin:14px 0 10px 0; font-size:12px; color:#B91C1C; line-height:1.5; box-shadow:0 1px 2px rgba(0,0,0,0.02);"><b>Disclaimer:</b> $1</div>');

    // ── Clean up messy URL footers and citations ──
    // Intercepts `--- https://url` or `https://url for more info` line-by-line
    cleaned = cleaned.replace(/^[-\s─]*((?:https?:\/\/[^\s\n<>]+[\s]*)+)(?:for more information.*)?$/gim, (match, urls) => {
        return '\n\n🌐 **Official Sources:**\n' + urls.trim();
    });

    // Remove any remaining stray dashes (e.g. "website: --- https://..." -> "website: https://...")
    cleaned = cleaned.replace(/[-─━]{2,}\s*(\[?https?:\/\/)/gi, '$1');

    // ── Pre-process raw HTML tags to protect them from regex destruction ──
    const htmlTags = [];
    cleaned = cleaned.replace(/<[^>]+>/g, (match) => {
        htmlTags.push(match);
        return `@@HTML_${htmlTags.length - 1}@@`;
    });

    const mdLinks = [];

    // ── Smart Interactive Links & Social Icons ──
    // Matches: • Title Name: [URL](URL)  OR  🔗 Title Name: URL  OR Title Name: --- URL
    cleaned = cleaned.replace(/^[\s•\-\*🔗🌐📞✉️🏢🌾🏥🚓🏛️💼▶️📷🐦📘]*([^:\n]+):\s*(?:[-─]+\s*)?(?:\[[^\]]+\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s<>"']+))/gm, (match, title, mdUrl, rawUrl) => {
        const cleanUrl = (mdUrl || rawUrl).replace(/[.,!;]+$/, '');
        
        let titleTrim = title.trim();
        // Strip markdown if the title itself has it (e.g. "[Agriculture](url)")
        titleTrim = titleTrim.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        // Strip any residual bolding markdown that LLM added since it's going into a badge
        titleTrim = titleTrim.replace(/\*\*/g, '');
        let titleLower = titleTrim.toLowerCase();
        
        // Smart Context-Aware Emojis
        let icon = '🔗';
        if (titleLower.includes('facebook')) icon = '📘';
        else if (titleLower.includes('twitter') || titleLower.includes(' x ') || titleLower === 'x') icon = '🐦';
        else if (titleLower.includes('youtube')) icon = '▶️';
        else if (titleLower.includes('instagram')) icon = '📷';
        else if (titleLower.includes('website') || titleLower.includes('portal')) icon = '🌐';
        else if (titleLower.includes('email') || titleLower.includes('mail')) icon = '✉️';
        else if (titleLower.includes('agriculture') || titleLower.includes('kendra')) icon = '🌾';
        else if (titleLower.includes('health') || titleLower.includes('medical') || titleLower.includes('hospital')) icon = '🏥';
        else if (titleLower.includes('police') || titleLower.includes('guard')) icon = '🚓';
        else if (titleLower.includes('tourism') || titleLower.includes('heritage')) icon = '🏛️';
        else if (titleLower.includes('employment') || titleLower.includes('office') || titleLower.includes('administration') || titleLower.includes('board')) icon = '💼';

        // Format as a sleek standalone inline button without bullet dots
        const cleanItem = `<a href="${cleanUrl}" target="_blank" style="display:inline-flex; align-items:center; gap:5px; color:var(--brand); text-decoration:none; font-weight:600; background:var(--brand-xlt); padding:1px 8px; border-radius:12px; font-size:13px; border:1px solid rgba(45, 70, 185, 0.12); margin-top:2px; margin-bottom:2px; transition:all 0.15s;">${icon} ${titleTrim}</a>`;
        
        mdLinks.push(cleanItem);
        return `@@MD_LINK_${mdLinks.length - 1}@@`;
    });

    // ── Original Markdown Links with Placeholders ──
    // Pattern: [display text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, linkText, url) => {
        const cleanUrl = url.replace(/[.,!;]+$/, '');
        let linkHtml = '';

        // If link text IS the URL itself (common in n8n), show just hostname
        if (linkText.startsWith('http')) {
            try {
                const hostname = new URL(cleanUrl).hostname.replace('www.', '');
                linkHtml = `<a href="${cleanUrl}" target="_blank" style="color:var(--brand);text-decoration:underline;text-underline-offset:2px;font-weight:500;word-break:break-all;">🔗 ${hostname}</a>`;
            } catch (e) {
                linkHtml = `<a href="${cleanUrl}" target="_blank" style="color:var(--brand);text-decoration:underline;">🔗 Link</a>`;
            }
        }
        // If it's the feedback link, make it slightly stand out
        else if (linkText.includes('Share your feedback')) {
            linkHtml = `<a href="${cleanUrl}" target="_blank" style="display:inline-flex; align-items:center; gap:4px; font-weight:600; color:var(--brand); text-decoration:none; padding-top:4px;">${linkText}</a>`;
        }
        // Otherwise show the display text as a normal link
        else {
            linkHtml = `🔗 <a href="${cleanUrl}" target="_blank" style="color:var(--brand);text-decoration:underline;text-underline-offset:2px;font-weight:500;">${linkText}</a>`;
        }

        mdLinks.push(linkHtml);
        return `@@MD_LINK_${mdLinks.length - 1}@@`;
    });

    // ── Original formatting logic ──

    // 1. Handle New Lines
    let formatted = cleaned.replace(/\n/g, '<br>');

    // 2. Auto-format Bullet Lists (e.g., "* Title: Desc" -> "• <b>Title</b>: Desc")
    formatted = formatted.replace(/(<br>|^)[\*\-\•]\s+([^:\<]+):/g, '$1• <b>$2</b>:');

    // 3. Upgrade basic bullets to Brand Emojis for Contact details
    formatted = formatted.replace(/• (<b>(?:Phone|Mobile|Contact|Call)<\/b>:?)/gi, '📞 $1');
    formatted = formatted.replace(/• (<b>(?:Email|Mail)<\/b>:?)/gi, '✉️ $1');
    formatted = formatted.replace(/• (<b>(?:Office|Address|Location)<\/b>:?)/gi, '🏢 $1');
    formatted = formatted.replace(/• (<b>(?:Website|Portal)<\/b>:?)/gi, '🌐 $1');

    // 4. Handle Bold (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // 3. Handle URLs — show clean hostname instead of giant raw URL
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    formatted = formatted.replace(urlRegex, (url) => {
        try {
            const cleanUrl = url.replace(/[.,!;]+$/, '');
            let displayText;
            try {
                const parsed = new URL(cleanUrl);
                const path = parsed.pathname.replace(/\/$/, '').split('/').pop() || '';
                const host = parsed.hostname.replace('www.', '');
                // Show "hostname/last-path-segment" for readability
                displayText = path && path !== '' ? `${host}/…/${path}` : host;
                if (displayText.length > 45) displayText = host;
            } catch (e) {
                displayText = cleanUrl.length > 50 ? cleanUrl.substring(0, 47) + '...' : cleanUrl;
            }
            return `<a href="${cleanUrl}" target="_blank" style="color:var(--brand);text-decoration:underline;text-underline-offset:2px;font-weight:500;word-break:break-all;">🔗 ${displayText}</a>`;
        } catch (e) {
            return `<a href="${url}" target="_blank" style="color:var(--brand);text-decoration:underline;">🔗 Link</a>`;
        }
    });

    // 4. Handle Italics (_text_)
    formatted = formatted.replace(/(^|\s)_(.*?)_(\s|$)/g, '$1<i>$2</i>$3');

    // 5. Restore Markdown Links back from Placeholders
    formatted = formatted.replace(/@@MD_LINK_(\d+)@@/g, (match, index) => {
        return mdLinks[parseInt(index)] || match;
    });

    // 6. Restore HTML tags
    formatted = formatted.replace(/@@HTML_(\d+)@@/g, (match, index) => {
        return htmlTags[parseInt(index)] || match;
    });

    return formatted;
}

// ============================================
// ROTATION FUNCTIONS (MANUAL ONLY)
// ============================================

function nextQuestionSet() {
    currentSetIndex = (currentSetIndex + 1) % QUESTION_SETS[currentLanguage].length;
    renderChips();
    renderIndicators();
    lucide.createIcons();
}

function previousQuestionSet() {
    currentSetIndex = (currentSetIndex - 1 + QUESTION_SETS[currentLanguage].length) % QUESTION_SETS[currentLanguage].length;
    renderChips();
    renderIndicators();
    lucide.createIcons();
}

function jumpToQuestionSet(index) {
    currentSetIndex = index;
    renderChips();
    renderIndicators();
    lucide.createIcons();
}

function rotateQuestions() {
    // Kept for compatibility but not used for auto-rotation
    nextQuestionSet();
}

function startRotation() {
    // Auto-rotation disabled - manual navigation only
    // Function kept for compatibility
}

function stopRotation() {
    if (rotationInterval) {
        clearInterval(rotationInterval);
    }
}

function toggleChipsVisibility() {
    const chipsContainer = document.getElementById('chips-container');
    const toggleBtn = document.getElementById('toggle-chips-btn');
    const btnText = document.getElementById('suggestions-btn-text');

    if (chipsContainer.classList.contains('hidden')) {
        // CHIPS ARE HIDDEN → Show them
        currentSetIndex = 0;
        renderChips(true);
        renderIndicators();
        chipsContainer.classList.remove('hidden');  // Show chips
        btnText.textContent = currentLanguage === 'hi' ? 'छुपाएं' : 'Hide'; // Change text
        // No auto-rotation - manual only
    } else {
        // CHIPS ARE VISIBLE → Hide them
        chipsContainer.classList.add('hidden');     // Hide chips
        btnText.textContent = currentLanguage === 'hi' ? 'सुझाव' : 'Suggestions'; // Reset text
        stopRotation();
    }

    lucide.createIcons();
}

// ============================================
// LANGUAGE FUNCTIONS
// ============================================

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'hi' : 'en';
    localStorage.setItem('preferred_language', currentLanguage);
    updateVoiceLanguage(currentLanguage);
    currentSetIndex = 0;
    updateUI();
    renderChips();
    renderIndicators();

    // Re-render chat area context (Welcome or Chat history)
    if (typeof renderMessages === 'function') {
        renderMessages();
    }

    // Refresh dynamic footer context based on the current last message (if any)
    if (typeof detectAndUpdateContext === 'function') {
        const lastMsgObj = messages.length > 0 ? messages[messages.length - 1] : null;
        if (lastMsgObj && lastMsgObj.role === 'bot') {
            detectAndUpdateContext(lastMsgObj.content);
        } else {
            detectAndUpdateContext(""); // Triggers the default welcome chips in the active language
        }
    }
}

function updateUI() {
    const t = translations[currentLanguage];

    // Update header — brand bar style
    const headerTitleEl = document.getElementById('header-title');
    if (headerTitleEl) {
        headerTitleEl.textContent = t.title;
    }
    const headerSubEl = document.getElementById('header-subtitle');
    if (headerSubEl) {
        headerSubEl.textContent = currentLanguage === 'hi' ? 'नागरिक AI प्लेटफॉर्म' : 'Civic AI Platform';
    }
    const langFlagEl = document.getElementById('lang-flag');
    if (langFlagEl) langFlagEl.textContent = currentLanguage === 'en' ? '🇬🇧' : '🇮🇳';
    const langCodeEl = document.getElementById('lang-code');
    if (langCodeEl) langCodeEl.textContent = currentLanguage.toUpperCase();

    // Update official info badge (safely)
    const oitEl = document.getElementById('official-info-title');
    if (oitEl) oitEl.textContent = t.officialInfo;
    const oidEl = document.getElementById('official-info-desc');
    if (oidEl) oidEl.textContent = t.officialDesc;

    // Update welcome — brand hero uses different structure
    const wtEl = document.getElementById('welcome-title');
    if (wtEl) {
        wtEl.innerHTML = currentLanguage === 'hi' ? 'कुरुक्षेत्र<br><em id="welcome-subtitle">नागरिक गाइड</em>' : 'Kurukshetra<br><em id="welcome-subtitle">Civic Guide</em>';
    }
    const wTextEl = document.getElementById('welcome-text');
    if (wTextEl) {
        wTextEl.innerHTML = currentLanguage === 'hi'
            ? 'मैं <strong>सिटी मित्र</strong> हूँ, कुरुक्षेत्र जिले का आपका बुद्धिमान साथी। विरासत खोजें, अधिकारियों से जुड़ें, सेवाओं तक पहुंचें — सब एक ही जगह।'
            : 'I\'m <strong>City Mitra</strong>, your intelligent companion for Kurukshetra district. Explore heritage, connect with officials, access services — all in one place.';
    }
    const woEl = document.getElementById('welcome-officers');
    if (woEl) woEl.textContent = currentLanguage === 'hi' ? '👤 अधिकारी' : '👤 Officers';
    const wtouristEl = document.getElementById('welcome-tourist');
    if (wtouristEl) wtouristEl.textContent = currentLanguage === 'hi' ? '🏛️ विरासत' : '🏛️ Heritage';
    const wsEl = document.getElementById('welcome-services');
    if (wsEl) wsEl.textContent = currentLanguage === 'hi' ? '📋 योजनाएं' : '📋 Schemes';
    const wdEl = document.getElementById('welcome-district');
    if (wdEl) wdEl.textContent = currentLanguage === 'hi' ? '📊 जिला' : '📊 District';
    const weEl = document.getElementById('welcome-emergency');
    if (weEl) weEl.textContent = currentLanguage === 'hi' ? '🚨 आपातकालीन' : '🚨 Emergency';
    const wSugEl = document.getElementById('welcome-suggestion');
    if (wSugEl) wSugEl.textContent = currentLanguage === 'hi' ? t.welcomeSuggestion : t.welcomeSuggestion;

    // Update input placeholder
    const inputEl = document.getElementById('user-input');
    if (inputEl) inputEl.placeholder = t.inputPlaceholder;

    // Update menu items (safely)
    const mfEl = document.getElementById('menu-feedback-text');
    if (mfEl) mfEl.textContent = t.menuFeedback;
    const mcEl = document.getElementById('menu-clear');
    if (mcEl) mcEl.textContent = t.clearChat;
    const mvEl = document.getElementById('menu-visit');
    if (mvEl) mvEl.textContent = t.visitWebsite;

    // Update suggestions button (safely)
    const sbtEl = document.getElementById('suggestions-btn-text');
    if (sbtEl) sbtEl.textContent = t.suggestions;

    // Update feedback modal (safely)
    if (document.getElementById('feedback-title')) {
        document.getElementById('feedback-title').textContent = t.feedbackTitle;
        document.getElementById('feedback-subtitle').textContent = t.feedbackSubtitle;
        document.getElementById('feedback-personal-info').textContent = t.feedbackPersonalInfo;
        document.getElementById('feedback-usage').textContent = t.feedbackUsage;
        document.getElementById('feedback-performance').textContent = t.feedbackPerformance;
        document.getElementById('feedback-issues').textContent = t.feedbackIssues;
        document.getElementById('feedback-additional').textContent = t.feedbackAdditional;
        document.getElementById('feedback-submit-text').textContent = t.feedbackSubmit;
    }
}

// ============================================
// GITA DETECTION
// ============================================

function isGitaQuery(text) {
    const lowerText = text.toLowerCase();

    // Exclude keywords - these indicate NOT a Gita query
    const excludeKeywords = [
        'anubhav', 'kendra', 'museum', 'experience center', 'experience centre',
        'visit', 'timings', 'ticket', 'entry fee', 'location', 'jyotisar', 'address',
        'अनुभव', 'केंद्र', 'संग्रहालय', 'समय', 'टिकट'
    ];

    // If query contains exclude keywords, it's NOT a Gita query
    const hasExclude = excludeKeywords.some(keyword => lowerText.includes(keyword));
    if (hasExclude) {
        console.log('❌ Not a Gita query (contains tourism/museum keywords)');
        return false;
    }

    // Core Gita keywords (most specific)
    const coreGitaKeywords = [
        'gita', 'geeta', 'bhagavad', 'bhagwad',
        'गीता', 'भगवद'
    ];

    // If has core Gita keywords, it's definitely a Gita query
    const hasCore = coreGitaKeywords.some(keyword => lowerText.includes(keyword));
    if (hasCore) {
        console.log('✅ Gita query detected (core keywords)');
        return true;
    }

    // Spiritual/philosophical keywords (require additional Gita context)
    const spiritualKeywords = [
        'karma yoga', 'bhakti yoga', 'jnana yoga', 'dhyana yoga',
        'shlok', 'verse', 'chapter', 'अध्याय', 'श्लोक',
        'dharma', 'moksha', 'atman',
        'धर्म', 'मोक्ष', 'आत्मा',
        'कर्म योग', 'भक्ति योग', 'ज्ञान योग', 'ध्यान योग'
    ];

    // Character names (only Gita query if asking about teachings)
    const characterKeywords = [
        'krishna', 'arjuna', 'arjun',
        'कृष्ण', 'अर्जुन', 'भगवान'
    ];

    // Epic keywords (NOT Gita unless combined with core)
    const epicKeywords = [
        'mahabharata', 'mahabharat', 'महाभारत'
    ];

    // Check spiritual keywords
    const hasSpiritual = spiritualKeywords.some(keyword => lowerText.includes(keyword));
    if (hasSpiritual) {
        console.log('✅ Gita query detected (spiritual keywords)');
        return true;
    }

    // Check character keywords (but exclude if asking about places/history)
    const hasCharacter = characterKeywords.some(keyword => lowerText.includes(keyword));
    if (hasCharacter) {
        // Exclude if asking about temples, places, history
        const placeKeywords = ['temple', 'mandir', 'place', 'statue', 'मंदिर', 'स्थान', 'मूर्ति'];
        const hasPlace = placeKeywords.some(keyword => lowerText.includes(keyword));

        if (!hasPlace) {
            console.log('✅ Gita query detected (character with teachings context)');
            return true;
        }
    }

    // Epic keywords alone do NOT make it a Gita query
    const hasEpic = epicKeywords.some(keyword => lowerText.includes(keyword));
    if (hasEpic) {
        console.log('❌ Not a Gita query (Mahabharat without Gita context)');
        return false;
    }

    // Check for standalone "yoga" (too generic, exclude)
    if (lowerText === 'yoga' || lowerText === 'योग') {
        console.log('❌ Not a Gita query (generic yoga)');
        return false;
    }

    console.log('❌ Not a Gita query (no matching keywords)');
    return false;
}

// ============================================
// MESSAGE HANDLING
// ============================================

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
}

function handleChipClick(text) {
    document.getElementById('user-input').value = text;
    const acDropdown = document.getElementById('autocomplete-dropdown');
    if (acDropdown) acDropdown.classList.add('hidden');
    const chipsEl = document.getElementById('chips-container');
    if (chipsEl) chipsEl.classList.add('hidden');
    stopRotation();
    sendMessage();
}

// ============================================
// FIXED sendMessage() FUNCTION
// Better error handling and JSON parsing
// ============================================

async function sendMessage() {
    const inputEl = document.getElementById('user-input');
    const text = inputEl.value.trim();
    if (!text) return;

    // Hide autocomplete
    const acDropdown = document.getElementById('autocomplete-dropdown');
    if (acDropdown) acDropdown.classList.add('hidden');

    // Hide welcome message after first interaction
    document.getElementById('welcome-message').style.display = 'none';

    // Hide chips container after sending message (safely)
    const chipsEl = document.getElementById('chips-container');
    if (chipsEl) chipsEl.classList.add('hidden');

    // Stop rotation after first message
    stopRotation();

    // Detect if this is a Gita query
    const isGita = isGitaQuery(text);
    const webhookUrl = isGita ? GITA_WEBHOOK_URL : N8N_WEBHOOK_URL;

    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('Message:', text);
    console.log('Language:', currentLanguage);
    console.log('Is Gita Query:', isGita);
    console.log('Webhook URL:', webhookUrl);
    console.log('========================');

    // Add User Message
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messages.push({ role: 'user', content: text, time: time });
    saveChat();
    renderMessages();
    scrollToBottom();
    inputEl.value = '';

    // Immediately update suggestions context to match user's action
    if (typeof detectAndUpdateContext === 'function') {
        detectAndUpdateContext(text);
    }

    // Show Loading
    document.getElementById('loading-indicator').classList.remove('hidden');
    document.getElementById('chips-container').classList.add('hidden');
    scrollToBottom();

    try {
        // Call appropriate webhook (Gita or District)
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: text,  // Gita webhook uses 'question'
                message: text,   // District webhook uses 'message'
                language: currentLanguage
            })
        });

        console.log('Response status:', response.status, response.statusText);

        // FIX 1: CHECK HTTP STATUS FIRST
        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // FIX 2: SAFE JSON PARSING
        let data;
        try {
            const responseText = await response.text();
            console.log('Raw response length:', responseText.length);
            console.log('Raw response:', responseText.substring(0, 200));

            if (!responseText || responseText.trim() === '') {
                throw new Error('Empty response from server');
            }

            data = JSON.parse(responseText);
            console.log('Parsed data:', data);

        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            throw new Error('Invalid response format from server');
        }

        // EXTRACT BOT RESPONSE
        let botContent;


        if (isGita) {
            botContent = data.answer || data.response || data.text || null;
            if (!botContent) throw new Error('Invalid Gita response format');

            botContent = botContent.trim().replace(/\|\|\s*$/, '');

            // The &zwnj; (Zero-Width Non-Joiner) is an invisible wall 
            // that stops formatting tags from connecting.
            const disclaimer = currentLanguage === 'hi'
                ? '\n\n&zwnj;_यह AI द्वारा उत्पन्न प्रतिक्रिया है। कृपया विद्वानों से सत्यापन करें।_'
                : '\n\n&zwnj;_This is an AI-generated response. Please verify with scholars._';

            botContent = `📖 **Gita Wisdom**\n\n${botContent}${disclaimer}`;
        } else {
            // District webhook returns array or object
            if (Array.isArray(data)) {
                botContent = data[0]?.response || data[0]?.text || null;
            } else {
                botContent = data.response || data.text || data.message || null;
            }

            if (!botContent) {
                console.error('District response missing response field:', data);
                throw new Error('Invalid district response format');
            }
        }

        const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        messages.push({ role: 'bot', content: botContent, time: botTime });
        saveChat();

        console.log('✅ Message sent successfully');

    } catch (error) {
        console.error('❌ Error in sendMessage:', error);
        const errorTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let errorMessage;
        if (error.message.includes('Empty response')) {
            errorMessage = currentLanguage === 'hi' ? '⚠️ सर्वर से कोई उत्तर नहीं मिला।' : '⚠️ No response from server.';
        } else if (error.message.includes('Invalid response format') || error.message.includes('JSON')) {
            errorMessage = currentLanguage === 'hi' ? '⚠️ सर्वर ने अमान्य प्रतिक्रिया भेजी।' : '⚠️ Server sent invalid response.';
        } else if (error.name === 'TypeError') {
            errorMessage = currentLanguage === 'hi' ? '⚠️ इंटरनेट कनेक्शन की जांच करें।' : '⚠️ Check internet connection.';
        } else {
            errorMessage = currentLanguage === 'hi' ? `⚠️ कुछ गलत हो गया।` : `⚠️ Something went wrong.`;
        }

        messages.push({ role: 'bot', content: errorMessage, time: errorTime });
        saveChat();

    } finally {
        document.getElementById('loading-indicator').classList.add('hidden');

        // Detect context from last bot response for dynamic suggestions
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'bot' && typeof detectAndUpdateContext === 'function') {
                detectAndUpdateContext(lastMsg.content);
            }
        }

        lucide.createIcons();
        renderMessages();
        scrollToBottom();
    }
}

// ============================================
// DEBUGGING HELPER FUNCTION
// ============================================

// Add this to help debug webhook responses
function debugWebhookResponse(response, data) {
    console.log('=== WEBHOOK RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Data type:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Data keys:', Object.keys(data || {}));
    console.log('Full data:', JSON.stringify(data, null, 2));
    console.log('============================');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function saveChat() {
    localStorage.setItem('kwr_chat_history', JSON.stringify(messages));
}

function clearChat() {
    if (confirm("🗑️ Delete all chat history?")) {
        // Clear data
        messages = [];
        localStorage.removeItem('kwr_chat_history');

        // Reset UI state — show welcome hero again
        document.getElementById('welcome-message').style.display = '';

        // Reset default suggestions
        if (typeof updateDynamicSuggestions === 'function') {
            updateDynamicSuggestions([
                '🛕 Temples', '📞 DC Office', '🌾 Schemes', '🚑 Helplines', '🗓️ Best Time'
            ]);
        }

        // Render empty messages (will clear the chat display)
        renderMessages();

        // Close menu
        toggleMenu();

        // Recreate icons
        lucide.createIcons();
    }
}

function toggleMenu() {
    const menu = document.getElementById('menu-dropdown');

    if (!menu) {
        console.error('Menu not found');
        return;
    }

    console.log('Toggle menu clicked - Current state:', menu.classList.contains('hidden') ? 'hidden' : 'visible');

    menu.classList.toggle('hidden');

    console.log('New state:', menu.classList.contains('hidden') ? 'hidden' : 'visible');

    // Refresh Lucide icons if menu is now visible
    if (!menu.classList.contains('hidden')) {
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 50);
    }
}
// ============================================
// CLICK OUTSIDE TO CLOSE MENU
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const menu = document.getElementById('menu-dropdown');
    const menuButton = document.querySelector('button[onclick="toggleMenu()"]');

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!menu.classList.contains('hidden')) {
            if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
                menu.classList.add('hidden');
            }
        }
    });

    // Close menu when clicking on menu items
    const menuItems = menu.querySelectorAll('button, a');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            menu.classList.add('hidden');
        });
    });
});

// BONUS: Close with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const menu = document.getElementById('menu-dropdown');
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    }
});
function scrollToBottom() {
    const container = document.getElementById('chat-container');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}
// TEXT-TO-SPEECH FEATURE
let currentSpeech = null;
let isSpeaking = false;

function speakText(button) {
    const text = button.getAttribute('data-text');
    if (!text) return;

    const cleanText = text.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').trim();

    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        lucide.createIcons();
        return;
    }

    currentSpeech = new SpeechSynthesisUtterance(cleanText);
    currentSpeech.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    currentSpeech.rate = 0.9;

    button.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i>';
    button.classList.add('text-red-500');
    lucide.createIcons();

    currentSpeech.onstart = () => isSpeaking = true;
    currentSpeech.onend = () => {
        isSpeaking = false;
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        button.classList.remove('text-red-500');
        lucide.createIcons();
    };

    window.speechSynthesis.speak(currentSpeech);
}
