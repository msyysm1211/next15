import { unstable_cache } from 'next/cache';
import { RevalidateActions } from './actions';

export const revalidate = 3600;

const getCachedTime = unstable_cache(
  async () => ({
    time: new Date().toISOString(),
    source: 'unstable_cache',
  }),
  ['revalidate-demo-time'],
  { tags: ['time-data'], revalidate: 3600 }
);

export default async function RevalidateDemoPage() {
  const timeData = await getCachedTime();

  return (
    <main style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1>Revalidate Tag / Path 演示</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        本页面演示 Next.js 15 的按需缓存刷新能力：
        <code>revalidateTag</code> 和 <code>revalidatePath</code>。
      </p>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#e8f5e9',
          borderRadius: '8px',
          border: '1px solid #a5d6a7',
        }}
      >
        <h2 style={{ margin: '0 0 1rem' }}>1. revalidateTag 演示</h2>
        <div
          style={{
            padding: '1rem',
            background: 'white',
            borderRadius: '4px',
            marginTop: '0.5rem',
          }}
        >
          <p>
            <strong>当前时间数据:</strong> {timeData.time}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#888' }}>
            数据来源: {timeData.source}
          </p>
        </div>
      </section>

      <section
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #90caf9',
        }}
      >
        <h2 style={{ margin: '0 0 1rem' }}>2. revalidatePath 演示</h2>
        <div
          style={{
            padding: '1rem',
            background: 'white',
            borderRadius: '4px',
            marginTop: '0.5rem',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: '#888' }}>
            页面渲染时间: {new Date().toISOString()}
          </p>
        </div>
      </section>

      <RevalidateActions />

      <section
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#fff3e0',
          borderRadius: '8px',
          border: '1px solid #ffcc80',
        }}
      >
        <h2 style={{ margin: '0 0 1rem' }}>
          3. 通过 API Route 触发 Revalidate
        </h2>
        <ul style={{ fontSize: '0.875rem', lineHeight: 2 }}>
          <li>
            <code>POST /api/revalidate?tag=time-data</code> — 按 tag 刷新
          </li>
          <li>
            <code>POST /api/revalidate?path=/revalidate-demo</code> — 按 path
            刷新
          </li>
        </ul>
      </section>
    </main>
  );
}
