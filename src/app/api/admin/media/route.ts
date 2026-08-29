import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerSession } from '@/lib/auth';
import { MediaService } from '@/services/media.service';
import { MediaFilterSchema } from '@/validations/media';

export async function GET(request: NextRequest) {
  try {
    const session = await requireOwnerSession();
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = MediaFilterSchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid parameters' },
        { status: 400 }
      );
    }

    const result = await MediaService.getAdminMedia(session.userId, parsed.data);
    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status }
    );
  }
}
