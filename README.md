# Research Paper Viewer

A lightweight, framework-free web application for viewing and searching research papers locally. Built with vanilla HTML, CSS, and JavaScript, this tool provides a clean, academic interface for reading and discovering research papers stored in Markdown format.

## Features

- View research papers in a clean, academic layout
- Full-text search across paper titles and content
- Filter papers by tags and categories
- Responsive design that works on all devices
- Light/dark mode support
- Fast and lightweight - no external dependencies
- Live preview of Markdown content

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Python 3.x (for the local server)

### Installation

1. Clone or download this repository
2. Place your research papers in the `papers` directory as Markdown (`.md`) files
3. Update the `papers.json` file with your paper metadata

### Running the Application

1. Start the local development server:
   ```bash
   python serve.py
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Project Structure

```
.
├── index.html        # Main HTML file
├── app.js           # Application logic
├── styles.css       # Styling
├── papers/          # Directory for Markdown papers
├── papers.json      # Paper metadata and configuration
└── serve.py         # Simple Python HTTP server
```

## Adding Papers

1. Add your Markdown files to the `papers` directory
2. Update `papers.json` with the following structure for each paper:
   ```json
   {
     "title": "Paper Title",
     "filename": "paper.md",
     "description": "Brief description of the paper",
     "tags": ["tag1", "tag2"],
     "year": 2023
   }
   ```

## Customization

### Styling
Edit `styles.css` to customize the appearance. The application uses CSS variables for easy theming.

### Configuration
Modify `app.js` to adjust:
- Search behavior
- Layout preferences
- Default theme (light/dark)

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for researchers and academics.
