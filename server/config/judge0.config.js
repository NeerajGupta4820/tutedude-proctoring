// Judge0 API Configuration
// Using RapidAPI Judge0 CE (Community Edition)

const judge0Config = {
  // RapidAPI Configuration
  rapidApi: {
    baseUrl: 'https://judge0-ce.p.rapidapi.com',
    host: 'judge0-ce.p.rapidapi.com',
    key: process.env.RAPIDAPI_KEY || 'your-rapidapi-key-here',
  },

  // Self-hosted Configuration (if you deploy your own Judge0)
  selfHosted: {
    baseUrl: process.env.JUDGE0_URL || 'http://localhost:2358',
  },

  // Use RapidAPI or Self-hosted
  useRapidApi: process.env.USE_RAPIDAPI === 'true' || true,

  // Language IDs for Judge0
  languageIds: {
    javascript: 63, // Node.js 12.14.0
    python: 71, // Python 3.8.1
    java: 62, // Java OpenJDK 13.0.1
    cpp: 54, // C++ GCC 9.2.0
    c: 50, // C GCC 9.2.0
    typescript: 74, // TypeScript 3.7.4
    csharp: 51, // C# Mono 6.6.0.161
    go: 60, // Go 1.13.5
    rust: 73, // Rust 1.40.0
  },

  // Language display names
  languageNames: {
    63: 'JavaScript (Node.js 12.14.0)',
    71: 'Python (3.8.1)',
    62: 'Java (OpenJDK 13.0.1)',
    54: 'C++ (GCC 9.2.0)',
    50: 'C (GCC 9.2.0)',
    74: 'TypeScript (3.7.4)',
    51: 'C# (Mono 6.6.0.161)',
    60: 'Go (1.13.5)',
    73: 'Rust (1.40.0)',
  },

  // Default execution limits
  defaults: {
    timeLimit: 5, // seconds
    memoryLimit: 256000, // KB (256 MB)
    stackLimit: 64000, // KB (64 MB)
    maxFileSize: 1024, // KB
  },

  // Status codes from Judge0
  statusCodes: {
    1: { status: 'in_queue', description: 'In Queue' },
    2: { status: 'processing', description: 'Processing' },
    3: { status: 'accepted', description: 'Accepted' },
    4: { status: 'wrong_answer', description: 'Wrong Answer' },
    5: { status: 'time_limit_exceeded', description: 'Time Limit Exceeded' },
    6: { status: 'compilation_error', description: 'Compilation Error' },
    7: {
      status: 'runtime_error_sigsegv',
      description: 'Runtime Error (SIGSEGV)',
    },
    8: {
      status: 'runtime_error_sigxfsz',
      description: 'Runtime Error (SIGXFSZ)',
    },
    9: {
      status: 'runtime_error_sigfpe',
      description: 'Runtime Error (SIGFPE)',
    },
    10: {
      status: 'runtime_error_sigabrt',
      description: 'Runtime Error (SIGABRT)',
    },
    11: { status: 'runtime_error_nzec', description: 'Runtime Error (NZEC)' },
    12: { status: 'runtime_error_other', description: 'Runtime Error (Other)' },
    13: { status: 'internal_error', description: 'Internal Error' },
    14: { status: 'exec_format_error', description: 'Exec Format Error' },
  },

  // Map status ID to simplified status
  getSimplifiedStatus: (statusId) => {
    const statusMap = {
      1: 'pending',
      2: 'running',
      3: 'accepted',
      4: 'wrong_answer',
      5: 'time_limit_exceeded',
      6: 'compilation_error',
      7: 'runtime_error',
      8: 'runtime_error',
      9: 'runtime_error',
      10: 'runtime_error',
      11: 'runtime_error',
      12: 'runtime_error',
      13: 'internal_error',
      14: 'runtime_error',
    };
    return statusMap[statusId] || 'internal_error';
  },

  // Get language ID from language name
  getLanguageId: (language) => {
    const langLower = language.toLowerCase();
    return judge0Config.languageIds[langLower] || 63; // Default to JavaScript
  },

  // Polling configuration for async submissions
  polling: {
    maxAttempts: 30,
    intervalMs: 1000, // 1 second
  },
};

export default judge0Config;
