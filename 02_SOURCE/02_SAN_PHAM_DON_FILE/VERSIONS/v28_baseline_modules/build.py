#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""build.py -- ghep MODULES_V28 thanh 1 file HTML don (v28). Chay: python build.py"""
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

    import re
    # Replace all <link rel="stylesheet" href="..."> with combined style block
    out = re.sub(r'<link\s+rel="stylesheet"\s+href="[^"]*\.css">\s*', '', index_html)
    out = out.replace('</head>', '<style>\n' + css + '\n</style>\n</head>')
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

