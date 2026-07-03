import Link from 'next/link';

export const revalidate = 30;

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Blog 文章 #{id}</h1>
      <p>ISR (revalidate: 30s) + generateStaticParams</p>
      <p style={{ color: '#666' }}>
        Next.js 15 breaking change: params 是异步的（需要 await）。
      </p>
      <p>测试动态路由缓存 + TableStore tag 映射。</p>
      <p style={{ fontSize: '0.8rem', color: '#999' }}>
        渲染时间: {new Date().toISOString()}
      </p>
      <Link href="/blog">← 返回 Blog 列表</Link>
    </main>
  );
}
