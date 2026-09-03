# Offline twin of the in-app Pyodide grader (see src/practice/practiceHtml.ts).
# Reads JSON on stdin: {"code": "<python source>", "tests": [{"id":..., "fn":..., "input": [...], "expected": ..., "compare": "exact"|"unordered"}]}
# Writes JSON on stdout: [{"id":..., "pass": bool, "got": ..., "error": str|None}]
import json, sys, copy, traceback, io, signal


def _canon_key(x):
    return json.dumps(x, sort_keys=True, default=str)


def _normalize(x):
    if isinstance(x, bool):
        return x
    if isinstance(x, (tuple, list)):
        return [_normalize(i) for i in x]
    if isinstance(x, (set, frozenset)):
        return sorted((_normalize(i) for i in x), key=_canon_key)
    if isinstance(x, dict):
        return {str(k): _normalize(v) for k, v in x.items()}
    return x


def _equal(a, b, compare='exact'):
    a = _normalize(a)
    b = _normalize(b)
    if isinstance(a, float) or isinstance(b, float):
        try:
            return abs(float(a) - float(b)) < 1e-6
        except Exception:
            return False
    if compare == 'unordered' and isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return False
        return sorted(map(_canon_key, a)) == sorted(map(_canon_key, b))
    return a == b


class Timeout(Exception):
    pass


def _alarm(signum, frame):
    raise Timeout('timed out (5s)')


def main():
    payload = json.load(sys.stdin)
    ns = {}
    results = []
    try:
        exec(payload['code'], ns)
    except Exception as e:
        for t in payload['tests']:
            results.append({'id': t['id'], 'pass': False, 'got': None, 'error': 'code failed to load: %s: %s' % (type(e).__name__, e)})
        print(json.dumps(results, default=str))
        return
    signal.signal(signal.SIGALRM, _alarm)
    for t in payload['tests']:
        fn = ns.get(t['fn'])
        if not callable(fn):
            results.append({'id': t['id'], 'pass': False, 'got': None, 'error': 'function %s not defined' % t['fn']})
            continue
        old_stdout = sys.stdout
        sys.stdout = io.StringIO()
        try:
            signal.alarm(5)
            got = fn(*copy.deepcopy(t['input']))
            signal.alarm(0)
            ok = _equal(got, t['expected'], t.get('compare', 'exact'))
            results.append({'id': t['id'], 'pass': bool(ok), 'got': _normalize(got), 'error': None})
        except BaseException as e:
            signal.alarm(0)
            results.append({'id': t['id'], 'pass': False, 'got': None, 'error': '%s: %s' % (type(e).__name__, e)})
        finally:
            sys.stdout = old_stdout
    print(json.dumps(results, default=str))


if __name__ == '__main__':
    main()
