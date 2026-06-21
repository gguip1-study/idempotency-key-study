import { useEffect, useState } from 'react';

type HealthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; service: string }
  | { status: 'error'; message: string };

type ActionState =
  | { status: 'idle'; message: string }
  | { status: 'loading'; message: string }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type Order = {
  id: number;
  productName: string;
  quantity: number;
};

type OrderRequest = {
  productName: string;
  quantity: number;
};

type RequestLog = {
  label: string;
  payload: OrderRequest;
  result: string;
};

type IntentResult = {
  intentId: string;
  intendedOrder: string;
  requestCount: number;
  createdOrderIds: number[];
  beforeCount: number;
  afterCount: number;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const DEFAULT_ORDER: OrderRequest = {
  productName: 'keyboard',
  quantity: 1,
};

const createIntentId = () => `intent-${Date.now().toString(36)}`;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function App() {
  const [health, setHealth] = useState<HealthState>({ status: 'idle' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderForm, setOrderForm] = useState<OrderRequest>(DEFAULT_ORDER);
  const [action, setAction] = useState<ActionState>({
    status: 'idle',
    message: '아직 주문 요청을 보내지 않았습니다.',
  });
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);

  const isLoading = action.status === 'loading';

  const loadOrders = async () => {
    const nextOrders = await requestJson<Order[]>('/api/orders');
    setOrders(nextOrders);
    return nextOrders;
  };

  const checkBackend = async () => {
    setHealth({ status: 'loading' });

    try {
      const body = await requestJson<{ status: string; service: string }>('/api/health');
      setHealth({ status: 'success', service: `${body.service} (${body.status})` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setHealth({ status: 'error', message });
    }
  };

  const createOrder = async () => {
    const intentId = createIntentId();
    const beforeCount = orders.length;

    setAction({ status: 'loading', message: '하나의 주문 의도로 요청 1개를 보내는 중입니다.' });
    setRequestLogs([
      {
        label: 'HTTP 요청 1',
        payload: orderForm,
        result: '전송 중',
      },
    ]);

    try {
      const createdOrder = await requestJson<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderForm),
      });
      const nextOrders = await loadOrders();

      setRequestLogs([
        {
          label: 'HTTP 요청 1',
          payload: orderForm,
          result: `주문 #${createdOrder.id} 생성`,
        },
      ]);
      setIntentResult({
        intentId,
        intendedOrder: `${orderForm.productName} ${orderForm.quantity}개 주문`,
        requestCount: 1,
        createdOrderIds: [createdOrder.id],
        beforeCount,
        afterCount: nextOrders.length,
      });
      setAction({
        status: 'success',
        message: `사용자 의도 ${intentId}에서 주문 1개가 생성됐습니다.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAction({ status: 'error', message: `주문 생성 실패: ${message}` });
    }
  };

  const simulateDuplicateIntent = async () => {
    const intentId = createIntentId();
    const beforeCount = orders.length;
    const requestLogBase = [
      { label: 'HTTP 요청 1', payload: orderForm, result: '전송 중' },
      { label: 'HTTP 요청 2', payload: orderForm, result: '전송 중' },
    ];

    setAction({
      status: 'loading',
      message: '사용자는 한 번 주문했지만, 더블클릭/재시도 상황으로 같은 HTTP 요청 2개가 발생했습니다.',
    });
    setRequestLogs(requestLogBase);

    try {
      const createdOrders = await Promise.all([
        requestJson<Order>('/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderForm),
        }),
        requestJson<Order>('/api/orders', {
          method: 'POST',
          body: JSON.stringify(orderForm),
        }),
      ]);
      const nextOrders = await loadOrders();
      const createdOrderIds = createdOrders.map((order) => order.id);

      setRequestLogs(
        createdOrders.map((order, index) => ({
          label: `HTTP 요청 ${index + 1}`,
          payload: orderForm,
          result: `주문 #${order.id} 생성`,
        })),
      );
      setIntentResult({
        intentId,
        intendedOrder: `${orderForm.productName} ${orderForm.quantity}개 주문`,
        requestCount: 2,
        createdOrderIds,
        beforeCount,
        afterCount: nextOrders.length,
      });
      setAction({
        status: 'success',
        message: `문제 재현 완료: 하나의 주문 의도에서 주문 ${createdOrders.length}개가 생성됐습니다.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAction({ status: 'error', message: `중복 요청 재현 실패: ${message}` });
    }
  };

  const refreshOrders = async () => {
    setAction({ status: 'loading', message: '주문 목록을 불러오는 중입니다.' });

    try {
      await loadOrders();
      setAction({ status: 'success', message: '주문 목록을 새로고침했습니다.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setAction({ status: 'error', message: `주문 목록 조회 실패: ${message}` });
    }
  };

  useEffect(() => {
    void checkBackend();
    void refreshOrders();
  }, []);

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="intro">
          <div>
            <p className="label">Idempotency Key Study</p>
            <h1>하나의 주문 의도가 두 개의 주문으로 저장되는 문제</h1>
          </div>
          <p className="description">
            사용자는 주문을 한 번 의도했지만, 더블클릭이나 네트워크 재시도 때문에 같은 HTTP 요청이
            두 번 도착할 수 있습니다. 지금은 멱등성 처리가 없어서 서버가 두 요청을 각각 새 주문으로
            저장합니다.
          </p>
        </div>

        <div className="panel-grid">
          <section className="panel order-panel">
            <h2>사용자 의도</h2>
            <p className="panel-copy">
              아래 입력값은 사용자가 의도한 주문 1건입니다. 중복 요청 재현은 이 의도 하나에서 같은
              요청이 두 번 나가는 상황을 보여줍니다.
            </p>

            <div className="form-grid">
              <label>
                상품명
                <input
                  value={orderForm.productName}
                  onChange={(event) =>
                    setOrderForm((current) => ({
                      ...current,
                      productName: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                수량
                <input
                  min="1"
                  type="number"
                  value={orderForm.quantity}
                  onChange={(event) =>
                    setOrderForm((current) => ({
                      ...current,
                      quantity: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            <div className="button-row">
              <button type="button" onClick={createOrder} disabled={isLoading}>
                정상 주문 1회
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={simulateDuplicateIntent}
                disabled={isLoading}
              >
                더블클릭/재시도 상황 재현
              </button>
              <button type="button" className="ghost-button" onClick={refreshOrders} disabled={isLoading}>
                목록 새로고침
              </button>
            </div>

            <div className={`status status-${action.status}`}>{action.message}</div>
          </section>

          <section className="panel metric-panel">
            <span className="metric-label">현재 주문 수</span>
            <strong>{orders.length}</strong>
            <p>중복 요청 재현 후 이 숫자가 2 증가하면 문제가 재현된 것입니다.</p>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h2>API 상태</h2>
                <p>백엔드와 연결 가능한지 확인합니다.</p>
              </div>
              <button type="button" onClick={checkBackend} disabled={health.status === 'loading'}>
                {health.status === 'loading' ? '확인 중' : '상태 확인'}
              </button>
            </div>
            <div className={`status status-${health.status}`}>
              {health.status === 'idle' && '아직 확인하지 않았습니다.'}
              {health.status === 'loading' && '백엔드 응답을 기다리는 중입니다.'}
              {health.status === 'success' && health.service}
              {health.status === 'error' && `연결 실패: ${health.message}`}
            </div>
          </section>

          <section className="panel intent-panel">
            <h2>재현 흐름</h2>
            {intentResult ? (
              <div className="intent-summary">
                <div>
                  <span>사용자 의도</span>
                  <strong>{intentResult.intentId}</strong>
                  <p>{intentResult.intendedOrder}</p>
                </div>
                <div>
                  <span>HTTP 요청 수</span>
                  <strong>{intentResult.requestCount}</strong>
                  <p>같은 payload가 서버로 도착했습니다.</p>
                </div>
                <div>
                  <span>서버 결과</span>
                  <strong>{intentResult.createdOrderIds.length}개 생성</strong>
                  <p>
                    주문 수 {intentResult.beforeCount}
                    {' -> '}
                    {intentResult.afterCount}
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-state">아직 재현한 주문 의도가 없습니다.</div>
            )}
          </section>

          <section className="panel request-panel">
            <h2>HTTP 요청 로그</h2>
            {requestLogs.length === 0 ? (
              <div className="empty-state">요청을 보내면 이곳에 전송 로그가 표시됩니다.</div>
            ) : (
              <ul className="request-list">
                {requestLogs.map((log) => (
                  <li key={log.label}>
                    <span>{log.label}</span>
                    <code>{JSON.stringify(log.payload)}</code>
                    <strong>{log.result}</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel list-panel">
            <div className="panel-header">
              <div>
                <h2>주문 목록</h2>
                <p>최근 생성된 주문부터 표시합니다.</p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="empty-state">아직 생성된 주문이 없습니다.</div>
            ) : (
              <ul className="order-list">
                {[...orders].reverse().map((order) => (
                  <li key={order.id}>
                    <span>#{order.id}</span>
                    <strong>{order.productName}</strong>
                    <em>{order.quantity}개</em>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default App;
