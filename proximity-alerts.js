// ==========================================
// CITYMITRA PROXIMITY ALERTS (GEO-FENCING)
// Adapted for City Mitra Brand Design System
// ==========================================

// 1. Initialize state
let touristSites = [];
const notifiedSites = new Set();
let locationWatchId = null;
const NEARBY_STORAGE_KEY = 'cityMitra_nearbyAlerts';

// 2. Fetch sites.json on load
async function loadTouristSites() {
    try {
        const response = await fetch('sites.json');
        if (!response.ok) throw new Error("Network response was not ok");
        touristSites = await response.json();
        console.log(`✅ Successfully loaded ${touristSites.length} sites from sites.json!`);

        // After data loads, restore saved state
        restoreNearbyAlertState();
    } catch (error) {
        console.error("❌ Error loading sites.json:", error);
    }
}

// Load immediately
loadTouristSites();

// 3. Restore state from localStorage on page load
function restoreNearbyAlertState() {
    const savedState = localStorage.getItem(NEARBY_STORAGE_KEY);
    if (savedState === 'enabled') {
        const toggle = document.getElementById('location-toggle');
        if (toggle) {
            toggle.checked = true;
            // Only auto-start if we have sites loaded
            if (touristSites.length > 0) {
                startLocationTracking();
            }
        }
    }
}

// 4. Toggle — connected to UI switch
function toggleLocationAlerts() {
    const toggle = document.getElementById('location-toggle');
    if (!toggle) return;
    const isEnabled = toggle.checked;

    if (isEnabled) {
        if (touristSites.length === 0) {
            addProximitySystemMessage("⚠️ Still loading site data, please try again in a moment.");
            toggle.checked = false;
            return;
        }
        // Persist state
        localStorage.setItem(NEARBY_STORAGE_KEY, 'enabled');
        startLocationTracking();
    } else {
        // Persist state
        localStorage.setItem(NEARBY_STORAGE_KEY, 'disabled');
        stopLocationTracking();
    }
}

// 5. Start GPS tracking
function startLocationTracking() {
    if ("geolocation" in navigator) {
        addProximitySystemMessage("📍 Nearby alerts enabled! Searching for satellites...");
        console.log("GPS: Requesting location...");

        locationWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                console.log(`GPS: Location found! Lat: ${userLat}, Lng: ${userLng}`);
                console.log(`GPS: Accuracy: ${position.coords.accuracy}m`);
                checkProximity(userLat, userLng);
            },
            (error) => {
                console.error("GPS ERROR:", error.message);
                addProximitySystemMessage(`⚠️ Location error: ${error.message}`);
                const toggle = document.getElementById('location-toggle');
                if (toggle) toggle.checked = false;
                localStorage.setItem(NEARBY_STORAGE_KEY, 'disabled');
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 27000 }
        );
    } else {
        addProximitySystemMessage("⚠️ Geolocation is not supported by your browser.");
        const toggle = document.getElementById('location-toggle');
        if (toggle) toggle.checked = false;
        localStorage.setItem(NEARBY_STORAGE_KEY, 'disabled');
    }
}

// 6. Stop tracking
function stopLocationTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
        addProximitySystemMessage("🔕 Nearby alerts disabled.");
    }
}

// 7. Core proximity check
function checkProximity(userLat, userLng) {
    console.log("--- Checking Proximity ---");

    touristSites.forEach(site => {
        const distance = calculateDistance(userLat, userLng, site.lat, site.lng);
        console.log(`Checking ${site.name}: ${distance.toFixed(2)} KM (radius: ${site.radius_km} KM)`);

        if (distance <= site.radius_km) {
            if (!notifiedSites.has(site.id)) {
                console.log(`✅ TRIGGERING ALERT: ${site.name}`);
                notifiedSites.add(site.id);
                showProximityAlertBubble(site.name, site.message, site.link);
            } else {
                console.log(`⏭️ Skipping ${site.name} — already notified.`);
            }
        }
    });
}

