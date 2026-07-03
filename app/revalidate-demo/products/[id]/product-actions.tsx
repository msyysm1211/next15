'use client';

import { useTransition } from 'react';
import { revalidateByTag, revalidateByPath } from '../../server-actions';

export function ProductRevalidateActions({ productId }: { productId: string }) {
  const [isPendingTag, startTransitionTag] = useTransition();
  const [isPendingPath, startTransitionPath] = useTransition();

  const tag = `product-${productId}`;
  const path = `/revalidate-demo/products/${productId}`;

  return (
    <section
      style={{
        marginTop: '1.5rem',
        padding: '1.5rem',
        background: '#f3e5f5',
        borderRadius: '8px',
        border: '1px solid #ce93d8',
      }}
    >
      <h3 style={{ margin: '0 0 1rem' }}>操作面板</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => startTransitionTag(() => revalidateByTag(tag))}
          disabled={isPendingTag}
          style={{
            padding: '0.75rem 1.5rem',
            background: isPendingTag ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPendingTag ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {isPendingTag ? '刷新中...' : `revalidateTag("${tag}")`}
        </button>

        <button
          onClick={() => startTransitionPath(() => revalidateByPath(path))}
          disabled={isPendingPath}
          style={{
            padding: '0.75rem 1.5rem',
            background: isPendingPath ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPendingPath ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
          }}
        >
          {isPendingPath ? '刷新中...' : `revalidatePath("${path}")`}
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.75rem' }}>
        <code>revalidateTag</code> 只刷新关联该 tag 的 fetch 缓存；
        <code>revalidatePath</code> 刷新整个页面。
      </p>
    </section>
  );
}
