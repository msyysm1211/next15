import Link from 'next/link';

export const revalidate = 30;

interface Post {
  id: number;
  title: string;
}

async function getPosts(): Promise<Post[]> {
  return [
    { id: 1, title: '第一篇文章 — ISR 缓存测试' },
    { id: 2, title: '第二篇文章 — Tag 关联验证' },
    { id: 3, title: '第三篇文章 — TableStore 映射' },
  ];
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Blog (ISR — revalidate: 30s)</h1>
      <p>测试 incremental cache 与 tag 关联。</p>
      <p style={{ fontSize: '0.8rem', color: '#999' }}>
        渲染时间: {new Date().toISOString()}
      </p>
      <ul style={{ lineHeight: 2 }}>
        {posts.map(post => (
          <li key={post.id}>
            <Link href={`/blog/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
