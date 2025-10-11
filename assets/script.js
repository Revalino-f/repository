// repal.me URL Shortener - Main Application
class RepalShortener {
    constructor() {
        this.dbKey = 'repal_shortlinks_database';
        this.currentDomain = this.getCurrentDomain();
        this.basePath = this.getBasePath();
        this.init();
    }

    init() {
        this.handlePageLoad();
        this.bindEvents();
        this.displayRecentLinks();
        this.updateDomainDisplay();
    }

    getCurrentDomain() {
        return `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}`;
    }

    getBasePath() {
        // Extract base path from current URL
        const path = window.location.pathname;
        
        // If accessing index.html directly, get its directory
        if (path.endsWith('index.html') || path.endsWith('admin.html')) {
            return path.substring(0, path.lastIndexOf('/') + 1);
        }
        
        // If accessing root (handling redirect), use current path
        const segments = path.split('/').filter(segment => segment);
        if (segments.length > 0 && !path.endsWith('.html')) {
            // We're likely handling a shortlink, so use the path without the slug
            return path.substring(0, path.lastIndexOf('/') + 1);
        }
        
        return '/'; // Default to root
    }

    getFullBaseUrl() {
        return `${this.currentDomain}${this.basePath}`;
    }

    handlePageLoad() {
        const path = window.location.pathname;
        const currentFile = path.split('/').pop();
        
        // Skip if we're on index.html or admin.html
        if (currentFile === 'index.html' || currentFile === 'admin.html' || currentFile === '') {
            return;
        }

        // Handle shortlink redirect - get the slug from URL
        const slug = this.extractSlugFromPath(path);
        
        if (slug && !slug.includes('.') && !this.isReservedPath(slug)) {
            this.handleRedirect(slug);
        }
    }

    extractSlugFromPath(path) {
        // Remove base path from the full path to get the slug
        let slugPath = path;
        if (this.basePath !== '/' && path.startsWith(this.basePath)) {
            slugPath = path.substring(this.basePath.length);
        }
        
        // Get the last segment as slug
        const segments = slugPath.split('/').filter(segment => segment);
        return segments.length > 0 ? segments[segments.length - 1] : null;
    }

    isReservedPath(slug) {
        const reserved = ['assets', 'css', 'js', 'images', 'admin', 'api', 'login'];
        return reserved.includes(slug);
    }

    async handleRedirect(slug) {
        try {
            console.log('Handling redirect for slug:', slug);
            const db = this.getDatabase();
            const link = db.links.find(l => l.slug === slug);

            if (link) {
                // Update analytics
                link.clicks = (link.clicks || 0) + 1;
                link.lastAccessed = new Date().toISOString();
                
                // Save updated data
                const updatedLinks = db.links.map(l => l.slug === slug ? link : l);
                this.saveLinks(updatedLinks);

                // Redirect to original URL
                console.log('Redirecting to:', link.originalUrl);
                window.location.href = link.originalUrl;
            } else {
                console.log('Slug not found:', slug);
                this.showNotFound(slug);
            }
        } catch (error) {
            console.error('Redirect error:', error);
            this.showNotFound(slug);
        }
    }

