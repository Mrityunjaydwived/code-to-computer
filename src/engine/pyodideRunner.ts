// WebAssembly CPython 3 Runner using Pyodide
// Allows running 100% of Python 3 code in browser (competitive programming, algorithms, standard library)

export interface PyodideRunResult {
  stdout: string[];
  stderr?: string;
  executionTimeMs: number;
  error?: {
    message: string;
    line?: number;
  };
}

let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

export async function getPyodide(): Promise<any> {
  if (pyodideInstance) return pyodideInstance;
  if (pyodideLoadingPromise) return pyodideLoadingPromise;

  pyodideLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      // Check if pyodide script already injected
      if (!(window as any).loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((res, rej) => {
          script.onload = res;
          script.onerror = () => rej(new Error('Failed to load Pyodide WebAssembly CDN.'));
        });
      }

      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
      });

      pyodideInstance = pyodide;
      resolve(pyodide);
    } catch (err) {
      pyodideLoadingPromise = null;
      reject(err);
    }
  });

  return pyodideLoadingPromise;
}

export async function executePythonWithWasm(
  sourceCode: string,
  stdinInput: string = ''
): Promise<PyodideRunResult> {
  const startTime = performance.now();
  try {
    const pyodide = await getPyodide();

    // Prepare wrapper script that redirects stdin/stdout safely
    const harness = `
import sys
import io

sys_stdout_backup = sys.stdout
sys_stderr_backup = sys.stderr
sys_stdin_backup = sys.stdin

sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
sys.stdin = io.StringIO(${JSON.stringify(stdinInput)})

__py_error = None
try:
    code_obj = compile(${JSON.stringify(sourceCode)}, '<user_code>', 'exec')
    exec(code_obj, globals())
except Exception as e:
    import traceback
    __py_error = traceback.format_exc()

__stdout_val = sys.stdout.getvalue()
__stderr_val = sys.stderr.getvalue()

sys.stdout = sys_stdout_backup
sys.stderr = sys_stderr_backup
sys.stdin = sys_stdin_backup
`;

    await pyodide.runPythonAsync(harness);

    const stdoutRaw = pyodide.globals.get('__stdout_val') || '';
    const stderrRaw = pyodide.globals.get('__stderr_val') || '';
    const pyError = pyodide.globals.get('__py_error');

    const duration = Math.round(performance.now() - startTime);
    const stdoutLines = stdoutRaw.split('\n').filter((line: string, i: number, arr: string[]) => {
      // keep empty lines except trailing one
      return i < arr.length - 1 || line.length > 0;
    });

    if (pyError) {
      return {
        stdout: stdoutLines,
        stderr: stderrRaw,
        executionTimeMs: duration,
        error: {
          message: pyError,
        },
      };
    }

    return {
      stdout: stdoutLines,
      stderr: stderrRaw,
      executionTimeMs: duration,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    return {
      stdout: [],
      executionTimeMs: duration,
      error: {
        message: err.message || 'Error executing Python WebAssembly runtime.',
      },
    };
  }
}
