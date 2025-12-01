# 📘 Chat Application Core API Specification (Updated)

본 문서는 채팅방 관련 변경된 엔드포인트(간단 버전)를 반영합니다.

---

# 1. Room API (변경된 엔드포인트)

## 1.1 채팅방 생성
### POST /api/chat/rooms/

Request
```json
{
  "name": "스터디룸"
}
```

Response
```json
{
  "room_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "room_name": "스터디룸",
  "admin": "username",
  "status": "ok"
}
```

---

## 1.2 TOTP 생성 (방 입장/인증용)
### GET /api/chat/access-code/?room_uuid=<room_uuid>

Request: 쿼리로 room_uuid 전달

Response
```json
{
  "totp": "123456",
  "interval": 30,
  "room_name": "스터디룸",
  "room_uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 1.3 채팅방 참가 (TOTP 인증)
### POST /api/chat/join/

Request
```json
{
  "room_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "totp": "123456"
}
```

Response (성공)
```json
{
  "result": "success",
  "message": "joined",
  "room_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "room_name": "스터디룸",
  "participant_count": 5,
  "admin": "username",
  "user_role": "member"
}
```

Response (실패)
```json
{
  "result": "error",
  "message": "invalid_totp"
}
```

---

## 1.4 내 방 목록 조회
### GET /api/chat/my-rooms/

Request: 없음 (쿠키/세션 인증 포함)

Response
```json
{
  "result": "ok",
  "rooms": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "스터디룸",
      "admin": "username",
      "is_admin": false,
      "participant_count": 5
    },
    {
      "id": "b1a2c3d4-e5f6-7890-abcd-1234567890ab",
      "name": "프로젝트룸",
      "admin": "adminuser",
      "is_admin": true,
      "participant_count": 3
    }
  ]
}
```

---

## 1.5 방 선택 (서버 세션에 selected_room_uuid 저장)
### POST /api/chat/select-room/

Request
```json
{
  "room_uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response
```json
{
  "result": "ok"
}
```

설명: 서버는 이 호출에서 세션(또는 서버 측 저장소)에 selected_room_uuid를 저장합니다.

---

## 1.6 현재 선택된 방 정보 조회
### GET /api/chat/current-room/

Request: 없음 (세션 기반)

Response
```json
{
  "result": "ok",
  "room": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "스터디룸",
    "participants": [
      {"username": "alice", "role": "member"},
      {"username": "bob", "role": "admin"}
    ],
    "participant_count": 2
  }
}
```

---

# 2. Message API (기존 명세 유지)

## 2.1 메시지 목록 조회
### GET /api/rooms/{room_id}/messages/?page=1

Response
```json
{
  "page": 1,
  "messages": [
    {
      "id": 101,
      "sender": "taehyun",
      "content": "오늘 회의 언제 할까요?",
      "is_ai": false,
      "created_at": "2025-11-26T12:00:00"
    },
    {
      "id": 102,
      "sender": "AI",
      "content": "14시 이후로 시간이 비어 있습니다.",
      "is_ai": true,
      "created_at": "2025-11-26T12:00:02"
    }
  ]
}
```

---

## 2.2 메시지 전송
### POST /api/rooms/{room_id}/messages/

Request
```json
{
  "content": "AI야 요약해줘"
}
```

Response
```json
{
  "id": 140,
  "sender": "taehyun",
  "content": "AI야 요약해줘",
  "is_ai": false,
  "created_at": "2025-11-26T12:05:00"
}
```

---