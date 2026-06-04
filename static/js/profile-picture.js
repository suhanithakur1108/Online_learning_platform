

document.addEventListener('DOMContentLoaded', function() {
    
    // DOM Elements
    const imageInput = document.getElementById('id_profile_picture');
    const fileInputLabel = document.querySelector('.file-input-label');
    const fileNameSpan = document.getElementById('fileName');
    const previewImage = document.getElementById('previewImage');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    const removeBtn = document.getElementById('removeBtn');
    
    // File validation
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    
    // Preview selected image
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Validate file type
                if (!allowedTypes.includes(file.type)) {
                    showToast('Please select a valid image (JPEG, PNG, GIF, or WEBP)', 'danger');
                    imageInput.value = '';
                    fileNameSpan.textContent = 'No file chosen';
                    previewImage.classList.remove('show');
                    submitBtn.disabled = true;
                    return;
                }
                
                // Validate file size
                if (file.size > maxFileSize) {
                    showToast('File size should be less than 5MB', 'danger');
                    imageInput.value = '';
                    fileNameSpan.textContent = 'No file chosen';
                    previewImage.classList.remove('show');
                    submitBtn.disabled = true;
                    return;
                }
                
                // Display file name
                fileNameSpan.textContent = file.name;
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.classList.add('show');
                };
                reader.readAsDataURL(file);
                
                // Enable submit button
                submitBtn.disabled = false;
                
            } else {
                fileNameSpan.textContent = 'No file chosen';
                previewImage.classList.remove('show');
                submitBtn.disabled = true;
            }
        });
    }
    
    // Form submission with loading state
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            const file = imageInput ? imageInput.files[0] : null;
            
            if (!file) {
                e.preventDefault();
                showToast('Please select an image first', 'warning');
                return;
            }
            
            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Uploading...';
            }
        });
    }
    
    // Remove profile picture
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to remove your profile picture?')) {
                // Show loading
                removeBtn.disabled = true;
                removeBtn.innerHTML = '<span class="loading-spinner"></span> Removing...';
                
                // Send remove request
                fetch('/accounts/profile/remove-picture/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCsrfToken(),
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        showToast('Profile picture removed successfully!', 'success');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        showToast('Error removing profile picture', 'danger');
                        removeBtn.disabled = false;
                        removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Picture';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Error removing profile picture', 'danger');
                    removeBtn.disabled = false;
                    removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remove Picture';
                });
            }
        });
    }
    
    // Drag and drop functionality
    const fileInputWrapper = document.querySelector('.file-input-wrapper');
    
    if (fileInputWrapper) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileInputWrapper.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop zone
        ['dragenter', 'dragover'].forEach(eventName => {
            fileInputWrapper.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileInputWrapper.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        fileInputWrapper.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight(e) {
            fileInputWrapper.classList.add('drag-over');
        }
        
        function unhighlight(e) {
            fileInputWrapper.classList.remove('drag-over');
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0 && imageInput) {
                imageInput.files = files;
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                imageInput.dispatchEvent(event);
            }
        }
    }
    
    // Helper: Get CSRF token
    function getCsrfToken() {
        const token = document.querySelector('[name=csrfmiddlewaretoken]');
        return token ? token.value : '';
    }
    
    // Helper: Show toast notification
    function showToast(message, type = 'info') {
        const toastHTML = `
            <div class="position-fixed bottom-0 end-0 m-3" style="z-index: 9999; animation: slideInRight 0.3s ease-out;">
                <div class="alert alert-${type} alert-dismissible fade show shadow-lg" role="alert">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'danger' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            </div>
        `;
        
        const toastContainer = document.createElement('div');
        toastContainer.innerHTML = toastHTML;
        document.body.appendChild(toastContainer);
        
        setTimeout(() => {
            toastContainer.remove();
        }, 3000);
    }
    
    // Add animation style
    if (!document.querySelector('#toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .drag-over {
                background: #e3f2fd;
                border-color: #1e3c72 !important;
            }
            [data-bs-theme="dark"] .drag-over {
                background: #1a2a4a;
            }
        `;
        document.head.appendChild(style);
    }
});