import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductRevalidateActions } from './product-actions';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  updatedAt: string;
}

async function getProduct(id: string): Promise<ProductDetail | null> {
  const products: Record<string, ProductDetail> = {
    '1': {
      id: 1,
      name: 'Next.js 实战指南',
      price: 89,
      description:
        '从零到一掌握 Next.js 15 的 App Router、Server Components、ISR 等核心特性。',
      stock: Math.floor(Math.random() * 100),
      updatedAt: new Date().toISOString(),
    },
    '2': {
      id: 2,
      name: 'React 19 深入浅出',
      price: 79,
      description:
        '深入理解 React 19 的 Server Components、use() hook、Actions 等新特性。',
      stock: Math.floor(Math.random() * 100),
      updatedAt: new Date().toISOString(),
    },
    '3': {
      id: 3,
      name: 'TypeScript 高级编程',
      price: 99,
      description:
        '掌握 TypeScript 的类型体操、条件类型、模板字面量类型等高级用法。',
      stock: Math.floor(Math.random() * 100),
      updatedAt: new Date().toISOString(),
    },
  };

  return products[id] || null;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1>{product.name}</h1>
      <p style={{ fontSize: '0.8rem', color: '#999' }}>
        Tag: <code>&quot;product-{id}&quot;</code> | 渲染时间:{' '}
        {product.updatedAt}
      </p>

      <div
        style={{
          padding: '1.5rem',
          background: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #eee',
          marginTop: '1rem',
        }}
      >
        <p
          style={{
            fontSize: '1.5rem',
            color: '#e53935',
            margin: '0 0 1rem',
          }}
        >
          ¥{product.price}
        </p>
        <p>{product.description}</p>
        <p style={{ color: '#666' }}>
          库存: <strong>{product.stock}</strong> 件
          <span
            style={{
              fontSize: '0.8rem',
              color: '#999',
              marginLeft: '0.5rem',
            }}
          >
            (每次 revalidate 后库存数会变化，因为是随机生成的)
          </span>
        </p>
      </div>

      {/* Revalidate actions for this specific product */}
      <ProductRevalidateActions productId={id} />

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#e8f5e9',
          borderRadius: '8px',
          fontSize: '0.875rem',
        }}
      >
        <strong>验证步骤:</strong>
        <ol
          style={{
            margin: '0.5rem 0 0',
            paddingLeft: '1.5rem',
            lineHeight: 2,
          }}
        >
          <li>记录当前的库存数和渲染时间</li>
          <li>
            点击 <code>revalidateTag(&quot;product-{id}&quot;)</code> 按钮
          </li>
          <li>刷新页面，观察库存数和渲染时间是否变化</li>
          <li>
            回到
            <Link href="/revalidate-demo/products">商品列表</Link>
            ，确认列表页未受影响（因为 tag 不同）
          </li>
        </ol>
      </div>

      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/revalidate-demo/products">← 返回商品列表</Link>
        {' | '}
        <Link href="/revalidate-demo">← 返回 Revalidate 演示</Link>
      </p>
    </main>
  );
}
