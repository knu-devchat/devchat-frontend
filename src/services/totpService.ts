// Service to get server-generated TOTP for testing.
// TODO: Replace mocked implementation with real backend endpoint.

// API endpoint (example): GET /auth/totp
// The real endpoint may require authentication and different path.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export async function getTOTP() {
  try {
    console.log('[TOTP] getTOTP called (test-mode)');

    // Mocked response for local testing
    const expiresIn = 30; // seconds
    const now = Date.now();
    const expiresAt = new Date(now + expiresIn * 1000).toISOString();
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Uncomment and adapt for real backend call:
    // const res = await fetch(`${localhost:8000/api/chat/rooms/}/auth/totp`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'Authorization': `Bearer ${token}`,
    //   },
    // });
    // if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // return await res.json();
    

    return { success: true, code, expiresAt };
  } catch (err) {
    console.error('[TOTP] failed to fetch', err);
    throw err;
  }
}
