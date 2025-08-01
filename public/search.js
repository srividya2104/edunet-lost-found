// Search functionality

let currentFilters = {
    status: '',
    category: '',
    search: '',
    sort: 'dateReported'
};

let currentView = 'grid';
let allItems = [];

// Initialize search page
document.addEventListener('DOMContentLoaded', () => {
    initFilters();
    initSearch();
    initViewToggle();
    loadItems();
});

// Initialize filter functionality
function initFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const advancedFilters = document.getElementById('advancedFilters');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    // Toggle advanced filters
    filterToggle.addEventListener('click', () => {
        advancedFilters.classList.toggle('active');
        const icon = filterToggle.querySelector('i');
        
        if (advancedFilters.classList.contains('active')) {
            icon.className = 'fas fa-filter-circle-xmark';
        } else {
            icon.className = 'fas fa-filter';
        }
    });
    
    // Status filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.dataset.filter;
            const filterValue = button.dataset.value;
            
            // Remove active class from siblings
            const siblings = document.querySelectorAll(`[data-filter="${filterType}"]`);
            siblings.forEach(sibling => sibling.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current filters
            currentFilters[filterType] = filterValue;
            
            // Apply filters
            applyFilters();
        });
    });
    
    // Category filter
    categoryFilter.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        applyFilters();
    });
    
    // Sort filter
    sortFilter.addEventListener('change', (e) => {
        currentFilters.sort = e.target.value;
        applyFilters();
    });
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(() => {
            currentFilters.search = e.target.value.toLowerCase();
            applyFilters();
        }, 300); // Debounce search
    });
}

// Initialize view toggle
function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const itemsGrid = document.getElementById('itemsGrid');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            // Update active button
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update current view
            currentView = view;
            
            // Update grid class
            if (view === 'list') {
                itemsGrid.style.gridTemplateColumns = '1fr';
            } else {
                itemsGrid.style.gridTemplateColumns = '';
            }
            
            // Re-render items
            renderItems(allItems);
        });
    });
}

// Load items from API
async function loadItems() {
    const loading = document.getElementById('loading');
    const itemsGrid = document.getElementById('itemsGrid');
    const noResults = document.getElementById('noResults');
    
    loading.style.display = 'block';
    itemsGrid.innerHTML = '';
    noResults.style.display = 'none';
    
    try {
        const response = await fetch('/api/items');
        const items = await response.json();
        
        allItems = items;
        applyFilters();
        
    } catch (error) {
        console.error('Error loading items:', error);
        loading.style.display = 'none';
        itemsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem; display: block;"></i>
                <h3>Error loading items</h3>
                <p style="color: #6b7280;">Please check your connection and try again.</p>
                <button onclick="loadItems()" class="btn btn-primary" style="margin-top: 1rem;">Retry</button>
            </div>
        `;
    } finally {
        loading.style.display = 'none';
    }
}

// Apply current filters to items
function applyFilters() {
    let filteredItems = [...allItems];
    
    // Apply status filter
    if (currentFilters.status) {
        filteredItems = filteredItems.filter(item => item.status === currentFilters.status);
    }
    
    // Apply category filter
    if (currentFilters.category) {
        filteredItems = filteredItems.filter(item => item.category === currentFilters.category);
    }
    
    // Apply search filter
    if (currentFilters.search) {
        filteredItems = filteredItems.filter(item => {
            const searchTerm = currentFilters.search.toLowerCase();
            return (
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    // Apply sorting
    filteredItems.sort((a, b) => {
        switch (currentFilters.sort) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'category':
                return a.category.localeCompare(b.category);
            case 'location':
                return a.location.localeCompare(b.location);
            case 'dateReported':
            default:
                return new Date(b.dateReported) - new Date(a.dateReported);
        }
    });
    
    renderItems(filteredItems);
}

// Render filtered items
function renderItems(items) {
    const itemsGrid = document.getElementById('itemsGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    // Update results count
    resultsCount.textContent = items.length;
    
    if (items.length === 0) {
        itemsGrid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    if (currentView === 'list') {
        itemsGrid.innerHTML = items.map(createListItem).join('');
    } else {
        itemsGrid.innerHTML = items.map(createItemCard).join('');
    }
}

// Create list view item
function createListItem(item) {
    const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
    const statusText = item.status === 'lost' ? 'Lost' : 'Found';
    const imageHtml = item.imageUrl 
        ? `<img src="${item.imageUrl}" alt="${item.title}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 0.5rem;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`
        : '';
    
    return `
        <div class="item-card fade-in" onclick="showItemDetails('${item._id}')" style="display: flex; gap: 1.5rem; padding: 1.5rem;">
            <div style="flex-shrink: 0;">
                ${imageHtml}
                <div style="width: 100px; height: 100px; background: #f3f4f6; border-radius: 0.5rem; display: ${item.imageUrl ? 'none' : 'flex'}; align-items: center; justify-content: center;">
                    <i class="fas fa-image" style="font-size: 2rem; color: #6b7280;"></i>
                </div>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h3 class="item-title" style="margin: 0; margin-right: 1rem;">${item.title}</h3>
                    <span class="item-status ${statusClass}" style="position: static; flex-shrink: 0;">${statusText}</span>
                </div>
                <span class="item-category">${item.category}</span>
                <p class="item-description" style="margin: 0.75rem 0; -webkit-line-clamp: 2;">${item.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <div class="item-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${item.location}</span>
                    </div>
                    <div class="item-date">${formatDate(item.dateReported)}</div>
                </div>
            </div>
        </div>
    `;
}

// Reset all filters
function resetFilters() {
    currentFilters = {
        status: '',
        category: '',
        search: '',
        sort: 'dateReported'
    };
    
    // Reset UI elements
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('sortFilter').value = 'dateReported';
    
    // Reset status filter buttons
    const statusButtons = document.querySelectorAll('[data-filter="status"]');
    statusButtons.forEach(btn => btn.classList.remove('active'));
    statusButtons[0].classList.add('active'); // First button (All)
    
    applyFilters();
}

// Export functions for global access
window.resetFilters = resetFilters;