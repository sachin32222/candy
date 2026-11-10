import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
    const { eventId, eventName, accessToken, photographerId } = body;

    if (!eventName || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: eventName and accessToken' },
        { status: 400 }
      );
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: eventName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Drive create-folder API error:', errText);
      return NextResponse.json(
        { success: false, error: `Google Drive API error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const folderId = data.id;

    // Make folder publicly readable so gallery thumbnails (lh3.googleusercontent.com) load for guests
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
    } catch (permErr) {
      console.warn('Non-fatal warning setting folder public permission:', permErr);
    }

    // Update Firestore doc events/{eventId} with driveFolderId: data.id
    try {
      if (eventId) {
        await updateDoc(doc(db, 'events', eventId), {
          driveFolderId: folderId,
          driveLink: folderId,
        });
      } else if (photographerId) {
        const q = query(
          collection(db, 'events'),
          where('photographerId', '==', photographerId),
          where('name', '==', eventName)
        );
        const snap = await getDocs(q);
        for (const d of snap.docs) {
          await updateDoc(doc(db, 'events', d.id), {
            driveFolderId: folderId,
            driveLink: folderId,
          });
        }
      }
    } catch (fsErr) {
      console.warn('Firestore update warning in create-folder:', fsErr);
    }

    return NextResponse.json({
      success: true,
      folderId,
    });
  } catch (error: any) {
    console.error('Error in /api/drive/create-folder:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
