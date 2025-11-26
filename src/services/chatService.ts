// ========================================
// 🔗 서버 엔드포인트 설정
// ========================================
// TODO: 백엔드 API 엔드포인트를 아래에서 설정하세요
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

console.log('[API] API_BASE_URL:', API_BASE_URL);

// ========================================
// 📨 채팅방 입장 API
// ========================================
// 엔드포인트: GET /rooms/:roomId
// 설명: 특정 채팅방으로 입장합니다

export async function createRoom() {
  console.log("방 생성");

  const response = await fetch(`http://localhost:8000/api/chat/chat-rooms/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('[API 응답] 방 생성 완료:', data);
  return data;
}

export async function enterChatRoom(roomId: string) {
  try {
    console.log(`[API 테스트] 채팅방 입장 요청 - roomId: ${roomId}`);
    
    // TODO: 아래 코드를 활성화하면 실제 서버로 요청합니다
    const response = await fetch(`http://localhost:8000/api/chat/chat-rooms/${roomId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[API 응답] 채팅방 정보:', data);
    return data;
    
    return { success: true, message: '채팅방 입장 테스트 완료', roomId };
  } catch (error) {
    console.error('[API 에러] 채팅방 입장 실패:', error);
    throw error;
  }
}

// ========================================
// 📨 채팅 메시지 목록 조회 API
// ========================================
// 엔드포인트: GET /rooms/:roomId/messages?limit=50
// 설명: 특정 채팅방의 메시지 목록을 조회합니다
export async function fetchChatMessages(roomId: string, limit: number = 50) {
  try {
    console.log(`[API 테스트] 채팅 메시지 조회 - roomId: ${roomId}, limit: ${limit}`);
    
    // TODO: 아래 코드를 활성화하면 실제 서버로 요청합니다
    // const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages?limit=${limit}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // 
    // const data = await response.json();
    // console.log('[API 응답] 채팅 메시지:', data);
    // return data;
    
    return { success: true, messages: [], roomId };
  } catch (error) {
    console.error('[API 에러] 채팅 메시지 조회 실패:', error);
    throw error;
  }
}

// ========================================
// 📨 채팅 메시지 전송 API
// ========================================
// 엔드포인트: POST /rooms/:roomId/messages
// 요청 본문: { content: string }
// 설명: 특정 채팅방에 메시지를 전송합니다
export async function sendChatMessage(roomId: string, message: string) {
  try {
    console.log(`[API 테스트] 채팅 메시지 전송 - roomId: ${roomId}, message: "${message}"`);
    
    // TODO: 아래 코드를 활성화하면 실제 서버로 요청합니다
    // const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'Authorization': `Bearer ${token}` // 필요시 추가
    //   },
    //   body: JSON.stringify({ content: message }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // 
    // const data = await response.json();
    // console.log('[API 응답] 메시지 전송 완료:', data);
    // return data;
    
    return { success: true, message: '메시지 전송 테스트 완료', roomId };
  } catch (error) {
    console.error('[API 에러] 채팅 메시지 전송 실패:', error);
    throw error;
  }
}

// ========================================
// 📨 OTP로 방 입장 API
// ========================================
// 엔드포인트: POST /rooms/join
// 요청 본문: { otp: string }
// 설명: OTP 코드로 채팅방에 입장합니다
export async function joinRoomWithOTP(otp: string) {
  try {
    console.log(`[API 테스트] OTP 방 입장 요청 - otp: ${otp}`);
    
    // TODO: 아래 코드를 활성화하면 실제 서버로 요청합니다
    // const response = await fetch(`${API_BASE_URL}/rooms/join`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'Authorization': `Bearer ${token}` // 필요시 추가
    //   },
    //   body: JSON.stringify({ otp }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // 
    // const data = await response.json();
    // console.log('[API 응답] 방 입장 완료:', data);
    // return data;
    
    // 테스트용 모의 응답
    return {
      success: true,
      message: 'OTP 방 입장 테스트 완료',
      room: {
        roomName: `방-${otp}`,
        subject: 'OTP로 입장한 방',
        date: new Date().toLocaleTimeString()
      }
    };
  } catch (error) {
    console.error('[API 에러] OTP 방 입장 실패:', error);
    throw error;
  }
}
