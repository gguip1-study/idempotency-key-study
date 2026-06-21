import { useState } from 'react';

type HealthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; service: string }
  | { status: 'error'; message: string };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'idle' });

  const checkBackend = async () => {
    setHealth({ status: 'loading' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = (await response.json()) as { status: string; service: string };
      setHealth({ status: 'success', service: `${body.service} (${body.status})` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setHealth({ status: 'error', message });
    }
  };

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="intro">
          <p className="label">Idempotency Key Study</p>
          <h1>중복 요청을 재현하고 멱등성 처리 흐름을 확인하는 실습 환경</h1>
          <p className="description">
            먼저 멱등성 없는 주문 생성 API를 만들고, 같은 요청이 여러 번 도착할 때 어떤 문제가
            생기는지 확인한 뒤 Idempotency-Key로 해결합니다.
          </p>
        </div>

        <div className="panel-grid">
          <section className="panel">
            <h2>Backend</h2>
            <p>Spring Boot API 서버와 PostgreSQL 연결 상태를 확인합니다.</p>
            <button type="button" onClick={checkBackend} disabled={health.status === 'loading'}>
              {health.status === 'loading' ? '확인 중...' : 'API 상태 확인'}
            </button>
            <div className={`status status-${health.status}`}>
              {health.status === 'idle' && '아직 확인하지 않았습니다.'}
              {health.status === 'loading' && '백엔드 응답을 기다리는 중입니다.'}
              {health.status === 'success' && health.service}
              {health.status === 'error' && `연결 실패: ${health.message}`}
            </div>
          </section>

          <section className="panel">
            <h2>Next Study Step</h2>
            <ol>
              <li>멱등성 없는 주문 생성 API 구현</li>
              <li>더블 클릭과 재시도로 중복 주문 재현</li>
              <li>Idempotency-Key 저장과 응답 재사용 적용</li>
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
