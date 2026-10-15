import { NextRequest, NextResponse } from 'next/server';
import { writeFile, rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExecuteRequest {
  language: string; // 'python' | 'javascript' | 'java' | 'c' | 'c++'
  version?: string;
  code: string;
  stdin?: string;
}

interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number;
  compileError?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TIMEOUT_MS = 10_000; // 10 seconds max execution

// ─── Local Process Runner ─────────────────────────────────────────────────────

function runProcess(
  cmd: string,
  args: string[],
  stdin: string,
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    let proc: ReturnType<typeof spawn>;
    try {
      proc = spawn(cmd, args, {
        cwd,
        shell: false,
        windowsHide: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return resolve({
        stdout: '',
        stderr: `Failed to spawn ${cmd}: ${msg}`,
        exitCode: 1,
      });
    }

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        proc.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }, TIMEOUT_MS);

    if (stdin) {
      try {
        proc.stdin?.write(stdin);
        proc.stdin?.end();
      } catch {
        // stdin may not be writable for all processes
      }
    } else {
      try {
        proc.stdin?.end();
      } catch {
        /* ignore */
      }
    }

    proc.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: timedOut ? 'Error: Program exceeded time limit (10 seconds).' : stderr,
        exitCode: timedOut ? 124 : (code ?? 0),
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: `LOCAL_NOT_INSTALLED: ${err.message}`,
        exitCode: 127,
      });
    });
  });
}

// ─── Free Cloud Compiler Fallback (Wandbox) ──────────────────────────────────
// Wandbox is open-source, requires NO auth key, NO rate-limit login, and runs in sandbox.

