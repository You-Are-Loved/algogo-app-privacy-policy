#!/usr/bin/env python3
"""Upload local image/video files into the UseFastlane AI media library.

Three-step flow (discovered live against api.usefastlane.ai/api/v1):
  1. POST /media/upload-url {filename, contentType, sizeBytes}
       -> {uploadId, uploadUrl (presigned R2 PUT, 15-min expiry), headers}
  2. PUT the raw bytes to uploadUrl with the returned Content-Type
  3. POST /media {uploadId} -> {mediaId, status}

Reads FASTLANE_API_KEY from the environment (never store the key in a file).
Writes a sanitized run log to marketing/fastlane/runs/<timestamp>/.

Usage:
  FASTLANE_API_KEY=... python3 upload_media.py <file-or-dir> [more...]
"""
import json
import mimetypes
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

BASE = "https://api.usefastlane.ai/api/v1"
UA = "usefastlane-ai-agent/1.0"
CONTENT_TYPES = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
                 ".mp4": "video/mp4", ".mov": "video/quicktime", ".webp": "image/webp"}


def _key():
    k = os.environ.get("FASTLANE_API_KEY")
    if not k:
        sys.exit("FASTLANE_API_KEY is not set in the environment.")
    return k


def _req(method, url, body=None, headers=None, raw=None, timeout=120):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("User-Agent", UA)
    for h, v in (headers or {}).items():
        req.add_header(h, v)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                ct = r.headers.get("Content-Type", "")
                payload = r.read()
                return r.status, (json.loads(payload) if "json" in ct and payload else payload)
        except urllib.error.HTTPError as e:
            payload = e.read()
            if e.code == 429 and attempt < 4:
                retry = int(e.headers.get("Retry-After", "3"))
                time.sleep(retry)
                continue
            try:
                return e.code, json.loads(payload)
            except Exception:
                return e.code, payload


def api(method, path, body=None):
    return _req(method, BASE + path, body=body,
                headers={"Authorization": f"Bearer {_key()}",
                         "Accept": "application/json",
                         "Content-Type": "application/json; charset=utf-8"})


def content_type(path):
    ext = os.path.splitext(path)[1].lower()
    return CONTENT_TYPES.get(ext) or mimetypes.guess_type(path)[0] or "application/octet-stream"


def upload_one(path):
    name = os.path.basename(path)
    size = os.path.getsize(path)
    ct = content_type(path)
    # 1. reserve an upload URL
    st, res = api("POST", "/media/upload-url",
                  {"filename": name, "contentType": ct, "sizeBytes": size})
    if st >= 300:
        return {"file": name, "ok": False, "step": "upload-url", "status": st, "error": res}
    d = res["data"]
    # 2. PUT the bytes to the presigned URL
    with open(path, "rb") as f:
        st2, _ = _req("PUT", d["uploadUrl"], raw=f.read(),
                      headers={"Content-Type": d["headers"]["Content-Type"]})
    if st2 >= 300:
        return {"file": name, "ok": False, "step": "put", "status": st2}
    # 3. finalize into the library
    st3, res3 = api("POST", "/media", {"uploadId": d["uploadId"]})
    if st3 >= 300:
        return {"file": name, "ok": False, "step": "finalize", "status": st3, "error": res3}
    md = res3["data"]
    return {"file": name, "ok": True, "mediaId": md.get("mediaId"),
            "status": md.get("status"), "contentType": ct, "sizeBytes": size}


def collect(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            files += [os.path.join(p, f) for f in sorted(os.listdir(p))
                      if os.path.splitext(f)[1].lower() in CONTENT_TYPES]
        elif os.path.isfile(p):
            files.append(p)
    return files


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    files = collect(sys.argv[1:])
    if not files:
        sys.exit("No image/video files found.")
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "runs", ts)
    os.makedirs(run_dir, exist_ok=True)
    results = []
    print(f"Uploading {len(files)} file(s) to the Fastlane media library...")
    for path in files:
        r = upload_one(path)
        results.append(r)
        if r["ok"]:
            print(f"  ok   {r['file']:<28} mediaId={r['mediaId']} ({r['status']})")
        else:
            print(f"  FAIL {r['file']:<28} step={r.get('step')} status={r.get('status')}")
        time.sleep(0.4)  # stay well under 20 req/min
    ok = [r for r in results if r["ok"]]
    # sanitized log: filenames, mediaIds, status only
    with open(os.path.join(run_dir, "results.json"), "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nDone: {len(ok)}/{len(files)} uploaded. Log: {run_dir}/results.json")
    print("Media IDs:", ", ".join(r["mediaId"] for r in ok))


if __name__ == "__main__":
    main()
