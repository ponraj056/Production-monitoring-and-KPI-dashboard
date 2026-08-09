const http = require('http');
const data = JSON.stringify({ identifier: 'ponraj', password: 'password123' });
const options = {
  hostname: 'localhost', port: 5000, path: '/api/auth/login',
  method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};
const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    const result = JSON.parse(body);
    if (!result.token) { console.log('Login failed:', body); return; }
    console.log('Login OK');
    const token = result.token;
    const req2 = http.request({ hostname: 'localhost', port: 5000, path: '/api/machines', headers: { 'Authorization': 'Bearer ' + token }}, res2 => {
      let b = '';
      res2.on('data', d => { b += d; });
      res2.on('end', () => {
        const machines = JSON.parse(b);
        console.log('Machines:', machines.length, 'found');
        if (machines.length === 0) return;
        const mid = machines[0].id;
        console.log('Testing stats for machine:', mid, machines[0].name);
        const req3 = http.request({ hostname: 'localhost', port: 5000, path: '/api/machines/' + mid + '/stats', headers: { 'Authorization': 'Bearer ' + token }}, res3 => {
          let b3 = '';
          res3.on('data', d => { b3 += d; });
          res3.on('end', () => { console.log('Stats STATUS:', res3.statusCode, b3.substring(0, 100)); });
        });
        req3.end();
      });
    });
    req2.end();
  });
});
req.write(data);
req.end();
