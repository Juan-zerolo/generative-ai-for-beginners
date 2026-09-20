#!/bin/sh
# Genera las dos variantes, cada una etiquetada en el nombre de la app y en pantalla.
set -e
cd "$(dirname "$0")"
PAGE=src/pages/index/index.ux
MAN=src/manifest.json
cp "$PAGE" "$PAGE.bak"; cp "$MAN" "$MAN.bak"
mkdir -p out

build_variant() {
  variant="$1"; tag="$2"; cmd="$3"
  sed "s/__VARIANT__/$variant/" "$PAGE.bak" > "$PAGE"
  MAN_TAG="$tag" python3 -c "import json,os; p='$MAN'; m=json.load(open(p+'.bak')); m['name']=os.environ['MAN_TAG']+' Luz'; json.dump(m, open(p,'w'), indent=2, ensure_ascii=False)"
  rm -rf dist build
  npx aiot "$cmd" >/dev/null
  cp dist/*.rpk out/
}

build_variant RELEASE REL release
build_variant DEBUG DBG build

mv "$PAGE.bak" "$PAGE"; mv "$MAN.bak" "$MAN"
ls -1 out/
