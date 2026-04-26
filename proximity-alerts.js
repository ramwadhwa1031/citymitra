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

// 9. Show proximity alert bubble — City Mitra brand style
function showProximityAlertBubble(siteName, message, link) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    const alertHtml = `
    <div class="ai-row new spaced">
        <div class="av" style="background: #059669;">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
        <div class="ai-content">
            <div class="ai-sender" style="color: #059669;">
                📍 Nearby Alert
                <span class="powered-badge" style="background: #ECFDF5; color: #059669; border-color: rgba(5,150,105,0.15);">
                    ✦ GPS
                </span>
            </div>
            <div class="bubble" style="border-left: 3px solid #059669;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid var(--line2);">
                    <div style="background:#ECFDF5; padding:6px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="map-pin" style="width:16px; height:16px; color:#059669;"></i>
                    </div>
                    <strong style="font-size:13.5px; color:#059669;">${siteName}</strong>
                </div>
                <div style="font-size:13.5px; line-height:1.65; color:var(--ink2); margin-bottom:12px;">
                    ${message}
                </div>
                <a href="${link}" target="_blank" style="display:inline-flex; align-items:center; gap:5px; background:#ECFDF5; color:#059669; padding:6px 14px; border-radius:10px; font-size:12px; font-weight:700; text-decoration:none; border:1.5px solid rgba(5,150,105,0.15); transition:all 0.15s;">
                    <i data-lucide="external-link" style="width:13px; height:13px;"></i>
                    View Details
                </a>
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

// 10. System message — City Mitra brand style
function addProximitySystemMessage(text) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    const msgHtml = `
    <div class="ai-row new spaced">
        <div class="av" style="background: var(--ink3);">
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
            </svg>
        </div>
        <div class="ai-content">
            <div class="bubble" style="background: var(--bg); border: 1px dashed var(--line);">
                <div style="font-size:13px; color:var(--ink3); line-height:1.55;">
                    ${text}
                </div>
            </div>
        </div>
    </div>
    `;

    messagesList.insertAdjacentHTML('beforeend', msgHtml);

    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}