async function executeViaWandbox(
  compiler: string,
  code: string,
  stdin: string = ''
): Promise<ExecuteResult> {
  const t = Date.now();
  const res = await fetch('https://wandbox.org/api/compile.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler,
      code,
      stdin,
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloud compiler error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const stdout = data.program_output || '';
  const stderr =
    (data.compiler_error ? data.compiler_error + '\n' : '') +
    (data.program_error || '');
  const exitCode = parseInt(data.status || '0', 10);

  return {
    stdout,
    stderr: stderr.trimEnd(),
    exitCode: isNaN(exitCode) ? 0 : exitCode,
    runtime: Date.now() - t,
    compileError: data.compiler_error || undefined,
  };
}

// ─── Language Execution Handlers ──────────────────────────────────────────────

async function executeJavaScript(
  code: string,
  stdin: string,
  dir: string
): Promise<ExecuteResult> {
  // JavaScript is guaranteed to run locally via Node.js
  const file = path.join(dir, 'main.js');
  await writeFile(file, code, 'utf8');
  const t = Date.now();
  const result = await runProcess('node', [file], stdin, dir);
  return { ...result, runtime: Date.now() - t };
}

async function executePython(
  code: string,
  stdin: string,
  dir: string
): Promise<ExecuteResult> {
  const file = path.join(dir, 'main.py');
  await writeFile(file, code, 'utf8');

  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
  const t = Date.now();
  const local = await runProcess(pythonCmd, [file], stdin, dir);

  // If local python is missing or failed to start (e.g. Windows Store alias stub)
  const isMissing =
    local.exitCode === 127 ||
    local.stderr.includes('LOCAL_NOT_INSTALLED') ||
    local.stderr.includes('Python was not found') ||
    local.stderr.includes('not recognized');

  if (isMissing) {
    // Seamless fallback to cloud sandbox
    return await executeViaWandbox('cpython-3.14.0', code, stdin);
  }

  return { ...local, runtime: Date.now() - t };
}

async function executeJava(
  code: string,
  stdin: string,
  dir: string
): Promise<ExecuteResult> {
  const file = path.join(dir, 'Main.java');
  await writeFile(file, code, 'utf8');

  // Step 1: Check local javac
  const compileStart = Date.now();
  const compile = await runProcess('javac', [file], '', dir);

  const isMissing =
    compile.exitCode === 127 ||
    compile.stderr.includes('LOCAL_NOT_INSTALLED') ||
    compile.stderr.includes('not recognized');

  if (isMissing) {
    // In Wandbox, the main file is prog.java.
    // Make sure 'public class <Name>' doesn't fail filename requirement by changing to 'class <Name>'
    const adjustedCode = code.replace(/\bpublic\s+class\s+/g, 'class ');
    return await executeViaWandbox('openjdk-jdk-21+35', adjustedCode, stdin);
  }

  if (compile.exitCode !== 0) {
    return {
      stdout: '',
      stderr: compile.stderr,
      exitCode: compile.exitCode,
      runtime: Date.now() - compileStart,
      compileError: compile.stderr,
    };
  }

  // Step 2: Run local java
  const runStart = Date.now();
  const result = await runProcess('java', ['-cp', dir, 'Main'], stdin, dir);
  return { ...result, runtime: Date.now() - runStart };
}

async function executeC(
  code: string,
  stdin: string,
  dir: string
): Promise<ExecuteResult> {
  const src = path.join(dir, 'main.c');
  const out = path.join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
  await writeFile(src, code, 'utf8');

  const compileStart = Date.now();
  const compile = await runProcess('gcc', [src, '-o', out, '-lm'], '', dir);

  const isMissing =
    compile.exitCode === 127 ||
    compile.stderr.includes('LOCAL_NOT_INSTALLED') ||
    compile.stderr.includes('not recognized');

  if (isMissing) {
    return await executeViaWandbox('gcc-head-c', code, stdin);
  }

  if (compile.exitCode !== 0) {
    return {
      stdout: '',
      stderr: compile.stderr,
      exitCode: compile.exitCode,
      runtime: Date.now() - compileStart,
      compileError: compile.stderr,
    };
  }

  const runStart = Date.now();
  const result = await runProcess(out, [], stdin, dir);
  return { ...result, runtime: Date.now() - runStart };
}

async function executeCpp(
  code: string,
  stdin: string,
  dir: string
): Promise<ExecuteResult> {
  const src = path.join(dir, 'main.cpp');
  const out = path.join(dir, process.platform === 'win32' ? 'main.exe' : 'main');
  await writeFile(src, code, 'utf8');

  const compileStart = Date.now();
  const compile = await runProcess(
    'g++',
    [src, '-o', out, '-std=c++17', '-lm'],
    '',
    dir
  );

  const isMissing =
    compile.exitCode === 127 ||
    compile.stderr.includes('LOCAL_NOT_INSTALLED') ||
    compile.stderr.includes('not recognized');

  if (isMissing) {
    return await executeViaWandbox('gcc-head', code, stdin);
  }

  if (compile.exitCode !== 0) {
    return {
      stdout: '',
      stderr: compile.stderr,
      exitCode: compile.exitCode,
      runtime: Date.now() - compileStart,
      compileError: compile.stderr,
    };
  }

  const runStart = Date.now();
  const result = await runProcess(out, [], stdin, dir);
  return { ...result, runtime: Date.now() - runStart };
}

async function executePhp(
  code: string,
  stdin: string,
  dir: string
): Promise<ExecuteResult> {
  const file = path.join(dir, 'main.php');
  await writeFile(file, code, 'utf8');

  const t = Date.now();
  const local = await runProcess('php', [file], stdin, dir);

  const isMissing =
    local.exitCode === 127 ||
    local.stderr.includes('LOCAL_NOT_INSTALLED') ||
    local.stderr.includes('not recognized') ||
    local.stderr.includes("The term 'php' is not recognized");

  if (isMissing) {
    return await executeViaWandbox('php-8.3.12', code, stdin);
  }

  return { ...local, runtime: Date.now() - t };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let tempDir: string | null = null;

  try {
    const body: ExecuteRequest = await req.json();
    const { language, code, stdin = '' } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields: language, code' },
        { status: 400 }
      );
    }

    // Basic security check for local execution
    const dangerousPatterns = [
      /require\s*\(\s*['"]child_process['"]\s*\)/,
      /import\s+subprocess/,
      /__import__\s*\(\s*['"]subprocess['"]\s*\)/,
      /Runtime\.getRuntime\(\)/,
      /ProcessBuilder/,
      /\bshell_exec\s*\(/,
      /\bpassthru\s*\(/,
      /\bsystem\s*\(/,
      /\bpopen\s*\(/,
      /\bproc_open\s*\(/,
    ];
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return NextResponse.json(
          {
            stdout: '',
            stderr: 'Security Policy: System process spawning is restricted.',
            exitCode: 1,
            runtime: 0,
          },
          { status: 200 }
        );
      }
    }

    // Create isolated temp directory per request
    const runId = randomUUID();
    tempDir = path.join(os.tmpdir(), `c3compiler_${runId}`);
    await mkdir(tempDir, { recursive: true });

    let result: ExecuteResult;

    switch (language.toLowerCase()) {
      case 'javascript':
        result = await executeJavaScript(code, stdin, tempDir);
        break;
      case 'python':
        result = await executePython(code, stdin, tempDir);
        break;
      case 'java':
        result = await executeJava(code, stdin, tempDir);
        break;
      case 'c':
        result = await executeC(code, stdin, tempDir);
        break;
      case 'c++':
      case 'cpp':
        result = await executeCpp(code, stdin, tempDir);
        break;
      case 'php':
        result = await executePhp(code, stdin, tempDir);
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported language: ${language}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json(
      {
        stdout: '',
        stderr: `Server error: ${message}`,
        exitCode: 1,
        runtime: 0,
      },
      { status: 500 }
    );
  } finally {
    // Always clean up temp files
    if (tempDir && existsSync(tempDir)) {
      try {
        await rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}
