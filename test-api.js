#!/usr/bin/env node

// 简单的API测试脚本
import http from 'http';

// 测试直接访问HPR API
const options = {
  hostname: '127.0.0.1',
  port: 8848,
  path: '/info',
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + Buffer.from('hpr:p@ssw0rd').toString('base64')
  }
};

console.log('测试HPR API连接...');
console.log('URL: http://127.0.0.1:8848/info');
console.log('认证: Basic Auth (hpr:p@ssw0rd)');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  console.log(`响应头: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应内容:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`请求错误: ${e.message}`);
});

req.end();
