const axios = require('axios');
const config = require('../config/config');

/**
 * Map local language names to Piston language/version pairs
 */
const languageMap = {
    'python': { language: 'python', version: '3.10.0' },
    'python3': { language: 'python', version: '3.10.0' },
    'c': { language: 'c', version: '10.2.1' },
    'cpp': { language: 'c++', version: '10.2.1' },
    'c++': { language: 'c++', version: '10.2.1' },
    'java': { language: 'java', version: '15.0.2' }
};

/**
 * Execute code using Piston API
 * @param {string} code - The source code to execute
 * @param {string} language - Programming language
 * @param {string} stdin - Standard input
 * @param {number} timeout - Timeout (not directly supported by Piston but handled by backend)
 * @returns {Promise<object>} - Result object
 */
const executeInPiston = async (code, language, stdin = '', timeout = 5) => {
    const pistonUrl = process.env.PISTON_API_URL;
    if (!pistonUrl) {
        throw new Error('PISTON_API_URL is not configured');
    }

    const lang = language.toLowerCase();
    const runtime = languageMap[lang];

    if (!runtime) {
        throw new Error(`Unsupported language for Piston: ${language}`);
    }

    try {
        const response = await axios.post(`${pistonUrl}/execute`, {
            language: runtime.language,
            version: runtime.version,
            files: [
                {
                    content: code
                }
            ],
            stdin: stdin
        }, {
            timeout: (timeout + 2) * 1000 // External request timeout
        });

        const run = response.data.run;

        return {
            stdout: run.stdout || '',
            stderr: run.stderr || '',
            executionTime: 0, // Piston doesn't return exact time in response body usually
            error: run.signal ? `Program terminated by signal: ${run.signal}` : (run.code !== 0 ? `Exit code: ${run.code}` : null)
        };
    } catch (error) {
        console.error('Piston execution error:', error.message);
        throw new Error(`Execution failed: ${error.message}`);
    }
};

module.exports = {
    executeInPiston
};
