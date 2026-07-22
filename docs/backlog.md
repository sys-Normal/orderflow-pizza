# 백로그

아직 착수하지 않은 작업 후보를 남겨두는 문서. 착수하면 항목을 지우고 실제 커밋/이슈로 옮긴다.

---

## 실시간 주문 상태 추적 (판매자 라이브 피드 + 구매자 상태 조회)

**배경:** 현재 [/admin/orders](../src/app/(admin)/admin/orders/page.tsx)(`OrderList`)는 과거 주문을 훑어보는 히스토리 조회 화면에 가깝다. 실제 매장 운영 중에는 새 주문이 들어올 때마다 화면 위로 쌓이는 라이브 피드가 더 우선순위가 높다는 논의가 있었음. 히스토리 목록 자체는 계속 필요하니, 없애기보다 별도 화면(또는 같은 화면 내 모드 전환)으로 추가하는 방향.

추가로, 판매자 쪽엔 주문 상태 변경 기능([order-status-buttons.tsx](../src/components/order-status-buttons.tsx), 접수됨→조리중→준비완료→완료)이 이미 있는데 구매자 쪽엔 그 상태를 볼 수 있는 화면이 전혀 없다는 게 확인됨([/confirmation/[orderId]](../src/app/(customer)/confirmation/[orderId]/page.tsx)에 상태 표시 없음, "내 주문" 목록 페이지도 없음). 판매자 라이브 피드와 구매자 상태 추적은 결국 같은 실시간 인프라가 필요한 같은 작업이라 하나로 묶어서 진행.

**구현 방향(논의 결론):**
- 폴링은 실시간성이 부족해 제외.
- 업계(배민/쿠팡이츠 등)는 매장 상시 접속 기기에서 WebSocket(또는 MQTT over WS) 상시 연결 + OS 푸시(FCM/APNs)를 끊김 대비 백업으로 병행하고, 알람음은 클라이언트가 로컬로 재생하는 구조가 일반적.
- 다만 이 프로젝트는 실시간 인프라가 전무하고 포트폴리오 규모라 풀 WebSocket 서버는 과함. Next.js route handler로 구현 가능한 **SSE(Server-Sent Events)** 로 서버→클라이언트 단방향 푸시부터 시작하는 게 적합해 보임.
- SSE는 자원 소모가 거의 없고(연결 하나당 열린 HTTP 응답일 뿐), Redis 같은 별도 메시지 브로커 없이 **같은 Node 프로세스 안의 `EventEmitter` 싱글턴**으로 충분— 이 프로젝트가 SQLite(better-sqlite3)를 쓰는 것 자체가 이미 "상시 구동되는 단일 프로세스" 배포를 전제로 하므로(Vercel 같은 서버리스와는 애초에 안 맞음), 원격 서버 1대에 단일 프로세스로 올려도 여러 사용자가 동시에 실시간으로 잘 받는다. 나중에 트래픽이 커져 여러 프로세스로 수평 확장할 때만 Redis pub/sub 같은 걸로 교체하면 됨 — 지금 구조를 크게 갈아엎을 필요는 없음.

**구현 순서(가이드):**
1. 서버 내 이벤트 버스: `src/lib/events.ts`에 Node `EventEmitter` 싱글턴 + `emitOrderEvent(storeId, order)` 같은 헬퍼 함수.
2. Server Action에서 이벤트 발행: `createOrder`, `updateOrderStatus`, `updateStoreStatus` 성공 직후 해당 헬퍼 호출.
3. SSE 라우트 핸들러 2개:
   - `/api/stores/[storeId]/orders/stream` — 판매자/관리자용. 신규 주문 + 상태 변경을 실시간으로 받아 라이브 피드에 반영.
   - `/api/orders/[orderId]/stream` — 구매자용. 본인 주문 상태 변경만 구독.
   - 두 곳 다 세션 확인 후 권한 없는 스트림 구독은 차단(seller는 본인 매장만, buyer는 본인 주문만).
4. 클라이언트 훅: `EventSource`로 구독하고 메시지 수신 시 로컬 상태 갱신. 재연결 시(브라우저가 자동 재연결) 최신 스냅샷을 한 번 다시 조회해 유실 구간 보정.
5. UI 반영:
   - 판매자: `/admin/orders`에 신규 주문이 위로 쌓이는 라이브 피드 뷰 추가(히스토리 목록과는 별도 화면 또는 탭 전환).
   - 구매자: `/confirmation/[orderId]`에 실시간 상태 배지 추가, 필요하면 "내 주문" 목록 페이지 신설.
6. 원격 배포 시 체크리스트:
   - SQLite가 디스크에 의존하므로 Vercel/Netlify 같은 서버리스 플랫폼은 배제. VPS(오라클 클라우드 프리티어, Lightsail 등) + PM2/systemd, 또는 영구 디스크를 지원하는 Fly.io/Railway/Render 같은 PaaS 사용.
   - 앱은 반드시 **단일 프로세스**로만 구동(클러스터 모드/멀티 레플리카 금지) — EventEmitter가 프로세스 메모리에 있어서 여러 프로세스로 나뉘면 이벤트가 서로 안 보임.
   - nginx 등 리버스 프록시를 앞에 둘 경우 `proxy_buffering off`로 SSE 응답 버퍼링을 꺼야 하고, 프록시/로드밸런서의 idle timeout이 SSE 연결을 끊지 않도록 충분히 길게(또는 keep-alive 핑 전송).

**미정 사항:**
- 히스토리 목록과 라이브 피드 화면을 분리할지, 필터/탭으로 한 화면에서 전환할지.
- 신규 주문 알림 시 알람음/시각적 강조 방식.
- 구매자 "내 주문" 목록 페이지를 이번에 같이 만들지, 확인 페이지 실시간 배지만 우선 넣을지.
