<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:FFC94D,100:FF8A3D&height=200&section=header&text=Prism%20TODO%20Scanner&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Find%20every%20TODO%20%2F%20FIXME&descAlignY=58&descSize=16" width="100%" alt="Prism TODO Scanner" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=FFC94D&center=true&vCenter=true&width=680&lines=todos+--blame;9+items+in+4+files;todos+--md+%3E+TODO.md;--fail-on+FIXME%2CBUG" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-todo-scanner/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-todo-scanner/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-FFC94D?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-todo-scanner?style=for-the-badge&color=FF8A3D" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism TODO Scanner screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />

## ⚡ Overview

**Prism TODO Scanner** (`todos`) walks your project (respecting `.gitignore`) and collects every `TODO`, `FIXME`, `BUG`, `HACK`, `XXX`, `OPTIMIZE`, `REVIEW` and `NOTE` comment in any language — `//`, `#`, `/* */`, `<!-- -->`, `--`, `;`. It understands `TODO(author):` and `#123` issue refs, can add who wrote each one and how long ago via `git blame`, and exports a Markdown checklist you can paste straight into a GitHub issue.

## ✨ Features

- Works in **any language**: `//`, `#`, `/* */`, `<!-- -->`, `--`, `;`, `%`
- Parses `TODO(author):` and `#123` / `GH-123` issue references
- `--blame` adds author + age (`3mo ago`); `--sort age` shows the oldest debt first
- `--md -o TODO.md` exports a checklist with optional GitHub links via `--repo`
- `--fail-on FIXME,BUG` and `--max <n>` for CI gates; `--json` for scripts
- `.gitignore`-aware, skips binaries / lockfiles / minified files. Zero dependencies

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-todo-scanner . --blame

# or install globally
npm install -g github:krishyaa06/prism-todo-scanner
todos --md -o TODO.md
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
todos [dir] [options]

  -t, --tags <list>     tags to find (default: TODO,FIXME,BUG,HACK,XXX,OPTIMIZE,REVIEW,NOTE)
  -b, --blame           add author + age from git blame
  -s, --sort <by>       file | tag | age
      --md              Markdown checklist
  -o, --out <file>      write --md output to a file
      --json            JSON output
      --repo <url>      link files in --md to a GitHub repo
      --fail-on <list>  exit 1 if any of these tags exist
      --max <n>         fail if more than n items in total
```

### Recognised formats

```js
// TODO: plain
// TODO(soumya): with author
# FIXME #42 with an issue ref
/* HACK: block comments */
<!-- NOTE: html / markdown -->
```

Lowercase `todo` only counts when followed by `:` or `(`, so `todoList` and "a todo app" are ignored.

### CI gate

```yaml
- run: npx --yes github:krishyaa06/prism-todo-scanner --fail-on FIXME,BUG
```

## 📁 Project Structure

```
prism-todo-scanner/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── todos.js   # CLI entry
├── examples/
│   └── demo-app/   # sample project
│       ├── api/
│       │   └── main.py
│       ├── src/
│       │   ├── auth.ts
│       │   └── cart.js
│       └── README.md
├── src/
│   ├── index.js   # parser, scanner, blame, markdown
│   ├── ui.js   # colours, tables
│   └── walk.js   # gitignore-aware walker
├── test/
│   └── todos.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism TODO Scanner is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF8A3D,50:FFC94D,100:07060f&height=110&section=footer" width="100%" />
