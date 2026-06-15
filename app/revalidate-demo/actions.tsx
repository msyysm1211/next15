'use client';

import { useTransition } from 'react';
import { revalidateByTag, revalidateByPath } from './server-actions';

export function RevalidateActions() {
  const [isPendingTag, startTransitionTag] = useTransition();
  const [isPendingPath, startTransitionPath] = useTransition();

  return (
    <section
      style={{
        padding: '1.5rem',
        background: '#f3e5f5',
        borderRadius: '8px',
        border: '1px solid #ce93d8',
      }}
    >
      <h2 style={{ margin: '0 0 1rem' }}>操作面板 (Server Actions)</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => startTransitionTag(() => revalidateByTag('time-data'))}
          disabled={isPendingTag}
          style={{
            padding: '0.75rem 1.5rem',
            background: isPendingTag ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPendingTag ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {isPendingTag ? '刷新中...' : 'revalidateTag("time-data")'}
        </button>

        <button
          onClick={() =>
            startTransitionPath(() => revalidateByPath('/revalidate-demo'))
          }
          disabled={isPendingPath}
          style={{
            padding: '0.75rem 1.5rem',
            background: isPendingPath ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPendingPath ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {isPendingPath ? '刷新中...' : 'revalidatePath("/revalidate-demo")'}
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.75rem' }}>
        点击按钮后，Server Action 会在服务端执行
        revalidate，然后页面自动刷新显示新数据。
      </p>
    </section>
  );
}
