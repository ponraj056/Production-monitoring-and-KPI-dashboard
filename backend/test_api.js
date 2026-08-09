const http = require('http');

const data = JSON.stringify({ username: 'admin', password: 'password123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => {
    try {
      const result = JSON.parse(body);
      const token = result.token;
      
      const options2 = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/machines/16/stats', // Using 16 as guess
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };

      const req2 = http.request(options2, res2 => {
        let body2 = '';
        res2.on('data', d => { body2 += d; });
        res2.on('end', () => {
          console.log('STATUS:', res2.statusCode);
          console.log('RESPONSE:', body2);
        });
      });
      req2.end();
    } catch(e) {
      console.log('Error parsing login:', e);
    }
  });
});
req.write(data);
req.end();
