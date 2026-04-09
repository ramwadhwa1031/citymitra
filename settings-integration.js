// ============================================
// SETTINGS INTEGRATION FOR MAIN CHAT
// Add this script to your index.html (script.js)
// ============================================

// Load and apply saved settings when page loads
document.addEventListener('DOMContentLoaded', function() {
    applySavedSettings();
});

function applySavedSettings() {
    const saved = localStorage.getItem('infobotSettings');
    if (!saved) return;
    
    const settings = JSON.parse(saved);
    
    // Apply Theme
    if (settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    }
    
    // Apply Width
    if (settings.width) {
        const container = document.getElementById('app-container') || document.querySelector('.max-w-screen-xl') || document.body;
        container.style.maxWidth = settings.width + '%';
    }
    
    // Apply Font Size
    if (settings.fontSize) {
        const sizes = {
            small: '12px',
            medium: '14px',
            large: '16px',
            xlarge: '18px'
        };
        document.documentElement.style.setProperty('--message-font-size', sizes[settings.fontSize]);
        document.querySelectorAll('.message-box').forEach(box => {
            box.style.fontSize = sizes[settings.fontSize];
        });
    }
    
    // Apply Accent Color
    if (settings.accentColor) {
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        const header = document.querySelector('.gradient-header');
        if (header) {
            header.style.background = `linear-gradient(135deg, ${settings.accentColor} 0%, ${lightenColor(settings.accentColor, 20)} 100%)`;
        }
    }
    
    // Apply Background
    if (settings.background) {
        const chatBg = document.querySelector('.wa-bg') || document.getElementById('messages-container')?.parentElement || document.body;
        
        if (settings.background === 'whatsapp') {
            chatBg.style.backgroundImage = "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')";
            chatBg.style.backgroundColor = '';
        } else if (settings.background === 'solid') {
            chatBg.style.backgroundImage = 'none';
            chatBg.style.backgroundColor = '#ffffff';
        } else if (settings.background === 'gradient') {
            chatBg.style.backgroundImage = 'linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 100%)';
            chatBg.style.backgroundColor = '';
        }
    }
    
    // Apply Bubble Style
    if (settings.bubbleStyle === 'sharp') {
        document.body.classList.add('bubble-sharp');
        // Hide triangles
        const style = document.createElement('style');
        style.textContent = `
            .triangle-left::before,
            .triangle-right::before {
                display: none !important;
            }
            .message-box {
                border-radius: 4px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Apply Animations
    if (settings.animations === false) {
        document.body.classList.add('no-animations');
        const style = document.createElement('style');
        style.textContent = `
            .no-animations * {
                transition: none !important;
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Apply Compact Mode
    if (settings.compact) {
        document.body.classList.add('compact-mode');
        const style = document.createElement('style');
        style.textContent = `
            .compact-mode .message-box {
                padding: 0.5rem 0.75rem !important;
                margin: 0.25rem 0 !important;
            }
            .compact-mode #messages-list {
                gap: 0.25rem !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Apply Timestamps
    if (settings.timestamps === false) {
        const style = document.createElement('style');
        style.textContent = `
            .message-time {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Apply Dark Mode Styles if needed
    if (document.body.classList.contains('dark-mode')) {
        const style = document.createElement('style');
        style.textContent = `
            body.dark-mode {
                background: #0b141a;
                color: #e9edef;
            }
            body.dark-mode .wa-bg {
                background-color: #0b141a;
            }
            body.dark-mode .message-box {
                box-shadow: 0 1px 0.5px rgba(255,255,255,0.1);
            }
            body.dark-mode .bg-\\[\\#d9fdd3\\] {
                background: #005c4b !important;
            }
            body.dark-mode .bg-white {
                background: #1f2c34 !important;
                color: #e9edef !important;
            }
            body.dark-mode input,
            body.dark-mode textarea {
                background: #1f2c34;
                color: #e9edef;
                border-color: #3b4a54;
            }
            body.dark-mode .text-gray-800,
            body.dark-mode .text-gray-700 {
                color: #e9edef !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Helper function
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
}

// ============================================
// ADD SETTINGS BUTTON TO MENU
// ============================================

// Add this HTML to your three-dot menu dropdown:
/*
<button onclick="window.location.href='settings.html'" class="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-100 transition text-left">
    <i data-lucide="settings" class="w-5 h-5"></i>
    <span id="menu-settings-text">Settings</span>
</button>
*/
