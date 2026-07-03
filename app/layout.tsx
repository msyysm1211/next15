export const metadata = {
  title: 'PCG 测试 — Next.js 15',
  description: 'Next.js 15 兼容性测试 for pages-cache-gateway',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <header
          style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid #eee',
            background: '#fafafa',
          }}
        >
          <strong>PCG 测试 — Next.js 15</strong>
          <nav style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            <a href="/">首页</a> | <a href="/about">关于</a> |{' '}
            <a href="/dynamic">Dynamic</a> | <a href="/blog">Blog</a> |{' '}
            <a href="/revalidate-demo">Revalidate 演示</a> |{' '}
            <a href="/ppr-test">PPR</a> | <a href="/image-test">Image</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
