const API_BASE_URL = 'http://localhost:8000/api';

// ========================================
// 🏠 채팅방 생성 API (POST /api/chat/rooms/)
// ========================================
export async function createRoom(roomName: string) {
  try {
    console.log("방 생성 요청:", roomName);

    const response = await fetch(`${API_BASE_URL}/chat/rooms/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ room_name: roomName }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 방 생성 완료:', data);
    return data;
  } catch (error) {
    console.error('[API 에러] 방 생성 실패:', error);
    throw error;
  }
}

// ========================================
// 🔑 TOTP 생성 (GET /api/chat/access-code/?room_uuid=)
// ========================================
export async function getAccessCode(room_uuid: string) {
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

// ========================================
// 🔐 채팅방 참가 (POST /api/chat/join/)
// ========================================
export async function joinRoom(totp: string, room_uuid: string) {
  try {
    console.log(`[API 요청] 채팅방 참가 - room_uuid: ${room_uuid}, totp: ${totp}`);

    const response = await fetch(`${API_BASE_URL}/chat/join/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ room_uuid, totp }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 방 참가 결과:', data); // { result, message, room_uuid, ... }
    return data;
  } catch (error) {
    console.error('[API 에러] 방 참가 실패:', error);
    throw error;
  }
}

// ========================================
// 📦 내 방 목록 조회 (GET /api/chat/my-rooms/)
// ========================================
export async function getMyRooms() {
  try {
    console.log('[API 요청] 내 방 목록 조회');

    const response = await fetch(`${API_BASE_URL}/chat/my-rooms/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 내 방 목록:', data); // { result, rooms: [...] }
    return data;
  } catch (error) {
    console.error('[API 에러] 내 방 목록 조회 실패:', error);
    throw error;
  }
}

// ========================================
// ✅ 방 선택 (POST /api/chat/select-room/)
// ========================================
export async function selectRoom(room_uuid: string) {
  try {
    console.log(`[API 요청] 방 선택 - room_uuid: ${room_uuid}`);

    const response = await fetch(`${API_BASE_URL}/chat/select-room/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ room_uuid }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 방 선택 결과:', data); // { result: "ok" }
    return data;
  } catch (error) {
    console.error('[API 에러] 방 선택 실패:', error);
    throw error;
  }
}

// ========================================
// 🔍 현재 선택된 방 정보 조회 (GET /api/chat/current-room/)
// ========================================
export async function getCurrentRoom() {
  try {
    console.log('[API 요청] 현재 선택된 방 정보 조회');

    const response = await fetch(`${API_BASE_URL}/chat/current-room/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 현재 선택된 방:', data); // { result, room: { ... } }
    return data;
  } catch (error) {
    console.error('[API 에러] 현재 선택된 방 조회 실패:', error);
    throw error;
  }
}

// ========================================
// 📨 채팅 메시지 목록 조회 (GET /api/rooms/{room_id}/messages/?page=1)
// ========================================
export async function fetchChatMessages(room_uuid: string, page: number = 1) {
  try {
    console.log(`[API 요청] 채팅 메시지 조회 - room_uuid: ${room_uuid}, page: ${page}`);

    const response = await fetch(`${API_BASE_URL}/rooms/${room_uuid}/messages/?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 채팅 메시지:', data);
    return data;
  } catch (error) {
    console.error('[API 에러] 채팅 메시지 조회 실패:', error);
    throw error;
  }
}

// ========================================
// 💬 채팅 메시지 전송 (POST /api/rooms/{room_id}/messages/)
// ========================================
export async function sendChatMessage(room_uuid: string, message: string) {
  try {
    console.log(`[API 요청] 채팅 메시지 전송 - room_uuid: ${room_uuid}, message: "${message}"`);

    const response = await fetch(`${API_BASE_URL}/rooms/${room_uuid}/messages/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[API 응답] 메시지 전송 완료:', data);
    return data;
  } catch (error) {
    console.error('[API 에러] 채팅 메시지 전송 실패:', error);
    throw error;
  }
}
