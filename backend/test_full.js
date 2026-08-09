const http = require('http');
const data = JSON.stringify({ username: 'ponraj', password: 'password123' });
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};
const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    const result = JSON.parse(body);
    if (!result.token) { console.log('Login failed:', body); return; }
    console.log('Login OK, role:', result.user && result.user.role);
    const token = result.token;
    const opts2 = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/machines',
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    };
    const req2 = http.request(opts2, res2 => {
      let b = '';
      res2.on('data', d => { b += d; });
      res2.on('end', () => {
        const machines = JSON.parse(b);
        console.log('Machines count:', machines.length);
        if (machines.length === 0) { console.log('Still no machines!'); return; }
        const machineId = machines[0].id;
        console.log('Testing stats for machine:', machineId);
        const opts3 = {
          hostname: 'localhost', port: 5000,
          path: '/api/machines/' + machineId + '/stats',
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + token }
        };
        const req3 = http.request(opts3, res3 => {
          let b3 = '';
          res3.on('data', d => { b3 += d; });
          res3.on('end', () => {
            console.log('Stats status:', res3.statusCode, b3.substring(0, 200));
          });
        });
        req3.end();
      });
    });
    req2.end();
  });
});
req.write(data);
req.end();
