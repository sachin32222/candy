'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AutomationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const userId = searchParams.get('user_id');
  const error = searchParams.get('error');

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Candei Automations</h1>
      {status === 'connected' && (
        <div style={{ color: 'green', marginTop: '1rem' }}>
          <p>✅ Instagram Connected Successfully!</p>
          <p>User ID: {userId}</p>
        </div>
      )}
      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          <p>❌ Connection Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense fallback={<div>Loading automations...</div>}>
      <AutomationContent />
    </Suspense>
  );
}
