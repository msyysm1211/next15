export const revalidate = 60;

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>首页 (ISR — revalidate: 60s)</h1>
      <p>Next.js 15 + React 19 | Powered by Pages Cache Gateway</p>
      <p>构建时间: {new Date().toISOString()}</p>
      <p>本页面测试通过 Gateway OSS proxy 的 incremental cache 读写路径。</p>

      <section
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#f0f7ff',
          borderRadius: '8px',
          border: '1px solid #b3d4fc',
        }}
      >
        <h2 style={{ margin: '0 0 1rem' }}>功能演示列表</h2>
        <ul style={{ lineHeight: 2 }}>
          <li>
            <a href="/revalidate-demo">
              <strong>Revalidate Tag / Path 演示</strong>
            </a>{' '}
            — 测试 revalidateTag 和 revalidatePath 的按需刷新
          </li>
          <li>
            <a href="/blog">Blog (ISR)</a> — 测试 incremental cache + tag 关联
          </li>
          <li>
            <a href="/dynamic">Dynamic (SSR)</a> — 每次请求都重新渲染
          </li>
          <li>
            <a href="/ppr-test">PPR / Streaming</a> — Suspense streaming 测试
          </li>
          <li>
            <a href="/image-test">Image 优化</a> — 图片优化测试
          </li>
        </ul>
      </section>
    </main>
  );
}
