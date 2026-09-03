# Runs SQL queries against schema + dataset seeds in fresh in-memory SQLite
# databases, mirroring the in-app sql.js grader.
# stdin:  {"schema": str, "datasets": [str], "queries": {name: sql}}
# stdout: {name: [ {"rows": [[...]], "columns": [...] } | {"error": str} per dataset ]}
import json, sqlite3, sys


def normalize(v):
    if isinstance(v, bool):
        return int(v)
    if isinstance(v, float):
        if v == int(v) and abs(v) < 1e15:
            return int(v)
        return round(v, 6)
    if isinstance(v, bytes):
        return v.decode('utf-8', 'replace')
    return v


def run(schema, seed, sql):
    con = sqlite3.connect(':memory:')
    try:
        con.executescript(schema)
        con.executescript(seed)
        cur = con.execute(sql)
        cols = [d[0] for d in cur.description] if cur.description else []
        rows = [[normalize(v) for v in r] for r in cur.fetchall()]
        return {'rows': rows, 'columns': cols}
    except Exception as e:
        return {'error': '%s: %s' % (type(e).__name__, e)}
    finally:
        con.close()


def main():
    payload = json.load(sys.stdin)
    out = {}
    for name, sql in payload['queries'].items():
        out[name] = [run(payload['schema'], seed, sql) for seed in payload['datasets']]
    print(json.dumps(out, default=str))


if __name__ == '__main__':
    main()