    showNotFound(slug) {
        document.body.innerHTML = `
            <div class="container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <div style="text-align: center; max-width: 500px;">
                    <h1 style="font-size: 4rem; margin-bottom: 1rem;">🔗</h1>
                    <h2 style="margin-bottom: 1rem; color: var(--dark);">Shortlink Not Found</h2>
                    <p style="color: var(--gray); margin-bottom: 2rem; line-height: 1.6;">
                        The shortlink <strong>${this.getFullBaseUrl()}${slug}</strong> doesn't exist or has been deleted.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <a href="${this.getFullBaseUrl()}index.html" class="btn-primary" style="text-decoration: none;">
                            Create Short Links
                        </a>
                        <a href="${this.getFullBaseUrl()}" class="btn-outline" style="text-decoration: none;">
                            Go Home
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Shorten URL button
        const shortenBtn = document.getElementById('shorten-btn');
        if (shortenBtn) {
            shortenBtn.addEventListener('click', () => this.shortenUrl());
        }
        
        // Enter key support
        const originalUrlInput = document.getElementById('original-url');
        if (originalUrlInput) {
            originalUrlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.shortenUrl();
            });
        }
        
        const customSlugInput = document.getElementById('custom-slug');
        if (customSlugInput) {
            customSlugInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.shortenUrl();
            });
        }

        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyShortUrl());
        }
    }

    async shortenUrl() {
        const originalUrl = document.getElementById('original-url').value.trim();
        const customSlug = document.getElementById('custom-slug').value.trim();
        const button = document.getElementById('shorten-btn');

        // Validation
        if (!originalUrl) {
            this.showError('Please enter a URL');
            return;
        }

        // URL validation
        let formattedUrl = originalUrl;
        if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = 'https://' + formattedUrl;
        }

        try {
            new URL(formattedUrl);
        } catch {
            this.showError('Please enter a valid URL');
            return;
        }

        // Show loading state
        button.classList.add('loading');
        document.querySelector('.btn-text').style.display = 'none';
        document.querySelector('.btn-loading').style.display = 'inline';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const newLink = this.createShortLink(formattedUrl, customSlug);
            this.showResult(newLink);
        } catch (error) {
            this.showError(error.message);
        } finally {
            // Reset loading state
            button.classList.remove('loading');
            document.querySelector('.btn-text').style.display = 'inline';
            document.querySelector('.btn-loading').style.display = 'none';
        }
    }

    createShortLink(originalUrl, customSlug = '') {
        const links = this.getLinks();
        
        // Generate or validate slug
        let slug = customSlug || this.generateSlug();
        
        // Clean slug
        slug = slug.toLowerCase()
            .replace(/[^a-z0-9-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        if (!slug) {
            slug = this.generateSlug();
        }

        // Check if slug exists
        if (links.find(link => link.slug === slug)) {
            if (customSlug) {
                throw new Error('This custom name is already taken. Please choose another one.');
            } else {
                // Regenerate if random slug exists (very rare case)
                slug = this.generateSlug();
            }
        }

        const newLink = {
            id: this.generateId(),
            slug: slug,
            originalUrl: originalUrl,
            title: this.extractTitle(originalUrl),
            createdAt: new Date().toISOString(),
            clicks: 0,
            lastAccessed: null,
            createdBy: 'user',
            basePath: this.basePath // Store base path for reference
        };

        links.push(newLink);
        this.saveLinks(links);

        return newLink;
    }

    generateSlug() {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let slug = '';
        for (let i = 0; i < 6; i++) {
            slug += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return slug;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    extractTitle(url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch {
            return 'Unknown Site';
        }
    }

    showResult(link) {
        const resultSection = document.getElementById('result-section');
        const shortUrlInput = document.getElementById('short-url');
        const clickCount = document.getElementById('click-count');
        const createdDate = document.getElementById('created-date');

        const shortUrl = `${this.getFullBaseUrl()}${link.slug}`;
        shortUrlInput.value = shortUrl;
        clickCount.textContent = '0';
        createdDate.textContent = 'Just now';
        
        resultSection.style.display = 'block';
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto copy to clipboard
        this.copyToClipboard(shortUrl);
        
        // Update recent links
        this.displayRecentLinks();
        
        // Clear form
        document.getElementById('original-url').value = '';
        document.getElementById('custom-slug').value = '';
    }

    copyShortUrl() {
        const shortUrlInput = document.getElementById('short-url');
        this.copyToClipboard(shortUrlInput.value);
        this.showNotification('✅ Copied to clipboard!');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('✅ Copied to clipboard!');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('✅ Copied to clipboard!');
        });
    }

    displayRecentLinks() {
        const container = document.getElementById('links-container');
        if (!container) return;

        const links = this.getLinks().slice(-5).reverse(); // Show last 5 links

        if (links.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔗</div>
                    <h3>No short links yet</h3>
                    <p>Create your first short URL above!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = links.map(link => `
            <div class="link-item">
                <div class="link-info">
                    <div class="short-link">${this.getFullBaseUrl()}${link.slug}</div>
                    <div class="original-link">${link.originalUrl}</div>
                    <div class="link-stats">
                        <span>👆 ${link.clicks || 0} clicks</span>
                        <span>📅 ${new Date(link.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="link-actions">
                    <button class="btn-sm btn-outline copy-link" data-slug="${link.slug}">Copy</button>
                    <button class="btn-sm btn-danger delete-link" data-slug="${link.slug}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.copy-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.getAttribute('data-slug');
                this.copyToClipboard(`${this.getFullBaseUrl()}${slug}`);
            });
        });

        container.querySelectorAll('.delete-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slug = e.target.getAttribute('data-slug');
                this.deleteLink(slug);
            });
        });
    }

    deleteLink(slug) {
        if (confirm('Are you sure you want to delete this shortlink?')) {
            const links = this.getLinks().filter(link => link.slug !== slug);
            this.saveLinks(links);
            this.displayRecentLinks();
            this.showNotification('✅ Link deleted successfully!');
        }
    }

    updateDomainDisplay() {
        const domainPrefix = document.getElementById('domain-prefix');
        if (domainPrefix) {
            domainPrefix.textContent = `${this.getFullBaseUrl()}`;
        }
    }

    // Database methods
    getDatabase() {
        const stored = localStorage.getItem(this.dbKey);
        if (!stored) {
            return this.initializeDatabase();
        }
        return JSON.parse(stored);
    }

    initializeDatabase() {
        const initialDB = {
            version: '1.0',
            environment: this.getFullBaseUrl().includes('localhost') ? 'development' : 'production',
            createdAt: new Date().toISOString(),
            settings: {
                autoCopy: true,
                analytics: true,
                basePath: this.basePath
            },
            links: []
        };
        this.saveDatabase(initialDB);
        return initialDB;
    }

    saveDatabase(data) {
        data.updatedAt = new Date().toISOString();
        data.settings.basePath = this.basePath; // Always update base path
        localStorage.setItem(this.dbKey, JSON.stringify(data, null, 2));
    }

    getLinks() {
        const db = this.getDatabase();
        return db.links || [];
    }

    saveLinks(links) {
        const db = this.getDatabase();
        db.links = links;
        this.saveDatabase(db);
    }

    // Utility methods
    showError(message) {
        this.showNotification(`❌ ${message}`);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: var(--dark);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            border-left: 4px solid var(--success);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.repalApp = new RepalShortener();
    console.log('repal.me Shortener initialized:', {
        domain: window.repalApp.currentDomain,
        basePath: window.repalApp.basePath,
        fullBaseUrl: window.repalApp.getFullBaseUrl()
    });
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RepalShortener;
}