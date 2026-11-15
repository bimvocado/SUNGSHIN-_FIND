// 비워두면 같은 도메인의 /api/... 로 요청 (배포 환경: Ingress가 /api → 백엔드로 라우팅)
// 다른 서버를 직접 호출하고 싶을 때만 .env 에 주소를 넣으세요. 예) http://34.64.211.204
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getHealth() {
  const res = await fetch(`${BASE_URL}/api/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
