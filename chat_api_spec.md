# 📘 Chat Application Core API Specification (Minimal Version)

본 문서는 방 생성, 방 추가(TOTP 인증), 방 입장, 메시지 조회, 메시지 전송의 최소 기능만 포함한 API 명세서입니다.

---

# 1. Room API

## 1.1 방 생성
### `POST /api/rooms/`
새로운 채팅방을 생성합니다.

#### Request
```json
{
  "name": "스터디룸",
}
```

#### Response
```json
{
  "id": 12,
  "name": "스터디룸"
}
```

---

## 1.2 방 추가 (TOTP 인증)
기존 방에 참여하려면 TOTP 인증이 필요합니다.

### `POST /api/rooms/{room_id}/add/`

#### Request
```json
{
  "totp": "123456"
}
```

#### Response (성공)
```json
{
  "result": "success",
  "room_id": 12
}
```

#### Response (실패)
```json
{
  "error": "invalid_totp"
}
```

---

## 1.3 방 입장 (내 방 목록에서 클릭 시)
이미 참여한 방은 인증 없이 입장됩니다.

### `GET /api/rooms/{room_id}/enter/`

#### Response
```json
{
  "result": "entered",
  "room_id": 12
}
```

## 1.4 방 TOTP 조회
방 입장 후 TOTP 조회

### `/api/chat/chat-rooms/<int:room_id>/access-code`

#### Response
```json
{
  "totp": 123456
}
```

---

# 2. Message API

## 2.1 메시지 목록 조회
### `GET /api/rooms/{room_id}/messages/?page=1`

#### Response
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
### `POST /api/rooms/{room_id}/messages/`

#### Request
```json
{
  "content": "AI야 요약해줘"
}
```

#### Response
```json
{
  "id": 140,
  "sender": "taehyun",
  "content": "AI야 요약해줘",
  "is_ai": false,
  "created_at": "2025-11-26T12:05:00"
}
```
