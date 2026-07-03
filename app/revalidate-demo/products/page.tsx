import Link from 'next/link';

export const revalidate = 3600;

interface Product {
  id: number;
  name: string;
  price: number;
  updatedAt: string;
}

async function getProducts(): Promise<Product[]> {
  // 模拟从数据库获取商品列表，关联 tag "products"
  // 在真实场景中这里会是 fetch(..., { next: { tags: ['products'] } })
  const products: Product[] = [
    {
      id: 1,
      name: 'Next.js 实战指南',
      price: 89,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'React 19 深入浅出',
      price: 79,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'TypeScript 高级编程',
      price: 99,
      updatedAt: new Date().toISOString(),
    },
  ];
  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1>商品列表 (Tag: &quot;products&quot;)</h1>
      <p style={{ color: '#666' }}>
        本页面关联 tag <code>&quot;products&quot;</code>，可通过{' '}
        <code>revalidateTag(&apos;products&apos;)</code> 刷新。
      </p>
      <p style={{ fontSize: '0.8rem', color: '#999' }}>
        页面渲染时间: {new Date().toISOString()}
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        {products.map(product => (
          <div
            key={product.id}
            style={{
              padding: '1rem',
              marginBottom: '1rem',
              background: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #eee',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.25rem' }}>
                  <Link href={`/revalidate-demo/products/${product.id}`}>
                    {product.name}
                  </Link>
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: '#888',
                  }}
                >
                  更新于: {product.updatedAt}
                </p>
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#e53935',
                }}
              >
                ¥{product.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#e8eaf6',
          borderRadius: '8px',
          fontSize: '0.875rem',
        }}
      >
        <strong>Tag 关联说明:</strong>
        <ul
          style={{
            margin: '0.5rem 0 0',
            paddingLeft: '1.5rem',
          }}
        >
          <li>
            列表页关联 tag: <code>&quot;products&quot;</code>
          </li>
          <li>
            详情页关联 tag: <code>&quot;product-[id]&quot;</code> (如{' '}
            <code>&quot;product-1&quot;</code>)
          </li>
          <li>
            刷新 <code>&quot;products&quot;</code> 会刷新列表页
          </li>
          <li>
            刷新 <code>&quot;product-1&quot;</code> 只刷新商品 1 的详情页
          </li>
        </ul>
      </div>

      <p style={{ marginTop: '1rem' }}>
        <Link href="/revalidate-demo">← 返回 Revalidate 演示</Link>
      </p>
    </main>
  );
}
