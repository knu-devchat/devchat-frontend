const API_BASE_URL = 'http://localhost:8000/api';

// ========================================
// 🏠 채팅방 생성 API
// ========================================
export async function createRoom(roomName: string) {
  try {
    console.log("방 생성 요청:", roomName);
    
    const response = await fetch(`${API_BASE_URL}/chat/chat-rooms/`, {
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
// 🔍 채팅방 상세 정보 조회 API
// ========================================
export async function getRoomDetails(room_uuid: string) {
  try {
    console.log(`[API 요청] 채팅방 정보 조회 - room_uuid: ${room_uuid}`);
    
    const response = await fetch(`${API_BASE_URL}/chat/chat-rooms/${room_uuid}`, {
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
    console.log('[API 응답] 채팅방 정보:', data);
    return data;
  } catch (error) {
    console.error('[API 에러] 채팅방 정보 조회 실패:', error);
    throw error;
  }
}

// ========================================
// 🔑 OTP로 방 참여 API
// ========================================
export async function joinRoomWithOTP(totp: string) {
  try {
    console.log(`[API 요청] OTP 방 참여 - otp: ${totp}`);
    
    const response = await fetch(`${API_BASE_URL}/chat/join-with-otp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ totp }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
     
    const data = await response.json();
    console.log('[API 응답] 방 참여 완료:', data);
    return data;
  } catch (error) {
    console.error('[API 에러] OTP 방 참여 실패:', error);
    throw error;
  }
}

// ========================================
// 📨 채팅 메시지 목록 조회 API
// ========================================
export async function fetchChatMessages(room_uuid: string, limit: number = 50) {
  try {
    console.log(`[API 요청] 채팅 메시지 조회 - room_uuid: ${room_uuid}, limit: ${limit}`);
    
    const response = await fetch(`${API_BASE_URL}/chat/chat-rooms/${room_uuid}/messages/?limit=${limit}`, {
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
// 💬 채팅 메시지 전송 API
// ========================================
export async function sendChatMessage(room_uuid: string, message: string) {
  try {
    console.log(`[API 요청] 채팅 메시지 전송 - room_uuid: ${room_uuid}, message: "${message}"`);
    
    const response = await fetch(`${API_BASE_URL}/chat/chat-rooms/${room_uuid}/messages/`, {
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
