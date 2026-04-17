# -*- coding: utf-8 -*-
"""
==============================================
 City Mitra -- n8n Webhook Tester
 Tests all 3 webhook endpoints and shows
 the raw JSON response from n8n
==============================================
"""

import requests
import json
import sys
import os

# Fix Windows console encoding
if os.name == 'nt':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# -- n8n Webhook URLs (from script.js) --
WEBHOOKS = {
    "1": {
        "name": "District Info Bot",
        "url": "https://n8n-workflow-test.duckdns.org/webhook/chat",
        "desc": "General Kurukshetra queries (officers, tourism, schemes, emergency)"
    },
    "2": {
        "name": "Gita Wisdom AI",
        "url": "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_AskGita",
        "desc": "Bhagavad Gita spiritual/philosophical queries"
    },
    "3": {
        "name": "Feedback Webhook",
        "url": "https://n8n-workflow-test.duckdns.org/webhook/InfoBot_Feed",
        "desc": "Feedback form submissions"
    }
}


def send_request(webhook_key, message, language="en"):
    """Send a POST request to the selected n8n webhook and print raw response."""
    
    webhook = WEBHOOKS[webhook_key]
    
    print(f"\n{'='*60}")
    print(f"  [{webhook_key}] {webhook['name']}")
    print(f"  URL: {webhook['url']}")
    print(f"{'='*60}")
    print(f"  Input:    \"{message}\"")
    print(f"  Language: {language}")
    print(f"{'_'*60}")
    
    # Build payload (matching what script.js sends)
    if webhook_key == "3":
        # Feedback webhook expects different fields
        payload = {
            "rating": "5",
            "understood": "Yes",
            "helpful": "Very",
            "comments": message,
            "source": "Python Test Script",
            "timestamp": "2026-04-17T00:00:00Z"
        }
    else:
        payload = {
            "question": message,   # Gita webhook uses this
            "message": message,    # District webhook uses this
            "language": language
        }
    
    print(f"\n>> REQUEST PAYLOAD:")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    
    try:
        response = requests.post(
            webhook['url'],
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"\n<< RESPONSE:")
        print(f"  Status:       {response.status_code} {response.reason}")
        print(f"  Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"  Size:         {len(response.text)} chars")
        print(f"{'_'*60}")
        
        # Try to parse as JSON
        try:
            data = response.json()
            print(f"\n[OK] PARSED JSON:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Extract the actual bot response (same logic as script.js)
            print(f"\n{'_'*60}")
            print(f">> EXTRACTED CONTENT (what the bot would show):")
            
            if webhook_key == "2":
                # Gita webhook
                content = None
                if isinstance(data, dict):
                    content = data.get("answer") or data.get("response") or data.get("text")
                print(f"  {content or '[!] No answer/response/text field found'}")
            elif webhook_key == "1":
                # District webhook
                content = None
                if isinstance(data, list):
                    content = (data[0].get("response") or data[0].get("text")) if data else None
                elif isinstance(data, dict):
                    content = data.get("response") or data.get("text") or data.get("message")
                print(f"  {content or '[!] No response/text/message field found'}")
            else:
                print(f"  (Feedback webhook -- no bot content expected)")
                
        except json.JSONDecodeError:
            print(f"\n[!] RAW TEXT (not valid JSON):")
            print(response.text[:2000])
            
    except requests.Timeout:
        print(f"\n[X] TIMEOUT: n8n did not respond within 30 seconds")
    except requests.ConnectionError:
        print(f"\n[X] CONNECTION ERROR: Cannot reach n8n server")
    except Exception as e:
        print(f"\n[X] ERROR: {type(e).__name__}: {e}")


def main():
    print("")
    print("=" * 50)
    print("  City Mitra -- n8n Webhook Tester")
    print("  Test all 3 endpoints with any input")
    print("=" * 50)
    
    while True:
        # Select webhook
        print("\n>> Select Webhook:")
        for key, wh in WEBHOOKS.items():
            print(f"  [{key}] {wh['name']} -- {wh['desc']}")
        print(f"  [4] Test ALL webhooks with same input")
        print(f"  [q] Exit")
        
        choice = input("\n  Your choice: ").strip()
        
        if choice.lower() == 'q':
            print("\nBye!")
            break
            
        if choice not in ("1", "2", "3", "4"):
            print("  [X] Invalid choice, try again")
            continue
        
        # Get message input
        message = input("  Enter your message: ").strip()
        if not message:
            print("  [X] Empty message, try again")
            continue
        
        # Get language
        lang = input("  Language (en/hi) [en]: ").strip().lower() or "en"
        if lang not in ("en", "hi"):
            lang = "en"
        
        # Send request(s)
        if choice == "4":
            # Test all 3
            for key in ("1", "2", "3"):
                send_request(key, message, lang)
        else:
            send_request(choice, message, lang)
        
        print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
