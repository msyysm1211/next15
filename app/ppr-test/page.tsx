import { Suspense } from 'react';
import { connection } from 'next/server';

const BUILD_TIMESTAMP = new Date().toISOString();

async function SlowDynamicWeather() {
  await connection();
  await new Promise(r => setTimeout(r, 1500));

  const cities = [
    {
      name: '上海',
      temp: Math.floor(Math.random() * 15) + 20,
      weather: '多云',
    },
    {
      name: '北京',
      temp: Math.floor(Math.random() * 15) + 15,
      weather: '晴',
    },
    {
      name: '深圳',
      temp: Math.floor(Math.random() * 10) + 25,
      weather: '阵雨',
    },
  ];

  return (
    <div
      style={{
        padding: '1.5rem',
        background: '#fff',
        borderRadius: '8px',
        border: '2px solid #ef5350',
        position: 'relative',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          background: '#ef5350',
          color: 'white',
          padding: '2px 12px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        DYNAMIC - 每次请求实时生成
      </span>
      <h3 style={{ margin: '0.5rem 0 0.75rem', color: '#c62828' }}>
        实时天气（模拟）
      </h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {cities.map(c => (
          <div
            key={c.name}
            style={{
              flex: '1',
              minWidth: '120px',
              padding: '0.75rem',
              background: '#ffebee',
              borderRadius: '6px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>
              {c.weather === '晴' ? '☀️' : c.weather === '多云' ? '⛅' : '🌧️'}
            </div>
            <div style={{ fontWeight: 'bold' }}>{c.name}</div>
            <div style={{ fontSize: '1.25rem' }}>{c.temp}°C</div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>{c.weather}</div>
          </div>
        ))}
      </div>
      <p
        style={{
          margin: '0.75rem 0 0',
          fontSize: '0.8rem',
          color: '#c62828',
          fontFamily: 'monospace',
        }}
      >
        渲染时间: {new Date().toISOString()}
        <br />
        (每次刷新都不同 — 因为 connection() 强制动态渲染)
      </p>
    </div>
  );
}

async function SlowDynamicUserInfo() {
  await connection();
  await new Promise(r => setTimeout(r, 800));

  const visitors = Math.floor(Math.random() * 9000) + 1000;
  return (
    <div
      style={{
        padding: '1.5rem',
        background: '#fff',
        borderRadius: '8px',
        border: '2px solid #ef5350',
        position: 'relative',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '-12px',
          left: '12px',
          background: '#ef5350',
          color: 'white',
          padding: '2px 12px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
        }}
      >
        DYNAMIC - 请求时计算
      </span>
      <h3 style={{ margin: '0.5rem 0 0.5rem', color: '#c62828' }}>
        访问统计（模拟）
      </h3>
      <p style={{ fontSize: '2rem', margin: '0.25rem 0', fontWeight: 'bold' }}>
        {visitors.toLocaleString()} 人在线
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '0.8rem',
          color: '#c62828',
          fontFamily: 'monospace',
        }}
      >
        渲染时间: {new Date().toISOString()}
      </p>
    </div>
  );
}

export default function StreamingTestPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '900px' }}>
      <h1>Streaming SSR / PPR 演示</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        本页面展示 Next.js 15 的 <strong>Suspense Streaming</strong> 能力。
        <span style={{ color: '#1565c0' }}>蓝色区域</span>
        是静态内容（构建时确定），
        <span style={{ color: '#c62828' }}>红色区域</span>
        是动态内容（每次请求实时渲染，通过流式传输延迟加载）。
      </p>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
        }}
      >
        <span
          style={{
            background: '#e3f2fd',
            border: '2px solid #1976d2',
            padding: '4px 12px',
            borderRadius: '4px',
          }}
        >
          ■ STATIC — 构建时生成，所有用户看到相同内容
        </span>
        <span
          style={{
            background: '#ffebee',
            border: '2px solid #ef5350',
            padding: '4px 12px',
            borderRadius: '4px',
          }}
        >
          ■ DYNAMIC — 每次请求重新渲染，内容随时变化
        </span>
      </div>

      {/* Static Section 1 */}
      <div
        style={{
          padding: '1.5rem',
          background: '#fff',
          borderRadius: '8px',
          border: '2px solid #1976d2',
          marginBottom: '1.5rem',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '-12px',
            left: '12px',
            background: '#1976d2',
            color: 'white',
            padding: '2px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          STATIC - 构建时确定
        </span>
        <h3 style={{ margin: '0.5rem 0 0.5rem', color: '#1565c0' }}>
          页面骨架 & 导航
        </h3>
        <p>
          这部分是静态 HTML，在构建时（或首次请求时）就已经确定。
          无论谁访问、何时访问，内容都一样。
        </p>
        <p
          style={{
            fontSize: '0.8rem',
            color: '#1565c0',
            fontFamily: 'monospace',
            margin: '0.5rem 0 0',
          }}
        >
          模块加载时间: {BUILD_TIMESTAMP}
          <br />
          (多次刷新这个时间不变 — 因为是构建时确定的)
        </p>
      </div>

      {/* Dynamic Section 1 - Weather */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Suspense
          fallback={
            <div
              style={{
                padding: '1.5rem',
                background: '#f5f5f5',
                borderRadius: '8px',
                border: '2px dashed #bdbdbd',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  border: '3px solid #ef5350',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ color: '#888', margin: '0.5rem 0 0' }}>
                正在加载天气数据... (模拟 1.5 秒延迟)
              </p>
              <style>
                {'@keyframes spin { to { transform: rotate(360deg); } }'}
              </style>
            </div>
          }
        >
          <SlowDynamicWeather />
        </Suspense>
      </div>

      {/* Static Section 2 */}
      <div
        style={{
          padding: '1.5rem',
          background: '#fff',
          borderRadius: '8px',
          border: '2px solid #1976d2',
          marginBottom: '1.5rem',
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '-12px',
            left: '12px',
            background: '#1976d2',
            color: 'white',
            padding: '2px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          STATIC - 构建时确定
        </span>
        <h3 style={{ margin: '0.5rem 0 0.5rem', color: '#1565c0' }}>
          产品介绍
        </h3>
        <p>
          这段文字也是静态内容。在 Streaming SSR 中，静态部分会立即出现在初始
          HTML 中，而动态部分通过 <code>&lt;Suspense&gt;</code> 边界延迟加载。
        </p>
        <p style={{ fontSize: '0.875rem', color: '#555' }}>
          注意观察：页面加载时，蓝色区域（静态）瞬间出现，红色区域（动态）先显示
          loading 状态，然后流式替换为真实内容。
        </p>
      </div>

      {/* Dynamic Section 2 - User Stats */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Suspense
          fallback={
            <div
              style={{
                padding: '1.5rem',
                background: '#f5f5f5',
                borderRadius: '8px',
                border: '2px dashed #bdbdbd',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  border: '3px solid #ef5350',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ color: '#888', margin: '0.5rem 0 0' }}>
                正在加载访问统计... (模拟 0.8 秒延迟)
              </p>
            </div>
          }
        >
          <SlowDynamicUserInfo />
        </Suspense>
      </div>

      {/* Explanation */}
      <div
        style={{
          padding: '1.5rem',
          background: '#fff3e0',
          borderRadius: '8px',
          border: '1px solid #ffcc80',
        }}
      >
        <h3 style={{ margin: '0 0 0.75rem' }}>如何验证 Streaming 效果</h3>
        <ol style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 2 }}>
          <li>
            <strong>观察加载顺序：</strong>
            蓝色（STATIC）区域瞬间出现，红色（DYNAMIC）区域先显示 loading
            动画，然后逐个替换为真实数据
          </li>
          <li>
            <strong>对比时间戳：</strong>
            蓝色区域的时间不会变（构建时确定），红色区域的时间每次刷新都不同
          </li>
          <li>
            <strong>查看网络面板：</strong>打开 DevTools → Network → 查看 HTML
            响应，可以看到 chunk 式传输（Transfer-Encoding: chunked）
          </li>
          <li>
            <strong>注意加载顺序：</strong>天气（1.5s 延迟）比统计（0.8s
            延迟）后出现 — 两个 Suspense 边界独立 stream
          </li>
        </ol>

        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#fffde7',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
        >
          <strong>Streaming SSR vs 真正的 PPR：</strong>
          <br />
          当前演示是 <strong>Streaming SSR</strong>（Next.js 15 stable）——
          整个页面在请求时动态渲染，只是分块流式传输。真正的{' '}
          <strong>PPR (Partial Prerendering)</strong> 会将静态部分预渲染为 HTML
          shell 缓存起来，动态部分在请求时 stream 进来，进一步减少首屏时间。PPR
          需要 Next.js canary 或 16+。
        </div>
      </div>
    </main>
  );
}
