// Report form functionality

let currentStatus = 'lost';

// Initialize report page
document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const dateInput = document.getElementById('dateOccurred');
    if (dateInput) {
        dateInput.max = new Date().toISOString().split('T')[0];
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Initialize status tabs
    initStatusTabs();
    
    // Initialize file upload
    initFileUpload();
    
    // Initialize form submission
    initFormSubmission();
});

// Status tab functionality
function initStatusTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const statusInput = document.getElementById('status');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update current status
            currentStatus = button.dataset.status;
            statusInput.value = currentStatus;
            
            // Update form text based on status
            updateFormText(currentStatus);
        });
    });
}

// Update form text based on selected status
function updateFormText(status) {
    const titlePlaceholder = document.getElementById('title');
    const locationLabel = document.querySelector('label[for="location"]');
    const dateLabel = document.querySelector('label[for="dateOccurred"]');
    
    if (status === 'lost') {
        titlePlaceholder.placeholder = 'e.g., Black iPhone 13, Red Leather Wallet';
        locationLabel.textContent = 'Where did you lose it? *';
        dateLabel.textContent = 'When did you lose it? *';
    } else {
        titlePlaceholder.placeholder = 'e.g., Found Black iPhone, Red Wallet';
        locationLabel.textContent = 'Where did you find it? *';
        dateLabel.textContent = 'When did you find it? *';
    }
}

// File upload functionality
function initFileUpload() {
    const fileInput = document.getElementById('image');
    const fileUpload = document.querySelector('.file-upload');
    const previewContainer = document.getElementById('previewContainer');
    
    // Click to upload
    fileUpload.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // Drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.style.background = '#f3f4f6';
        fileUpload.style.borderColor = '#667eea';
    });
    
    fileUpload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileUpload.style.background = '';
        fileUpload.style.borderColor = '';
    });
    
    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.style.background = '';
        fileUpload.style.borderColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

// Handle file selection and preview
function handleFileSelect(file) {
    const previewContainer = document.getElementById('previewContainer');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewContainer.innerHTML = `
            <div style="position: relative; display: inline-block;">
                <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 0.5rem; object-fit: cover;">
                <button type="button" onclick="removePreview()" style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times" style="font-size: 12px;"></i>
                </button>
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

// Remove image preview
function removePreview() {
    const fileInput = document.getElementById('image');
    const previewContainer = document.getElementById('previewContainer');
    
    fileInput.value = '';
    previewContainer.innerHTML = '';
}

// Form submission
function initFormSubmission() {
    const form = document.getElementById('reportForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(form);
            
            const response = await fetch('/api/items', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Show success modal
                showModal('successModal');
                
                // Reset form
                form.reset();
                removePreview();
                
                // Reset date to today
                const dateInput = document.getElementById('dateOccurred');
                dateInput.value = new Date().toISOString().split('T')[0];
            } else {
                const error = await response.json();
                alert('Error: ' + (error.error || 'Failed to submit report'));
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
}

// Reset form
function resetForm() {
    const form = document.getElementById('reportForm');
    const dateInput = document.getElementById('dateOccurred');
    
    form.reset();
    removePreview();
    
    // Reset to today's date
    dateInput.value = new Date().toISOString().split('T')[0];
    
    // Reset to lost status
    const lostTab = document.querySelector('.tab-btn[data-status="lost"]');
    const foundTab = document.querySelector('.tab-btn[data-status="found"]');
    const statusInput = document.getElementById('status');
    
    lostTab.classList.add('active');
    foundTab.classList.remove('active');
    currentStatus = 'lost';
    statusInput.value = 'lost';
    updateFormText('lost');
}

// Phone number formatting
document.getElementById('contactPhone')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            value = `(${value}`;
        } else if (value.length <= 6) {
            value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
        } else {
            value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
        }
    }
    e.target.value = value;
});