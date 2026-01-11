// Main application state
let papers = [];
let filteredPapers = [];
let currentPaper = null;
let currentPage = 1;
const PAPERS_PER_PAGE = 12; // Reduced for better performance and readability
const PAPERS_DIR = 'papers/';

// DOM Elements
const paperListEl = document.getElementById('paperList');
const paperViewEl = document.getElementById('paperView');
const paperContentEl = document.getElementById('paperContent');
const paperTitleEl = document.getElementById('paperTitle');
const paperDateEl = document.getElementById('paperDate');
const paperAuthorsEl = document.getElementById('paperAuthors');
const paperTagsEl = document.getElementById('paperTags');
const searchInput = document.getElementById('searchInput');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResultsEl = document.getElementById('noResults');
const backButton = document.getElementById('backButton');

// Handle document click events
function handleDocumentClick(e) {
    // Handle pagination clicks
    const pageBtn = e.target.closest('.page-btn');
    if (pageBtn && !pageBtn.disabled) {
        e.preventDefault();
        const newPage = parseInt(pageBtn.dataset.page);
        if (!isNaN(newPage) && newPage !== currentPage) {
            currentPage = newPage;
            const query = searchInput.value.trim().toLowerCase();
            const filtered = filterPapers(query);
            renderPaperList(filtered);
            window.scrollTo(0, 0);
        }
        return;
    }
    
    // Handle paper card clicks
    const paperCard = e.target.closest('.paper-card');
    if (paperCard) {
        const paperId = paperCard.getAttribute('data-id');
        const paper = papers.find(p => p.id === paperId);
        if (paper) {
            loadPaper(paper);
        }
    }
}

// Filter papers based on search query
function filterPapers(query) {
    if (!query.trim()) return [...papers];
    
    const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    if (terms.length === 0) return [...papers];
    
    return papers.filter(paper => {
        const searchableText = [
            paper.title,
            paper.authors.join(' '),
            paper.tags.join(' '),
            paper.description || ''
        ].join(' ').toLowerCase();
        
        return terms.every(term => searchableText.includes(term));
    });
}

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Fetch and parse directory listing
async function fetchPapersList() {
    try {
        // Fetch the directory listing
        const response = await fetch(PAPERS_DIR);
        if (!response.ok) {
            throw new Error(`Failed to fetch papers directory: ${response.status} ${response.statusText}`);
        }
        
        // Parse the HTML response
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract .md files
        const links = Array.from(doc.querySelectorAll('a'));
        const mdFiles = links
            .map(link => link.getAttribute('href'))
            .filter(href => href && href.endsWith('.md') && href !== 'README.md')
            .map(filename => ({
                id: filename.replace(/\.md$/, ''),
                filename: filename,
                title: filename
                    .replace(/\.md$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase())
            }));
            
        return mdFiles;
    } catch (error) {
        console.error('Error fetching papers:', error);
        showError('Failed to load papers. Please try refreshing the page.');
        return [];
    }
}

