import { authenticateUser, fallbackAuthentication } from "@touch2fa/core/auth";
import { generateTOTP } from "@touch2fa/core/totp";

// Listen for installation events
chrome.runtime.onInstalled.addListener(() => {
  console.log("Touch2FA Extension Installed");
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "requestTOTP") {
    (async () => {
      const authenticated =
        (await authenticateUser()) || fallbackAuthentication();
      if (authenticated) {
        const code = generateTOTP(request.secret);
        sendResponse({ code });
      } else {
        sendResponse({ error: "Authentication failed" });
      }
    })();
    return true; // Keeps the message channel open for sendResponse
  }
});
