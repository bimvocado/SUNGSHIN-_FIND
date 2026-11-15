import { useEffect, useState } from "react";
import { getHealth } from "./api/client";
import "./App.css";

function App() {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getHealth()
      .then((json) => {
        setData(json);
        setStatus("ok");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }, []);

  return (
    <main className="health">
      <h1>SUNGSHIN FIND</h1>
      <h2>백엔드 상태</h2>
      {status === "loading" && <p>확인 중...</p>}
      {status === "ok" && (
        <>
          <p className="ok">✅ 연결됨</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
      )}
      {status === "error" && <p className="error">❌ 연결 실패: {error}</p>}
    </main>
  );
}

export default App;
