# idempotency-key-study

idempotency-key를 이용해 서버 API의 멱등성을 보장하는 방법을 학습하는 BE/FE 모노레포입니다.

## Docs

- [멱등성과 Idempotency-Key 학습 노트](docs/idempotency.md)
- [1단계: 멱등성 없는 중복 주문 재현 과정](docs/order-duplicate-reproduction.md)

## Projects

- `idempotency-key-study-be`: Spring Boot 기반 백엔드
- `idempotency-key-study-fe`: 프론트엔드

## Local Setup

기본 실행 방식은 Docker Compose입니다. 사전에 Docker Desktop이 실행 중이어야 합니다.

### 전체 실행

```bash
docker compose up --build
```

또는 루트 npm 스크립트를 사용할 수 있습니다.

```bash
npm run dev
```

실행되는 서비스:

- frontend: `http://localhost:5173`
- backend: `http://localhost:8080`
- postgres: `localhost:5432`

PostgreSQL 기본 접속 정보는 다음과 같습니다.

- host: `localhost`
- port: `5432`
- database: `idempotency_study`
- username: `idempotency`
- password: `idempotency`

### Backend 확인

```bash
curl http://localhost:8080/api/health
```

### 개별 실행

Docker 없이 개별 프로세스로 실행할 때만 아래 명령을 사용합니다.

```bash
npm run db:up
npm run dev:be
npm run dev:fe
```

## Checks

```bash
npm run build
npm test
docker compose config
```
