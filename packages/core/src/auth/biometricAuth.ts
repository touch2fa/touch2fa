export async function authenticateUser(): Promise<boolean> {
  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "required",
      },
    });
    return credential !== null;
  } catch (error) {
    console.error("Biometric authentication failed:", error);
    return false;
  }
}
