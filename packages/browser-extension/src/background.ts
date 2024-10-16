import { authenticateUser, fallbackAuthentication } from '@touch2fa/core/auth';
import { generateTOTP } from '@touch2fa/core/totp';

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === 'requestTOTP') {
    const authenticated = await authenticateUser() || fallbackAuthentication();
    if (authenticated) {
      const code = generateTOTP(request.secret);
      sendResponse({ code });
    } else {
      sendResponse({ error: 'Authentication failed' });
    }
  }
  return true; // Indicates async response
});
