# SutraAI

SutraAI is building a Ghostwriter-style agent for Agentforce voice agents. It extends the Knowledge Gap Generation (KGG) pipeline so it can improve existing agents from live sessions and build new agents from SOPs. Every change it makes is a reviewable diff, and it never deploys to production.

## Docs

- [Feature catalog (F1–F12)](docs/ghostwriter/feature-catalog.md): every candidate feature, with its phase, its reuse of KGG and its dependencies.
- [Architecture and design (F1–F4, F7)](docs/ghostwriter/architecture-design-f1-f4-f7.md): the first build, covering gap mining, diagnosis, change drafting, test generation and building agents from SOPs.

## HTML version

The docs also come as self-contained HTML pages in an ADP-style theme, in [`docs/ghostwriter/html/`](docs/ghostwriter/html/index.html). Open `index.html` in a browser. To rebuild the pages after editing the Markdown:

```bash
cd tools/docs-html && npm install && npm run build
```
