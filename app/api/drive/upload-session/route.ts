import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { folderId, fileName, mimeType, accessToken } = body;

    if (!fileName || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fileName and accessToken' },
        { status: 400 }
      );
    }

    const origin = req.headers.get('origin') || req.nextUrl.origin;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType || 'application/octet-stream',
    };

    if (origin) {
      headers['Origin'] = origin;
    }

    const metadata: { name: string; parents?: string[] } = {
      name: fileName,
    };
    if (folderId) {
      metadata.parents = [folderId];
    }

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,thumbnailLink,webContentLink',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Drive resumable session error:', errText);
      return NextResponse.json(
        { success: false, error: `Google Drive resumable session error: ${errText}` },
        { status: response.status }
      );
    }

    const locationHeader = response.headers.get('location');
    if (!locationHeader) {
      return NextResponse.json(
        { success: false, error: 'No resumable upload location header returned by Google Drive' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      uploadUrl: locationHeader,
    });
  } catch (error: any) {
    console.error('Error in /api/drive/upload-session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
