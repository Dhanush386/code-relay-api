const { executeInDocker } = require('./dockerSandbox');
const { executeInPiston } = require('./pistonService');

const languageMap = {
    'C': 'c',
    'C++': 'cpp',
    'Python': 'python',
    'Java': 'java'
};

const runTestcases = async (code, language, testcases, timeLimit, memoryLimit) => {
    const results = [];

    for (const testcase of testcases) {
        try {
            const result = await executeCode(code, language, testcase.input, timeLimit);

            const actualOutput = result.output.trim();
            const expectedOutput = testcase.expectedOutput.trim();
            const passed = actualOutput === expectedOutput;

            results.push({
                testcaseId: testcase.id,
                passed,
                input: testcase.input,
                expectedOutput: testcase.expectedOutput,
                actualOutput: result.output,
                error: result.error,
                executionTime: result.executionTime
            });
        } catch (error) {
            results.push({
                testcaseId: testcase.id,
                passed: false,
                input: testcase.input,
                expectedOutput: testcase.expectedOutput,
                actualOutput: '',
                error: error.message,
                executionTime: 0
            });
        }
    }

    return results;
};

const executeCode = async (code, language, input, timeLimit) => {
    const startTime = Date.now();
    const usePiston = !!process.env.PISTON_API_URL;

    try {
        const targetLanguage = languageMap[language] || language.toLowerCase();

        console.log(`Executing code with ${usePiston ? 'Piston' : 'Docker sandbox'}:`, {
            language: targetLanguage,
            inputLength: input?.length || 0,
            timeout: timeLimit || 5
        });

        let result;
        if (usePiston) {
            result = await executeInPiston(code, targetLanguage, input || '', timeLimit || 5);
        } else {
            result = await executeInDocker(code, targetLanguage, input || '', timeLimit || 5);
        }

        return {
            output: result.stdout || '',
            error: result.stderr || (result.error ? result.error : null),
            executionTime: result.executionTime
        };

    } catch (error) {
        const executionTime = Date.now() - startTime;
        return {
            output: '',
            error: error.message,
            executionTime
        };
    }
};

module.exports = {
    runTestcases,
    executeCode
};