// Initialize the application
async function init() {
    try {
        showLoading(true);
        
        // Load papers from the papers directory
        const paperFiles = await fetchPapersList();
        
        // Convert file list to paper objects with default values
        papers = await Promise.all(paperFiles.map(async (file) => {
            try {
                // Fetch paper content to extract metadata
                const response = await fetch(`${PAPERS_DIR}${file.filename}`);
                if (!response.ok) return null;
                
                const content = await response.text();
                
                // Extract title from first heading or use filename
                const titleMatch = content.match(/^#\s+(.+)$/m);
                const title = titleMatch 
                    ? titleMatch[1].trim() 
                    : file.filename.replace(/\.md$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                
                // Extract first paragraph as description
                const abstractMatch = content.match(/##?\s*Abstract[\s\n]+(.+?)(?=##|$)/is);
                const description = abstractMatch 
                    ? abstractMatch[1].trim().replace(/\s+/g, ' ').substring(0, 200) + '...' 
                    : 'No abstract available.';
                
                // Extract year from filename or content if available
                const yearMatch = file.filename.match(/\b(20\d{2})\b/) || content.match(/\b(20\d{2})\b/);
                const year = yearMatch ? yearMatch[1] : new Date().getFullYear();
                
                return {
                    id: file.id,
                    title: title,
                    date: year,
                    authors: ['Unknown Author'],
                    tags: [],
                    description: description,
                    content: content,
                    filename: file.filename
                };
            } catch (error) {
                console.error(`Error processing ${file.filename}:`, error);
                return null;
            }
        }));
        
        // Filter out any failed paper loads
        papers = papers.filter(paper => paper !== null);
        
        if (papers.length === 0) {
            showError('No research papers found in the papers directory.');
            return;
        }
        
        filteredPapers = [...papers];
        
        // Set up event listeners
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        document.addEventListener('click', handleDocumentClick);
        backButton.addEventListener('click', showPaperList);
        
        // Handle back/forward browser navigation
        window.addEventListener('popstate', handlePopState);
        
        // Handle initial URL state
        handleInitialState();
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to load research papers. Please try again later.');
    } finally {
        showLoading(false);
    }
}

// Handle browser back/forward navigation
function handlePopState(event) {
    if (window.location.hash) {
        const paperId = window.location.hash.substring(1);
        const paper = papers.find(p => p.id === paperId);
        if (paper) {
            loadPaper(paper, false);
            return;
        }
    }
    showPaperList(false);
}

// Handle initial application state based on URL
function handleInitialState() {
    if (window.location.hash) {
        const paperId = window.location.hash.substring(1);
        const paper = papers.find(p => p.id === paperId);
        if (paper) {
            loadPaper(paper, false);
            return;
        }
    }
    renderPaperList(filteredPapers);
}

// Show/hide loading indicator
function showLoading(show) {
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
    }
}

// Show error message
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    
    // Clear and show error in the appropriate container
    if (paperViewEl.classList.contains('hidden')) {
        paperListEl.innerHTML = '';
        paperListEl.appendChild(errorEl);
    } else {
        paperContentEl.innerHTML = '';
        paperContentEl.appendChild(errorEl);
    }
    
    // Make sure the error is visible
    paperListEl.style.display = 'block';
    paperViewEl.classList.remove('hidden');
}

// Render pagination controls
function renderPagination(totalPages) {
    if (totalPages <= 1) return '';
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    paginationHTML += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;
    
    // Always show first page if not already shown
    if (currentPage > 3) {
        paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
        if (currentPage > 4) {
            paginationHTML += '<span class="ellipsis">…</span>';
        }
    }
    
    // Calculate page range to show around current page
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    
    // Adjust if we're near the start or end
    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // Right ellipsis if needed
    if (currentPage < totalPages - 2) {
        if (currentPage < totalPages - 3) {
            paginationHTML += '<span class="ellipsis">…</span>';
        }
        paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    } else if (currentPage === totalPages - 2) {
        paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;
    
    paginationHTML += '</div>';
    return paginationHTML;
}

// Get papers for current page
function getPapersForCurrentPage(papersToPaginate) {
    const startIndex = (currentPage - 1) * PAPERS_PER_PAGE;
    return papersToPaginate.slice(startIndex, startIndex + PAPERS_PER_PAGE);
}

// Render the list of papers
function renderPaperList(papersToRender, updateURL = true) {
    if (!papersToRender || papersToRender.length === 0) {
        paperListEl.innerHTML = '<div class="no-papers">No research papers found.</div>';
        noResultsEl.classList.remove('hidden');
        paperListEl.classList.add('hidden');
        return;
    }
    
    const startIndex = (currentPage - 1) * PAPERS_PER_PAGE;
    const endIndex = Math.min(startIndex + PAPERS_PER_PAGE, papersToRender.length);
    const papersToShow = papersToRender.slice(startIndex, endIndex);
    
    // Sort papers by year (newest first)
    const sortedPapers = [...papersToShow].sort((a, b) => b.year - a.year);
    
    const papersHTML = sortedPapers.map(paper => `
        <div class="paper-card" data-id="${paper.id}" tabindex="0" role="button" aria-label="View ${escapeHTML(paper.title)}">
            <h2>${escapeHTML(paper.title)}</h2>
            ${paper.date ? `<div class="paper-meta">
                <span class="paper-year">${paper.date}</span>
            </div>` : ''}
            ${paper.authors && paper.authors.length > 0 ? `
                <div class="paper-authors">${paper.authors.join(', ')}</div>
            ` : ''}
            <p class="paper-description">${paper.description || 'No abstract available.'}</p>
            ${paper.tags && paper.tags.length > 0 ? `
                <div class="paper-tags">
                    ${paper.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    paperListEl.innerHTML = papersHTML;
    
    // Render pagination
    const totalPages = Math.ceil(papersToRender.length / PAPERS_PER_PAGE);
    renderPagination(totalPages);
    
    // Show/hide no results message
    if (papersToRender.length === 0) {
        noResultsEl.classList.remove('hidden');
        paperListEl.classList.add('hidden');
    } else {
        noResultsEl.classList.add('hidden');
        paperListEl.classList.remove('hidden');
    }
    
    // Update URL without page reload
    if (updateURL) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('q', searchInput.value);
        searchParams.set('page', currentPage);
        
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.pushState({ search: searchInput.value, page: currentPage }, '', newUrl);
    }
    
    // Show paper list and hide paper view
    paperListEl.style.display = 'grid';
    paperViewEl.classList.add('hidden');
    document.body.classList.remove('viewing-paper');
}

// Load and display a single paper
async function loadPaper(paper, updateURL = true) {
    try {
        showLoading(true);
        
        // Always fetch the latest content to ensure it exists
        const response = await fetch(`${PAPERS_DIR}${paper.filename}`);
        if (!response.ok) throw new Error('Failed to load paper content');
        
        const content = await response.text();
        paper.content = content; // Update cached content
        
        // Update URL if needed
        if (updateURL) {
            const url = new URL(window.location);
            url.hash = `#${paper.id}`;  // Use hash-based navigation
            window.history.pushState({ paperId: paper.id }, '', url);
        }
        
        // Set current paper
        currentPaper = paper;
        
        // Update UI with paper details
        paperTitleEl.textContent = paper.title;
        paperDateEl.textContent = paper.date || 'No date';
        paperAuthorsEl.textContent = Array.isArray(paper.authors) ? 
            paper.authors.join(', ') : 
            (paper.authors || 'Unknown Author');
            
        // Render tags if they exist
        if (paper.tags && paper.tags.length > 0) {
            paperTagsEl.innerHTML = paper.tags
                .map(tag => `<span class="tag">${tag}</span>`)
                .join('');
        } else {
            paperTagsEl.innerHTML = '';
        }
        
        // Render the content
        paperContentEl.innerHTML = markdownToHtml(content);
        showPaperView();
        
        // Process math blocks if any
        document.querySelectorAll('.math-block').forEach(mathBlock => {
            mathBlock.classList.add('math-block');
            mathBlock.textContent = mathBlock.textContent.trim();
        });
        
        // Fade in content
        setTimeout(() => {
            paperContentEl.style.transition = 'opacity 0.3s ease';
            paperContentEl.style.opacity = '1';
        }, 50);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading paper:', error);
        showError('Failed to load the research paper. It may have been moved or deleted.');
        showPaperList();
    } finally {
        showLoading(false);
    }
}

// Show the paper view
function showPaperView() {
    paperListEl.style.display = 'none';
    paperViewEl.classList.remove('hidden');
    document.title = `${paperTitleEl.textContent} - Academic Research Papers`;
    document.body.classList.add('viewing-paper');
    
    // Ensure content is visible
    paperContentEl.style.opacity = '1';
}

// Show the paper list view
function showPaperList(updateURL = true) {
    if (updateURL) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('paper');
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.pushState({ view: 'list' }, '', newUrl);
    }
    
    paperListEl.style.display = 'grid';
    paperViewEl.classList.add('hidden');
    document.title = 'Academic Research Papers';
    document.body.classList.remove('viewing-paper');
    
    // Focus on search input for better keyboard navigation
    searchInput.focus();
    
    // Re-render the paper list to ensure it's up to date
    renderPaperList(filteredPapers);
}

// Handle search
function handleSearch() {
    const query = searchInput.value.trim();
    filteredPapers = filterPapers(query);
    currentPage = 1; // Reset to first page on new search
    renderPaperList(filteredPapers);
}

// Simple Markdown to HTML converter that preserves LaTeX math blocks
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    // First, handle code blocks to prevent processing markdown inside them
    const codeBlocks = [];
    markdown = markdown.replace(/```([\s\S]*?)```/g, (match, code) => {
        const id = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code class="language-${(code.match(/^[\w-]+\n/) || [''])[0].trim() || 'text'}">${escapeHTML(code.replace(/^[\w-]+\n/, ''))}</code></pre>`);
        return id;
    });
    
    // Handle inline code
    markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Preserve LaTeX math blocks (both $$...$$ and $...$)
    const mathBlocks = [];
    markdown = markdown.replace(/\$\$[^$]+\$\$|\$[^$\n]+\$/g, match => {
        const isBlock = match.startsWith('$$');
        const className = isBlock ? 'math-block' : 'math-inline';
        const content = match.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');
        mathBlocks.push(`<code class="${className} language-math">${escapeHTML(content)}</code>`);
        return `__MATH_${mathBlocks.length - 1}__`;
    });
    
    // Convert markdown to HTML
    let html = markdown
        // Headers
        .replace(/^#\s+(.*?)(?:\s+#+)?\s*$/gm, '<h1>$1</h1>')
        .replace(/^##\s+(.*?)(?:\s+#+)?\s*$/gm, '<h2>$1</h2>')
        .replace(/^###\s+(.*?)(?:\s+#+)?\s*$/gm, '<h3>$1</h3>')
        .replace(/^####\s+(.*?)(?:\s+#+)?\s*$/gm, '<h4>$1</h4>')
        .replace(/^#####\s+(.*?)(?:\s+#+)?\s*$/gm, '<h5>$1</h5>')
        .replace(/^######\s+(.*?)(?:\s+#+)?\s*$/gm, '<h6>$1</h6>')
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
        .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
        .replace(/_([^_\n]+)_/g, '<em>$1</em>')
        // Images and links
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => 
            `<img src="${escapeHTML(src.trim())}" alt="${escapeHTML(alt || '')}">`)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => 
            `<a href="${escapeHTML(url.trim())}">${text}</a>`)
        // Horizontal rule
        .replace(/^[-*_]{3,}\s*$/gm, '<hr>')
        // Blockquotes
        .replace(/^>\s+(.*$)/gm, '<blockquote><p>$1</p></blockquote>')
        // Lists (unordered and ordered)
        .replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>')
        .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
        // Wrap list items in ul/ol
        .replace(/(<li>.*<\/li>\n?)+/g, 
            match => `<ul>${match.replace(/<\/li>\s*<li>/g, '</li>\n<li>')}</ul>`);
    
    // Handle paragraphs (text not wrapped in other blocks)
    html = html.split('\n\n').map(block => {
        if (!block.trim().match(/^<(h\d|p|ul|ol|li|blockquote|pre|code|img|hr)/)) {
            return `<p>${block.trim()}</p>`;
        }
        return block;
    }).join('\n\n');
    
    // Restore code blocks
    codeBlocks.forEach((codeBlock, index) => {
        html = html.replace(`__CODE_BLOCK_${index}__`, codeBlock);
    });
    
    // Restore math blocks
    mathBlocks.forEach((math, index) => {
        html = html.replace(`__MATH_${index}__`, math);
    });
    
    return html;
}

function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function truncate(str, length) {
    if (!str) return '';
    if (str.length <= length) return str;
    
    // Try to truncate at sentence or word boundary
    const truncated = str.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPeriod = truncated.lastIndexOf('.');
    const lastBoundary = Math.max(lastSpace, lastPeriod);
    
    if (lastBoundary > length * 0.7) { // Only truncate at boundary if it's not too far back
        return truncated.substring(0, lastBoundary) + '...';
    }
    
    return truncated + '...';
}

// Initialize the app when the DOM is loaded
// Handle clicks on paper cards
document.addEventListener('click', (e) => {
    const paperCard = e.target.closest('.paper-card');
    if (paperCard) {
        const paperId = paperCard.dataset.id;
        const paper = papers.find(p => p.id === paperId);
        if (paper) {
            loadPaper(paper);
        }
    }
});

document.addEventListener('DOMContentLoaded', init);
