// Service to get server-generated TOTP for testing.
// TODO: Replace mocked implementation with real backend endpoint.

// API endpoint (example): GET /auth/totp
// The real endpoint may require authentication and different path.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ========================================
// 🔑 TOTP 생성 (POST /api/chat/access-code/)
// ========================================
export async function getTOTP(room_uuid: string) {
  try {
    console.log(`[API 요청] TOTP 생성 - room_uuid: ${room_uuid}`);

    const response = await fetch(`${API_BASE_URL}/chat/access-code/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ room_uuid : room_uuid }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] TOTP:', data); // { totp, interval, room_name, room_uuid }
    return data;
  } catch (error) {
    console.error('[API 에러] TOTP 생성 실패:', error);
    throw error;
  }
}