#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build.py -- ghep MODULES_V26 thanh 1 file HTML don (v26). Chay: python build.py"""
import json, os, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))

def main():
    with open(os.path.join(ROOT, "manifest.json"), "r", encoding="utf-8") as f:
        manifest = json.load(f)
    with open(os.path.join(ROOT, manifest["index"]), "r", encoding="utf-8") as f:
        index_html = f.read()
    css_parts = []
    for p in manifest["css"]:
        with open(os.path.join(ROOT, p), "r", encoding="utf-8") as f:
            css_parts.append(f.read())
    css = "\n".join(css_parts)
    js_parts = []
    for p in manifest["js"]:
        with open(os.path.join(ROOT, p), "r", encoding="utf-8") as f:
            js_parts.append(f.read())
    js = "\n\n".join(js_parts)

    out = index_html.replace('<link rel="stylesheet" href="css/main.css">',
                              "<style>\n" + css + "\n</style>")
    for p in manifest["js"]:
        out = out.replace(f'<script src="{p}"></script>', "")
    out = out.replace("</body>", "<script>\n" + js + "\n</script>\n</body>")

    out_path = os.path.join(ROOT, manifest["output"])
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    size = os.path.getsize(out_path)
    sha = hashlib.sha256(out.encode("utf-8")).hexdigest()
    print("Da ghep:", manifest["output"], "(" + str(size) + " bytes)", "SHA-256:", sha)

if __name__ == "__main__":
    main()
