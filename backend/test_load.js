try {
    console.log('Checking express...'); require('express');
    console.log('Checking cors...'); require('cors');
    console.log('Checking dotenv...'); require('dotenv');
    console.log('Checking @prisma/client...'); require('@prisma/client');
    console.log('Checking bcryptjs...'); require('bcryptjs');
    console.log('Checking jsonwebtoken...'); require('jsonwebtoken');
    console.log('Checking axios...'); require('axios');
    console.log('Checking uuid...'); require('uuid');
    console.log('Checking config...'); require('./config/config');
    console.log('Checking services/dockerSandbox...'); require('./services/dockerSandbox');
    console.log('Checking services/codeExecutor...'); require('./services/codeExecutor');
    console.log('All core modules loaded successfully!');
} catch (e) {
    console.error('Module load failed: ' + e.message);
}
