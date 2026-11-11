# Offline twin of the in-app Pyodide grader (see src/practice/practiceHtml.ts).
# Reads JSON on stdin: {"code": "<python source>", "tests": [{"id":..., "fn":..., "input": [...], "expected": ..., "compare": "exact"|"unordered", "structs": {"args": [...], "returns": ...}|null}]}
# Writes JSON on stdout: [{"id":..., "pass": bool, "got": ..., "error": str|None}]
import json, sys, copy, traceback, io, signal


def _canon_key(x):
    return json.dumps(x, sort_keys=True, default=str)


def _normalize(x):
    if isinstance(x, bool):
        return x
    if isinstance(x, _LISTY):
        # A deque or dict view grades as a plain list.
        x = list(x)
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


# --- Tree / linked-list support ---------------------------------------------
# Problems that declare structs get real node objects instead of raw arrays:
# level-order arrays become TreeNode trees, value lists become ListNode chains,
# and returned nodes are flattened back so results compare against plain JSON.
import collections, heapq, bisect, math, itertools, functools, string, re, random, operator, typing

# Names available to every solution without an import, the way interview
# sites provide them. Anything the user defines or imports themselves wins.
_PRELOAD_NAMES = [
    (collections, 'deque defaultdict Counter OrderedDict namedtuple'),
    (heapq, 'heappush heappop heapify heappushpop heapreplace nlargest nsmallest'),
    (bisect, 'bisect_left bisect_right insort insort_left insort_right'),
    (math, 'inf gcd lcm ceil floor sqrt isqrt comb factorial log2'),
    (functools, 'lru_cache cache reduce cmp_to_key'),
    (itertools, 'accumulate permutations combinations combinations_with_replacement product zip_longest chain groupby pairwise'),
    (typing, 'Optional List Dict Tuple Set Any Deque DefaultDict Union Callable Iterable Iterator'),
]
_PRELOAD_MODULES = [collections, heapq, bisect, math, itertools, functools, string, re, random, operator, typing]

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return 'TreeNode(' + repr(self.val) + ')'

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return 'ListNode(' + repr(self.val) + ')'

_MAX_NODES = 100000

def _base_globals():
    glb = {'__name__': '__main__', 'TreeNode': TreeNode, 'ListNode': ListNode}
    for mod in _PRELOAD_MODULES:
        glb[mod.__name__] = mod
    for mod, names in _PRELOAD_NAMES:
        for name in names.split():
            glb[name] = getattr(mod, name)
    return glb

# Concrete collections that grade as plain lists. Lazy iterators (generators,
# map, zip...) are deliberately NOT included: returning one where a list is
# expected is a real bug, and some debug problems are about exactly that.
_LISTY = (collections.deque, type({}.keys()), type({}.values()), type({}.items()))

def _json_safe(x):
    # JSON has no inf / nan; show them as text instead of breaking the result.
    if isinstance(x, float) and (x != x or x in (math.inf, -math.inf)):
        return str(x)
    if isinstance(x, list):
        return [_json_safe(i) for i in x]
    if isinstance(x, dict):
        return {str(k): _json_safe(v) for k, v in x.items()}
    return x

def _build_tree(vals, cls):
    # Standard level-order encoding: children of a missing node are omitted.
    if not vals or vals[0] is None:
        return None
    root = cls(vals[0])
    queue = [root]
    qi = 0
    i = 1
    while i < len(vals) and qi < len(queue):
        node = queue[qi]
        qi += 1
        if vals[i] is not None:
            node.left = cls(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = cls(vals[i])
            queue.append(node.right)
        i += 1
    return root

def _build_list(vals, cls, pos=-1):
    nodes = [cls(v) for v in (vals or [])]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    if nodes and isinstance(pos, int) and 0 <= pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return (nodes[0] if nodes else None), nodes

def _dump_tree(root):
    out = []
    queue = [root]
    qi = 0
    while qi < len(queue):
        node = queue[qi]
        qi += 1
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        if len(out) > _MAX_NODES:
            raise ValueError('Returned tree is too large (does it contain a cycle?)')
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def _dump_list(head):
    out = []
    node = head
    while node is not None:
        out.append(node.val)
        if len(out) > _MAX_NODES:
            raise ValueError('Returned list never ends (does it contain a cycle?)')
        node = node.next
    return out

def _prepare_args(inputs, structs, glb):
    kinds = (structs or {}).get('args') or []
    if not kinds:
        return list(inputs), None
    # Honour a TreeNode / ListNode class the user defined themselves.
    tree_cls = glb.get('TreeNode', TreeNode)
    list_cls = glb.get('ListNode', ListNode)
    args = []
    cycle_nodes = None
    i = 0
    while i < len(inputs):
        kind = kinds[i] if i < len(kinds) else None
        if kind == 'tree':
            args.append(_build_tree(inputs[i], tree_cls))
        elif kind == 'list':
            args.append(_build_list(inputs[i], list_cls)[0])
        elif kind == 'cycle':
            # Consumes two inputs: the values and the index the tail links to.
            pos = inputs[i + 1] if i + 1 < len(inputs) else -1
            head, cycle_nodes = _build_list(inputs[i], list_cls, pos)
            args.append(head)
            i += 1
        else:
            args.append(inputs[i])
        i += 1
    return args, cycle_nodes

def _export_value(value, structs, cycle_nodes):
    ret = (structs or {}).get('returns')
    if ret == 'tree':
        if value is None:
            return []
        if hasattr(value, 'left') and hasattr(value, 'right'):
            return _dump_tree(value)
    elif ret == 'list':
        if value is None:
            return []
        if hasattr(value, 'next') and hasattr(value, 'val'):
            return _dump_list(value)
    elif ret == 'node_index':
        if value is None:
            return -1
        for idx, node in enumerate(cycle_nodes or []):
            if node is value:
                return idx
    return value


class Timeout(Exception):
    pass


def _alarm(signum, frame):
    raise Timeout('timed out (5s)')


def main():
    payload = json.load(sys.stdin)
    ns = _base_globals()
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
            structs = t.get('structs')
            args, cycle_nodes = _prepare_args(copy.deepcopy(t['input']), structs, ns)
            signal.alarm(5)
            got = fn(*args)
            signal.alarm(0)
            got = _normalize(_export_value(got, structs, cycle_nodes))
            ok = _equal(got, t['expected'], t.get('compare', 'exact'))
            results.append({'id': t['id'], 'pass': bool(ok), 'got': _json_safe(got), 'error': None})
        except BaseException as e:
            signal.alarm(0)
            results.append({'id': t['id'], 'pass': False, 'got': None, 'error': '%s: %s' % (type(e).__name__, e)})
        finally:
            sys.stdout = old_stdout
    print(json.dumps(results, default=str))


if __name__ == '__main__':
    main()
