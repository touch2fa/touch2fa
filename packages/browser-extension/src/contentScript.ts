chrome.runtime.sendMessage(
  { action: "requestTOTP", secret: "user-secret" },
  (response) => {
    if (response.code) {
      // Auto-fill the TOTP code
      const inputField = document.querySelector(
        // eslint-disable-next-line quotes
        'input[type="text"][name="totp"]'
      );
      if (inputField) {
        (inputField as HTMLInputElement).value = response.code;
      }
    } else {
      console.error(response.error);
    }
  }
);
