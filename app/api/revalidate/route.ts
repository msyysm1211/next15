import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');
  const path = request.nextUrl.searchParams.get('path');

  if (!tag && !path) {
    return NextResponse.json(
      {
        error:
          '请提供 tag 或 path 参数。示例: ?tag=time-data 或 ?path=/revalidate-demo',
      },
      { status: 400 }
    );
  }

  const results: string[] = [];

  if (tag) {
    revalidateTag(tag);
    results.push(`已刷新 tag: "${tag}"`);
  }

  if (path) {
    revalidatePath(path);
    results.push(`已刷新 path: "${path}"`);
  }

  return NextResponse.json({
    success: true,
    message: results.join('; '),
    timestamp: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    usage: '使用 POST 方法触发 revalidation',
    examples: [
      'POST /api/revalidate?tag=time-data',
      'POST /api/revalidate?path=/revalidate-demo',
      'POST /api/revalidate?tag=time-data&path=/revalidate-demo',
    ],
  });
}
