# Research Paper Submission Guidelines

## File Naming
- Use the following format: `YYYY-MM-DD-Slugified-Title.md`
  - Example: `2025-01-11-attention-mechanisms.md`
- Keep filenames lowercase with hyphens

## Required Metadata
Each paper must include the following frontmatter at the top of the file:

```yaml
---
title: "Full Paper Title"
authors: ["Author One", "Author Two"]
categories: ["Machine Learning", "NLP"]
tags: ["attention", "transformers", "deep-learning"]
year: 2024
conference: "Conference/Journal Name"
url: "https://example.com/paper"
doi: "10.xxxx/xxxxxx"
---
```

## Content Formatting
- Use standard Markdown formatting
- Use proper heading hierarchy (## for main sections, ### for subsections)
- Include code blocks with language specification
- Use LaTeX for mathematical notation: `$E = mc^2$`
- Add references using numbered citations: `[1]`

## Paper Structure
1. Abstract
2. Introduction
3. Related Work
4. Methodology
5. Experiments
6. Results
7. Conclusion
8. References

## Updating papers.json
After adding a new paper, update `papers.json` with:
- Title (matching the frontmatter)
- Filename (including .md extension)
- Short description (1-2 sentences)
- Tags (matching frontmatter tags)
- Year of publication
- Author(s)

Example entry:
```json
{
  "title": "Attention Is All You Need",
  "filename": "2024-01-11-attention-mechanisms.md",
  "description": "A novel neural network architecture based solely on attention mechanisms.",
  "tags": ["attention", "transformers", "nlp"],
  "year": 2024,
  "authors": ["Vaswani et al."],
  "categories": ["Machine Learning", "NLP"]
}
```

## Best Practices
- Keep papers focused and well-structured
- Include relevant figures and tables with proper captions
- Use consistent formatting throughout
- Proofread before submission
- Ensure all references are properly cited