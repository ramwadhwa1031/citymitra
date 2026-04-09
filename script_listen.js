// ============================================
// TEXT-TO-SPEECH FEATURE - Listen Icon
// Add this to your script.js
// ============================================

// Global variable for speech synthesis
let currentSpeech = null;
let isSpeaking = false;

// ============================================
// MODIFIED addMessage() FUNCTION
// Find your existing addMessage() function and update it to include the listen button
// ============================================

function addMessage(text, isUser) {
    const container = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    
    if (isUser) {
        // User message (no changes)
        messageDiv.className = 'flex justify-end';
        messageDiv.innerHTML = `
            <div class="bg-[#d9fdd3] text-gray-800 px-4 py-2 rounded-lg max-w-[75%] shadow-sm message-box triangle-right relative text-sm">
                ${text}
            </div>
        `;
    } else {
        // Bot message (ADD LISTEN BUTTON)
        messageDiv.className = 'flex justify-start';
        messageDiv.innerHTML = `
            <div class="bg-white text-gray-800 px-4 py-2 rounded-lg max-w-[75%] shadow-sm message-box triangle-left relative text-sm">
                <!-- Listen Button (NEW!) -->
                <div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                    <span class="text-xs font-semibold text-[#008069]">Response</span>
                    <button onclick="speakText(this)" class="listen-btn text-gray-500 hover:text-[#008069] transition-all p-1 rounded hover:bg-gray-100" title="Listen to response" data-text="${text.replace(/"/g, '&quot;')}">
                        <i data-lucide="volume-2" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <!-- Message Content -->
                <div class="message-content">
                    ${text}
                </div>
            </div>
        `;
    }
    
    container.appendChild(messageDiv);
    
    // Initialize Lucide icons for new elements
    lucide.createIcons();
    
    // Scroll to bottom
    scrollToBottom();
}

// ============================================
// TEXT-TO-SPEECH FUNCTION
// ============================================

function speakText(button) {
    // Get text from data attribute
    const text = button.getAttribute('data-text');
    
    if (!text) {
        console.error('No text to speak');
        return;
    }
    
    // Clean HTML from text
    const cleanText = stripHTML(text);
    
    // Check if already speaking this text
    if (isSpeaking && currentSpeech) {
        // Stop current speech
        window.speechSynthesis.cancel();
        isSpeaking = false;
        currentSpeech = null;
        
        // Reset button icon to volume
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        lucide.createIcons();
        return;
    }
    
    // Create new speech
    currentSpeech = new SpeechSynthesisUtterance(cleanText);
    
    // Set language based on current UI language
    currentSpeech.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
    
    // Speech settings
    currentSpeech.rate = 0.9;  // Slightly slower for clarity
    currentSpeech.pitch = 1;
    currentSpeech.volume = 1;
    
    // Change icon to stop while speaking
    button.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i>';
    button.classList.add('text-red-500');
    lucide.createIcons();
    
    // Event: When speech starts
    currentSpeech.onstart = function() {
        isSpeaking = true;
        console.log('🔊 Started speaking');
    };
    
    // Event: When speech ends
    currentSpeech.onend = function() {
        isSpeaking = false;
        currentSpeech = null;
        
        // Reset button icon
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        button.classList.remove('text-red-500');
        lucide.createIcons();
        
        console.log('✅ Finished speaking');
    };
    
    // Event: If speech errors
    currentSpeech.onerror = function(e) {
        console.error('Speech error:', e);
        isSpeaking = false;
        currentSpeech = null;
        
        // Reset button
        button.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
        button.classList.remove('text-red-500');
        lucide.createIcons();
    };
    
    // Start speaking
    window.speechSynthesis.speak(currentSpeech);
}

// ============================================
// HELPER FUNCTION - Strip HTML tags
// ============================================

function stripHTML(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// ============================================
// STOP ALL SPEECH (Optional - for cleanup)
// ============================================

function stopAllSpeech() {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        currentSpeech = null;
    }
}

// Stop speech when page unloads
window.addEventListener('beforeunload', stopAllSpeech);
