export const dynamic = 'force-dynamic';

export default function DynamicPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Dynamic (SSR)</h1>
      <p>每次请求都重新渲染 — 不走缓存。</p>
      <p>当前时间: {new Date().toISOString()}</p>
    </main>
  );
}