// 8. Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 9. Show proximity alert bubble — Premium City Mitra card
function showProximityAlertBubble(siteName, message, link) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const alertHtml = `
    <div class="ai-row new spaced">
        <div class="av">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
        <div class="ai-content">
            <div class="ai-sender">
                📍 Nearby Place Detected
                <span class="powered-badge">✦ GPS</span>
            </div>
            <!-- Glowing card wrapper -->
            <div class="bubble" style="padding:0; overflow:hidden; border:1.5px solid rgba(45,70,185,0.2); box-shadow:0 2px 12px rgba(45,70,185,0.1), 0 0 0 1px rgba(45,70,185,0.05);">

                <!-- Header with gradient + animated pulse dot -->
                <div style="background:linear-gradient(135deg, var(--brand) 0%, #4338CA 50%, var(--brand-deep) 100%); background-size:200% 200%; animation:gradientMove 8s ease infinite; padding:16px; position:relative; overflow:hidden;">
                    <!-- Subtle pattern overlay -->
                    <div style="position:absolute; inset:0; background:repeating-linear-gradient(-45deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 36px); pointer-events:none;"></div>
                    <div style="position:relative; display:flex; align-items:center; gap:12px;">
                        <div style="width:44px; height:44px; border-radius:14px; background:rgba(255,255,255,0.13); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid rgba(255,255,255,0.15);">
                            <i data-lucide="map-pin" style="width:22px; height:22px; color:#fff;"></i>
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-size:15px; font-weight:700; color:#fff; line-height:1.3; letter-spacing:-0.01em;">${siteName}</div>
                            <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
                                <span style="width:6px; height:6px; border-radius:50%; background:#7AE878; box-shadow:0 0 6px rgba(122,232,120,0.5); display:inline-block; animation:cityPulse 2s ease-in-out infinite;"></span>
                                <span style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.7); letter-spacing:0.06em; text-transform:uppercase;">You're nearby · ${timeStr}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Body content -->
                <div style="padding:14px 16px 16px;">
                    <div style="font-size:13.5px; line-height:1.72; color:var(--ink2); margin-bottom:14px;">
                        ${message}
                    </div>

                    <!-- Action buttons row -->
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <a href="${link}" target="_blank" style="display:inline-flex; align-items:center; gap:6px; background:var(--brand); color:#fff; padding:9px 18px; border-radius:12px; font-size:12.5px; font-weight:700; text-decoration:none; letter-spacing:0.01em; box-shadow:0 4px 14px rgba(45,70,185,0.3); transition:all 0.15s; border:none;">
                            <i data-lucide="compass" style="width:14px; height:14px;"></i>
                            Explore
                        </a>
                        <button onclick="handleChipClick('Tell me about ${siteName.replace(/'/g, "\\\\'")}')" style="display:inline-flex; align-items:center; gap:5px; background:var(--brand-lt); color:var(--brand); padding:9px 14px; border-radius:12px; font-size:12px; font-weight:600; border:1.5px solid rgba(45,70,185,0.15); cursor:pointer; font-family:'Bricolage Grotesque',sans-serif; transition:all 0.15s;">
                            <i data-lucide="message-circle" style="width:13px; height:13px;"></i>
                            Ask City Mitra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    messagesList.insertAdjacentHTML('beforeend', alertHtml);

    // Render Lucide icons for new HTML
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Scroll chat to bottom
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

// 10. System message — inline brand-themed notification
function addProximitySystemMessage(text) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgHtml = `
    <div style="display:flex; justify-content:center; margin:12px 0;">
        <div style="display:inline-flex; align-items:center; gap:6px; background:var(--brand-xlt); border:1px solid rgba(45,70,185,0.1); border-radius:20px; padding:6px 14px 6px 10px; max-width:90%; animation:msgIn 0.32s cubic-bezier(0.34, 1.3, 0.64, 1) both;">
            <div style="width:22px; height:22px; border-radius:50%; background:var(--brand); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <i data-lucide="map-pin" style="width:11px; height:11px; color:#fff;"></i>
            </div>
            <span style="font-size:12px; font-weight:600; color:var(--brand); line-height:1.4;">${text}</span>
            <span style="font-size:10px; color:var(--ink4); font-weight:500; margin-left:2px;">${timeStr}</span>
        </div>
    </div>
    `;

    messagesList.insertAdjacentHTML('beforeend', msgHtml);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}
