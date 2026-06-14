import http from 'http';

const req = http.request(
  {
    hostname: 'localhost',
    port: 3000,
    path: '/api/create-razorpay-order',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  },
  (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', data));
  }
);
req.write(JSON.stringify({ amount: 500, plan: '6_months' }));
req.end();
