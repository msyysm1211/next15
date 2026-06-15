import Image from 'next/image';

export default function ImageTestPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Image Optimization Test</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Responsive Image</h2>
        <Image
          src="https://picsum.photos/id/237/1280/800"
          alt="Responsive test image"
          width={640}
          height={400}
          quality={75}
          style={{ borderRadius: '8px' }}
        />
      </section>

      <section>
        <h2>Multiple Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Image
            src="https://picsum.photos/id/10/800/600"
            alt="Medium test image"
            width={320}
            height={240}
            quality={75}
            style={{ borderRadius: '8px' }}
          />
          <Image
            src="https://picsum.photos/id/20/800/600"
            alt="Small test image"
            width={10}
            height={10}
            quality={75}
            style={{ borderRadius: '8px' }}
          />
        </div>
      </section>
    </main>
  );
}
