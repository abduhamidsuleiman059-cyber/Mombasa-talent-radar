/**
 * TikTok-Style Video Feed Module
 * Vertical scrolling feed with likes, comments, and shares
 */

class TikTokVideoFeed {
    constructor(containerId = 'tiktokFeedContainer') {
        this.container = document.getElementById(containerId);
        this.storageKey = 'mombasaTalents';
        this.interactionsKey = 'mombasaVideoInteractions';
        this.currentIndex = 0;
        this.videos = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.loadVideos();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
    }

    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const video = entry.target.querySelector('video');
                if (!video) return;

                if (entry.isIntersecting) {
                    video.muted = true;
                    video.play().catch(() => console.log('Autoplay prevented'));
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.65 });
    }

    async loadVideos() {
        try {
            const response = await fetch('/api/videos');
            if (!response.ok) throw new Error('API error');
            this.videos = await response.json();
        } catch (error) {
            console.warn('Loading fallback videos:', error);
            this.videos = this.getFallbackVideos();
        }
        
        this.videos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        this.render();
    }

    getFallbackVideos() {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const withVideo = saved.filter(v => v.videoData);
        return withVideo.length ? withVideo : this.getDefaultSamples();
    }

    getDefaultSamples() {
        return [
            {
                name: 'Mombasa Street Dance',
                category: 'Dancer',
                description: 'Short street dance clip with energy and movement.',
                imageData: 'images/dancer.jpg',
                videoData: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                uploadedAt: '2026-03-25T14:00:00Z'
            },
            {
                name: 'Afrobeat Performance',
                category: 'Singer',
                description: 'High-energy Afrobeat sample with lively rhythm.',
                imageData: 'images/singer.jpg',
                videoData: 'https://www.w3schools.com/html/mov_bbb.mp4',
                uploadedAt: '2026-03-24T17:15:00Z'
            },
            {
                name: 'Spoken Word Snippet',
                category: 'Poet',
                description: 'Powerful spoken word example for community voices.',
                imageData: 'images/singer2.jpg',
                videoData: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                uploadedAt: '2026-03-23T09:30:00Z'
            }
        ];
    }

    getInteractions() {
        return JSON.parse(localStorage.getItem(this.interactionsKey) || '{}');
    }

    saveInteractions(data) {
        localStorage.setItem(this.interactionsKey, JSON.stringify(data));
    }

    render() {
        if (!this.videos.length) {
            this.container.innerHTML = `
                <div class="feed-empty">
                    <p>No videos yet. <a href="Upload%20Talent.html">Upload a video</a></p>
                </div>
            `;
            return;
        }

        this.container.innerHTML = '';
        const interactions = this.getInteractions();

        this.videos.forEach((video, idx) => {
            const key = video.uploadedAt || `video-${idx}`;
            const data = interactions[key] || { likes: 0, shares: 0, comments: [], liked: false };

            const card = document.createElement('div');
            card.className = 'tiktok-card';
            card.dataset.key = key;
            card.dataset.index = idx;
            card.innerHTML = `
                <div class="video-wrapper">
                    <video playsinline preload="metadata" loop poster="${video.imageData || 'https://via.placeholder.com/400x750?text=Video'}">
                        <source src="${video.videoData}" type="video/mp4">
                        Your browser does not support video.
                    </video>
                    <div class="video-overlay">
                        <div class="video-bottom">
                            <div class="video-caption">
                                <h3>${video.name}</h3>
                                <p>${video.category} • ${video.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="side-actions">
                    <button class="action-btn like-btn ${data.liked ? 'active' : ''}" data-action="like" title="Like">
                        <span class="icon">❤️</span>
                        <span class="count">${data.likes}</span>
                    </button>
                    <button class="action-btn comment-btn" data-action="comment" title="Comment">
                        <span class="icon">💬</span>
                        <span class="count">${data.comments.length}</span>
                    </button>
                    <button class="action-btn share-btn" data-action="share" title="Share">
                        <span class="icon">📤</span>
                        <span class="count">${data.shares}</span>
                    </button>
                </div>
                <div class="comment-panel" style="display: none;">
                    <div class="comment-header">
                        <h4>Comments</h4>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="comment-list">
                        ${data.comments.length ? data.comments.map((c, i) => `
                            <div class="comment-item">
                                <strong>${c.user}</strong>
                                <p>${c.text}</p>
                            </div>
                        `).join('') : '<p class="no-comments">No comments yet</p>'}
                    </div>
                    <form class="comment-input-form">
                        <input type="text" placeholder="Add a comment..." required>
                        <button type="submit">Post</button>
                    </form>
                </div>
            `;

            this.container.appendChild(card);
            this.observer.observe(card);
        });
    }

    setupEventListeners() {
        this.container.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;

            const card = btn.closest('.tiktok-card');
            const key = card.dataset.key;
            const action = btn.dataset.action;

            if (action === 'like') this.toggleLike(key);
            else if (action === 'comment') this.showCommentPanel(card);
            else if (action === 'share') this.shareVideo(key);
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                e.target.closest('.comment-panel').style.display = 'none';
            }
        });

        this.container.addEventListener('submit', (e) => {
            if (!e.target.classList.contains('comment-input-form')) return;
            e.preventDefault();

            const panel = e.target.closest('.comment-panel');
            const card = panel.closest('.tiktok-card');
            const key = card.dataset.key;
            const input = e.target.querySelector('input');
            const text = input.value.trim();

            if (text) {
                this.addComment(key, text);
                input.value = '';
                this.render();
                const newCard = this.container.querySelector(`[data-key="${key}"]`);
                if (newCard) this.showCommentPanel(newCard);
            }
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') this.scrollToNext();
            if (e.key === 'ArrowUp') this.scrollToPrev();
        });
    }

    toggleLike(key) {
        const interactions = this.getInteractions();
        const current = interactions[key] || { likes: 0, shares: 0, comments: [], liked: false };
        
        current.liked = !current.liked;
        current.likes = current.likes + (current.liked ? 1 : -1);
        interactions[key] = current;

        this.saveInteractions(interactions);
        this.render();
        this.showMessage(current.liked ? '❤️ Liked!' : 'Unliked');
    }

    addComment(key, text) {
        const interactions = this.getInteractions();
        const current = interactions[key] || { likes: 0, shares: 0, comments: [], liked: false };
        
        current.comments.push({ user: 'Guest', text });
        interactions[key] = current;
        this.saveInteractions(interactions);
    }

    shareVideo(key) {
        const interactions = this.getInteractions();
        const current = interactions[key] || { likes: 0, shares: 0, comments: [], liked: false };
        current.shares = (current.shares || 0) + 1;
        interactions[key] = current;
        this.saveInteractions(interactions);

        const url = `${window.location.href}#video=${encodeURIComponent(key)}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        
        this.render();
        this.showMessage('📤 Link copied!');
    }

    showCommentPanel(card) {
        const panel = card.querySelector('.comment-panel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            setTimeout(() => panel.querySelector('input')?.focus(), 100);
        }
    }

    showMessage(msg) {
        const toast = document.getElementById('toast') || this.createToast();
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    createToast() {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
        return toast;
    }

    scrollToNext() {
        const cards = Array.from(this.container.querySelectorAll('.tiktok-card'));
        const next = cards[this.currentIndex + 1];
        if (next) {
            next.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.currentIndex++;
        }
    }

    scrollToPrev() {
        const cards = Array.from(this.container.querySelectorAll('.tiktok-card'));
        const prev = cards[this.currentIndex - 1];
        if (prev) {
            prev.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.currentIndex--;
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tiktokFeedContainer');
    if (container) {
        window.videoFeed = new TikTokVideoFeed('tiktokFeedContainer');
    }
});
