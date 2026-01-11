Role:
Act as a senior full-stack engineer and research-platform architect.

Task:
Design and implement a local-host research paper website using only vanilla HTML, CSS, and JavaScript.

Strict Constraints:

No frameworks

No libraries

No npm, Node.js, Docker, Vite, React, Vue, etc.

No external CDN dependencies

Must run in a browser via a simple local HTTP server (e.g., Python http.server)

All logic must be client-side JavaScript

Core Functionality:

Load research papers stored in a local folder

Papers must be written in Markdown (.md), not PDF

Use a JSON manifest file to index papers (title, filename, description, tags, year)

Fetch Markdown files using JavaScript and render them into HTML

Implement a custom lightweight Markdown renderer in pure JavaScript (headings, paragraphs, bold, italics, lists, code blocks, images, links)

Display papers in a clean, professional research layout (academic style, not blog style)

Provide paper list view + single paper reader view

Include search functionality (title + content)

UI / UX Requirements:

Research-paper aesthetic (arXiv / Nature / GitHub README hybrid)

Serif font for content

Wide margins, readable line spacing

Dark-mode optional but not required

No animations unless essential

File Structure Requirement:

/project-root
  index.html
  styles.css
  app.js
  papers.json
  /papers
    example_paper.md


Output Requirements:

Provide complete code for:

index.html

styles.css

app.js

papers.json

One sample .md research paper

Explain architecture briefly (max 5–6 bullet points)

Do NOT include explanations for beginners

Do NOT suggest libraries or tools

Do NOT include PDF generation unless optional and clearly separated

Goal:
The final system should feel like a local arXiv / research notebook, optimized for fast writing, clean reading, and future export to PDF if required.