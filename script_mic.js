// ============================================
// VOICE INPUT FUNCTIONALITY - ADD THIS TO YOUR script.js
// ============================================

// Voice recognition variables
let recognition = null;
let isRecording = false;

// Initialize Speech Recognition (runs on page load)
function initVoiceInput() {
    // Check browser support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configuration
        recognition.continuous = false;          // Stop after one result
        recognition.interimResults = false;      // Only final results
        recognition.maxAlternatives = 1;         // One result only
        
        // Set language based on current UI language
        recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        
        // Event listeners
        recognition.onstart = handleRecognitionStart;
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.onend = handleRecognitionEnd;
        
        // Attach click event to mic button
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) {
            micBtn.addEventListener('click', toggleVoiceInput);
        }
        
        console.log('✅ Voice input initialized');
    } else {
        console.warn('⚠️ Speech recognition not supported in this browser');
        // Hide mic button if not supported
        const micBtn = document.getElementById('mic-btn');
        if (micBtn) {
            micBtn.style.display = 'none';
        }
    }
}

// Toggle voice input on/off
function toggleVoiceInput() {
    if (!recognition) {
        showToast('Voice input not supported', 'error');
        return;
    }
    
    if (isRecording) {
        // Stop recording
        recognition.stop();
        isRecording = false;
    } else {
        // Start recording
        try {
            // Update language before starting
            recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
            recognition.start();
            isRecording = true;
        } catch (error) {
            console.error('Voice input error:', error);
            showToast('Failed to start voice input', 'error');
        }
    }
}

// When recording starts
function handleRecognitionStart() {
    console.log('🎤 Voice recording started');
    const micBtn = document.getElementById('mic-btn');
    const indicator = document.getElementById('voice-indicator');
    
    // Visual feedback
    micBtn.classList.add('recording');
    
    // Show indicator
    indicator.textContent = currentLanguage === 'hi' ? 'सुन रहा हूँ...' : 'Listening...';
    indicator.classList.add('show');
}

// When speech is recognized
function handleRecognitionResult(event) {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;
    
    console.log('📝 Recognized:', transcript, 'Confidence:', confidence);
    
    // Put text in input field
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.value = transcript;
        inputField.focus();
    }
    
    // Show success toast
    showToast(
        currentLanguage === 'hi' ? 
        `"${transcript}" लिखा गया` : 
        `"${transcript}" recognized`,
        'success'
    );
    
    // Auto-send if confidence is high (optional - uncomment to enable)
    // if (confidence > 0.8) {
    //     setTimeout(() => sendMessage(), 500);
    // }
}

// When there's an error
function handleRecognitionError(event) {
    console.error('❌ Voice recognition error:', event.error);
    
    const micBtn = document.getElementById('mic-btn');
    const indicator = document.getElementById('voice-indicator');
    
    // Remove recording state
    micBtn.classList.remove('recording', 'listening');
    indicator.classList.remove('show');
    isRecording = false;
    
    // Show error message
    let errorMessage = 'Voice input failed';
    
    switch(event.error) {
        case 'no-speech':
            errorMessage = currentLanguage === 'hi' ? 
                'कोई आवाज़ नहीं सुनी गई' : 
                'No speech detected';
            break;
        case 'audio-capture':
            errorMessage = currentLanguage === 'hi' ? 
                'माइक्रोफोन नहीं मिला' : 
                'Microphone not found';
            break;
        case 'not-allowed':
            errorMessage = currentLanguage === 'hi' ? 
                'माइक्रोफोन की अनुमति नहीं' : 
                'Microphone permission denied';
            break;
        case 'network':
            errorMessage = currentLanguage === 'hi' ? 
                'नेटवर्क त्रुटि' : 
                'Network error';
            break;
    }
    
    showToast(errorMessage, 'error');
}

// When recording ends
function handleRecognitionEnd() {
    console.log('🔴 Voice recording ended');
    
    const micBtn = document.getElementById('mic-btn');
    const indicator = document.getElementById('voice-indicator');
    
    // Remove recording state
    micBtn.classList.remove('recording', 'listening');
    indicator.classList.remove('show');
    isRecording = false;
}

// Update language when user switches UI language
function updateVoiceLanguage(lang) {
    if (recognition) {
        recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
        console.log('🌐 Voice language updated to:', recognition.lang);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast if doesn't exist
    let toast = document.getElementById('voice-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'voice-toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set message and color
    toast.textContent = message;
    toast.style.background = type === 'error' ? 
        'rgba(239, 68, 68, 0.9)' : 
        type === 'success' ? 
        'rgba(34, 197, 94, 0.9)' : 
        'rgba(0, 0, 0, 0.8)';
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initVoiceInput();
});

// ============================================
// MODIFY EXISTING toggleLanguage() FUNCTION
// Add this line inside your existing toggleLanguage() function:
// ============================================
// updateVoiceLanguage(currentLanguage);
