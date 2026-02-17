const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '../temp');
const DOCKER_IMAGE = 'code-relay-executor';

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Execute code in a Docker container
 * @param {string} code - The source code to execute
 * @param {string} language - Programming language (c, cpp, python, java)
 * @param {string} stdin - Standard input for the program
 * @param {number} timeout - Execution timeout in seconds
 * @returns {Promise<object>} - Result object with stdout, stderr, and execution time
 */
const executeInDocker = (code, language, stdin = '', timeout = 5) => {
    return new Promise((resolve, reject) => {
        const id = uuidv4();
        const dir = path.join(TEMP_DIR, id);

        fs.mkdirSync(dir);

        let filename, compileCmd, runCmd;
        const lang = language.toLowerCase();

        if (lang === 'python' || lang === 'python3') {
            filename = 'solution.py';
            runCmd = `python3 ${filename}`;
        } else if (lang === 'c') {
            filename = 'solution.c';
            compileCmd = `gcc ${filename} -o solution`;
            runCmd = './solution';
        } else if (lang === 'cpp' || lang === 'c++') {
            filename = 'solution.cpp';
            compileCmd = `g++ ${filename} -o solution`;
            runCmd = './solution';
        } else if (lang === 'java') {
            filename = 'Solution.java';
            compileCmd = `javac ${filename}`;
            runCmd = 'java Solution';
        } else {
            return reject(new Error(`Unsupported language: ${language}`));
        }

        fs.writeFileSync(path.join(dir, filename), code);
        fs.writeFileSync(path.join(dir, 'input.txt'), stdin);

        const startTime = Date.now();

        // Docker command parts
        const memoryLimit = '256m';
        const cpuPeriod = '100000';
        const cpuQuota = '50000'; // 50% CPU

        const dockerCmd = `docker run --rm \
            -v "${dir}:/workspace" \
            -w /workspace \
            --memory="${memoryLimit}" \
            --cpu-period=${cpuPeriod} \
            --cpu-quota=${cpuQuota} \
            --network none \
            ${DOCKER_IMAGE} \
            /bin/bash -c "${compileCmd ? `${compileCmd} && ` : ''}cat input.txt | ${runCmd}"`;

        exec(dockerCmd, { timeout: timeout * 1000 }, (error, stdout, stderr) => {
            const executionTime = Date.now() - startTime;

            // Cleanup
            try {
                fs.rmSync(dir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Failed to cleanup temp files:', cleanupError);
            }

            if (error && error.killed) {
                return resolve({
                    stdout: stdout,
                    stderr: stderr || 'Execution Timed Out',
                    executionTime,
                    timedOut: true
                });
            }

            resolve({
                stdout,
                stderr,
                executionTime,
                error: error ? error.message : null
            });
        });
    });
};

module.exports = {
    executeInDocker
};
