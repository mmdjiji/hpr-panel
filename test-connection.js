#!/usr/bin/env node

/**
 * HPR API 连接测试脚本
 * 用于验证 HPR 服务是否正常运行并可访问
 */

import https from 'https';
import http from 'http';

const HPR_URL = process.env.HPR_URL || 'http://127.0.0.1:8848';
const USERNAME = process.env.HPR_USERNAME || 'hpr';
const PASSWORD = process.env.HPR_PASSWORD || 'p@ssw0rd';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      ...options,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HPR-Panel-Test/1.0.0',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testConnection() {
  console.log('🔍 测试 HPR API 连接...');
  console.log(`📍 目标地址: ${HPR_URL}`);
  console.log(`👤 认证用户: ${USERNAME}`);
  console.log('');

  try {
    // 测试基本连接
    console.log('1️⃣ 测试基本连接...');
    const basicAuth = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
    
    const response = await makeRequest(`${HPR_URL}/info`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    });

    if (response.status === 200) {
      console.log('✅ 连接成功！');
      console.log('📊 系统信息:');
      console.log(`   - HPR 版本: ${response.data.hpr?.version || 'N/A'}`);
      console.log(`   - 仓库数量: ${response.data.hpr?.repositroies || 0}`);
      console.log(`   - 已处理任务: ${response.data.jobs?.total_processed || 0}`);
      console.log(`   - 定时任务: ${response.data.jobs?.total_scheduled || 0}`);
      console.log(`   - 队列中任务: ${response.data.jobs?.total_enqueued || 0}`);
      console.log(`   - 失败任务: ${response.data.jobs?.total_failures || 0}`);
    } else {
      console.log(`❌ 连接失败，状态码: ${response.status}`);
      console.log('响应内容:', response.data);
    }

  } catch (error) {
    console.log('❌ 连接错误:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 建议: 请确认 HPR 服务是否已启动');
    } else if (error.message.includes('timeout')) {
      console.log('💡 建议: 请检查网络连接或服务响应时间');
    }
  }

  console.log('');
  console.log('🔧 环境变量配置:');
  console.log(`   HPR_URL=${HPR_URL}`);
  console.log(`   HPR_USERNAME=${USERNAME}`);
  console.log(`   HPR_PASSWORD=${PASSWORD}`);
  console.log('');
  console.log('💡 如需修改配置，请设置相应的环境变量');
}

// 运行测试
testConnection().catch(console.error);
