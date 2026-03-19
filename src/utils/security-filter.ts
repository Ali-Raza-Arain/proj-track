const SENSITIVE_KEYWORDS = [
  'password',
  'passwd',
  'secret',
  'token',
  'key=',
  'api_key',
  'apikey',
  'auth_token',
  'access_key',
  'private_key',
  '-p ',
  '--password',
  'credential',
];

const INTERNAL_PREFIXES = [
  '__vsc',
  '__proj',
  '__git',
];

/**
 * Noise commands that are too trivial to track.
 * Matched as exact command or as prefix followed by a space.
 */
const NOISE_COMMANDS = [
  'cd',
  'ls',
  'clear',
  'echo',
  'cat',
  'pwd',
  'exit',
  'history',
  'which',
  'whoami',
  'true',
  'false',
];

/**
 * Check if a command is a noise/trivial command not worth tracking.
 */
export function isNoiseCommand(cmd: string): boolean {
  const trimmed = cmd.trim();
  for (const noise of NOISE_COMMANDS) {
    if (trimmed === noise || trimmed.startsWith(noise + ' ')) {
      return true;
    }
  }
  return false;
}

/**
 * Determine if a command contains sensitive information that should NOT be saved.
 * Returns true if the command should be filtered out.
 */
export function isSensitive(cmd: string): boolean {
  // Never filter proj-track's own commands
  if (cmd.startsWith('proj-track') || cmd.startsWith('track ') || cmd === 'track') {
    return false;
  }

  // Filter VS Code and other internal terminal commands
  if (INTERNAL_PREFIXES.some(prefix => cmd.startsWith(prefix))) {
    return true;
  }

  // Filter noise commands
  if (isNoiseCommand(cmd)) {
    return true;
  }

  // Filter commands containing sensitive keywords
  const lowerCmd = cmd.toLowerCase();
  if (SENSITIVE_KEYWORDS.some(keyword => lowerCmd.includes(keyword))) {
    return true;
  }

  // Filter inline environment variable assignments with sensitive names
  if (/\b(password|secret|token|api_key|auth)=/i.test(cmd)) {
    return true;
  }

  return false;
}
