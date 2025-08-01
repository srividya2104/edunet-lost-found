// Global utility functions and shared functionality

// Format date to readable string
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '1 day ago';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Create item card HTML
function createItemCard(item) {
    const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
    const statusText = item.status === 'lost' ? 'Lost' : 'Found';
    const imageHtml = item.imageUrl 
        ? `<img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
        : '';
    
    return `
        <div class="item-card fade-in" onclick="showItemDetails('${item._id}')">
            <div class="item-image">
                ${imageHtml}
                <i class="fas fa-image" style="${item.imageUrl ? 'display: none;' : ''}"></i>
                <span class="item-status ${statusClass}">${statusText}</span>
            </div>
            <div class="item-content">
                <h3 class="item-title">${item.title}</h3>
                <span class="item-category">${item.category}</span>
                <p class="item-description">${item.description}</p>
                <div class="item-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${item.location}</span>
                </div>
                <div class="item-date">${formatDate(item.dateReported)}</div>
            </div>
        </div>
    `;
}

// Show item details in modal
async function showItemDetails(itemId) {
    try {
        const response = await fetch(`/api/items/${itemId}`);
        const item = await response.json();
        
        if (response.ok) {
            const modal = document.getElementById('itemModal');
            const modalTitle = document.getElementById('modalTitle');
            const modalBody = document.getElementById('modalBody');
            
            modalTitle.textContent = item.title;
            
            const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
            const statusText = item.status === 'lost' ? 'Lost' : 'Found';
            const imageHtml = item.imageUrl 
                ? `<img src="${item.imageUrl}" alt="${item.title}" style="max-width: 100%; height: 300px; object-fit: cover; border-radius: 0.5rem; margin-bottom: 1.5rem;">`
                : '<div style="height: 200px; background: #f3f4f6; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;"><i class="fas fa-image" style="font-size: 3rem; color: #6b7280;"></i></div>';
            
            modalBody.innerHTML = `
                <div class="item-details">
                    ${imageHtml}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <span class="item-status ${statusClass}" style="position: static;">${statusText}</span>
                        <span class="item-category">${item.category}</span>
                    </div>
                    
                    <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Description</h4>
                    <p style="margin-bottom: 1.5rem; line-height: 1.6; color: #6b7280;">${item.description}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Location</h4>
                            <p style="color: #6b7280; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-map-marker-alt"></i>
                                ${item.location}
                            </p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 0.5rem; font-weight: 600;">Date</h4>
                            <p style="color: #6b7280; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-calendar"></i>
                                ${new Date(item.dateOccurred).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 1.5rem; border-radius: 0.5rem;">
                        <h4 style="margin-bottom: 1rem; font-weight: 600;">Contact Information</h4>
                        <div style="display: grid; gap: 0.75rem;">
                            <p><strong>Name:</strong> ${item.contactName}</p>
                            <p><strong>Email:</strong> <a href="mailto:${item.contactEmail}" style="color: #667eea;">${item.contactEmail}</a></p>
                            ${item.contactPhone ? `<p><strong>Phone:</strong> <a href="tel:${item.contactPhone}" style="color: #667eea;">${item.contactPhone}</a></p>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            showModal('itemModal');
        }
    } catch (error) {
        console.error('Error fetching item details:', error);
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Loading recent items for home page
async function loadRecentItems() {
    const grid = document.getElementById('recentItemsGrid');
    if (!grid) return;
    
    try {
        const response = await fetch('/api/items?limit=6');
        const items = await response.json();
        
        if (items.length > 0) {
            grid.innerHTML = items.map(createItemCard).join('');
        } else {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                    <i class="fas fa-box-open" style="font-size: 3rem; color: #6b7280; margin-bottom: 1rem; display: block;"></i>
                    <h3 style="margin-bottom: 1rem;">No items reported yet</h3>
                    <p style="color: #6b7280; margin-bottom: 2rem;">Be the first to report a lost or found item!</p>
                    <a href="/report" class="btn btn-primary">Report an Item</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading recent items:', error);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem; display: block;"></i>
                <h3>Error loading items</h3>
                <p style="color: #6b7280;">Please try again later.</p>
            </div>
        `;
    }
}

// Animate stats counter
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalNumber = parseInt(target.dataset.count);
                animateCounter(target, finalNumber);
                observer.unobserve(target);
            }
        });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 50);
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileToggle = document.querySelector('.nav-mobile');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Footer link handlers
function showContact() {
    alert('Contact us at: support@lostfound.com\nPhone: (555) 123-4567');
}

function showHelp() {
    alert('Help Center:\n\n1. Report lost or found items with photos\n2. Search using keywords or filters\n3. Contact item owners directly\n4. Update item status when recovered');
}

function showPrivacy() {
    alert('Privacy Policy:\n\nWe protect your personal information and only share contact details with potential item matches. Your data is never sold to third parties.');
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initMobileMenu();
    
    // Load recent items on home page
    loadRecentItems();
    
    // Animate stats when they come into view
    animateStats();
    
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});