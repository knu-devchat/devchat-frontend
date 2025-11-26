# React + Django Chat Application API Specification (v1)

## 1. Authentication API

### 1.1 GitHub OAuth Login URL 요청

**GET /api/auth/github/login/**

GitHub OAuth 인증을 위한 URL을 생성하여 반환한다.

**Response**

``` json
{
  "auth_url": "https://github.com/login/oauth/authorize?...",
  "state": "random_csrf_string"
}
```

### 1.2 GitHub OAuth Callback

**POST /api/auth/github/callback/**

GitHub에서 전달된 `code` 로 Access Token 요청 → 사용자 식별 → JWT 발급.

**Request**

``` json
{
  "code": "github_oauth_code",
  "state": "csrf_state"
}
```

**Response**

``` json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "taehyun",
    "avatar": "https://avatars.githubusercontent.com/u/..."
  }
}
```

### 1.3 JWT Refresh

**POST /api/auth/refresh/**

**Request**

``` json
{ "refresh": "refresh_token" }
```

**Response**

``` json
{ "access": "new_access_token" }
```

------------------------------------------------------------------------

## 2. Room API (채팅방)

### 2.1 채팅방 생성

**POST /api/rooms/**

**Request**

``` json
{
  "name": "AI 연구실",
  "desc": "실험용 채팅방",
  "requires_totp": true
}
```

**Response**

``` json
{
  "id": 10,
  "name": "AI 연구실",
  "desc": "실험용 채팅방",
  "requires_totp": true,
  "totp_secret": "BASE32SECRET123"
}
```

### 2.2 내 채팅방 목록 조회

**GET /api/rooms/**

**Response**

``` json
[
  {
    "id": 10,
    "name": "AI 연구실",
    "has_new_message": true
  }
]
```

### 2.3 채팅방 상세 정보 조회

**GET /api/rooms/{room_id}/**

**Response**

``` json
{
  "id": 10,
  "name": "AI 연구실",
  "desc": "실험용 채팅방",
  "requires_totp": true
}
```

### 2.4 TOTP 기반 방 입장

**POST /api/rooms/{room_id}/enter/**

**Request**

``` json
{ "totp_code": "123456" }
```

**Response (success)**

``` json
{
  "result": "success",
  "room_id": 10
}
```

**Response (error)**

``` json
{ "error": "invalid_totp" }
```

------------------------------------------------------------------------

## 3. Message API

### 3.1 메시지 목록 조회

**GET /api/rooms/{room_id}/messages/?page=1**

**Response**

``` json
{
  "page": 1,
  "messages": [
    {
      "id": 1,
      "sender": "taehyun",
      "content": "안녕!",
      "is_ai": false,
      "created_at": "2025-11-26T15:00:00"
    }
  ]
}
```

### 3.2 메시지 전송

**POST /api/rooms/{room_id}/messages/**

**Request**

``` json
{ "content": "AI야 분석해줘" }
```

**Response**

``` json
{
  "id": 5,
  "sender": "taehyun",
  "content": "AI야 분석해줘",
  "is_ai": false,
  "created_at": "2025-11-26T15:01:00"
}
```

------------------------------------------------------------------------

## 4. AI Tool API

### 4.1 AI 메시지 생성 요청

**POST /api/rooms/{room_id}/ai/**

**Request**

``` json
{ "prompt": "이 대화를 요약해줘" }
```

**Response**

``` json
{
  "id": 100,
  "sender": "AI",
  "content": "요약을 시작합니다...",
  "is_ai": true,
  "created_at": "2025-11-26T15:02:00"
}
```

------------------------------------------------------------------------

## 5. WebSocket API

### 5.1 채팅 WebSocket 연결

**WS /ws/rooms/{room_id}/?token=JWT_ACCESS_TOKEN**

**클라이언트 → 서버**

``` json
{
  "type": "message",
  "content": "안녕하세요!"
}
```

**서버 → 클라이언트 (유저 메시지)**

``` json
{
  "type": "message",
  "sender": "taehyun",
  "content": "안녕하세요!",
  "created_at": "2025-11-26T15:03:00"
}
```

**서버 → 클라이언트 (AI 메시지)**

``` json
{
  "type": "ai_message",
  "content": "요약 완료!",
  "created_at": "2025-11-26T15:03:10"
}
```

------------------------------------------------------------------------

## 6. 공통 에러 포맷

``` json
{
  "error": "error_code",
  "message": "설명"
}
```
