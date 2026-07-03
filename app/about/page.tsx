export default function About() {
  const buildTime = new Date().toISOString();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>关于 (SSG)</h1>
      <p>纯静态页面 — 测试通过 CLI 上传 pre-render 缓存。</p>
      <p>构建时间: {buildTime}</p>
    </main>
  );
}
