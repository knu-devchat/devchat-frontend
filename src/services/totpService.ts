// Service to get server-generated TOTP for testing.
// TODO: Replace mocked implementation with real backend endpoint.

// API endpoint (example): GET /auth/totp
// The real endpoint may require authentication and different path.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function getTOTP(room_uuid?: string) {
  try {
    console.log('[TOTP] getTOTP called (test-mode)');

    const targetRoomUuid = room_uuid;
    
    const res = await fetch(`${API_BASE_URL}/chat/chat-rooms/${targetRoomUuid}/access-code`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(res);
    return await res.json();
  } catch (err) {
    console.error('[TOTP] failed to fetch', err);
    throw err;
  }
}