// ============================================
// STUDYHUB - Lecture Detail Page JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Get video URL from data attribute
    const videoContainer = document.getElementById('videoContainer');
    const videoUrl = videoContainer ? videoContainer.dataset.videoUrl : null;
    
    // Function to convert URL to embed URL
    function getEmbedUrl(url) {
        if (!url) return null;
        
        // YouTube URL conversion
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            let videoId = '';
            
            if (url.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                videoId = urlParams.get('v');
            } else if (url.includes('youtu.be')) {
                videoId = url.split('/').pop().split('?')[0];
            }
            
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&enablejsapi=1`;
            }
        }
        
        // Vimeo URL conversion
        if (url.includes('vimeo.com')) {
            const videoId = url.split('/').pop().split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        
        // Return original if already embed or not supported
        return url;
    }
    
    // Load video player
    function loadVideoPlayer() {
        if (!videoUrl || !videoContainer) return;
        
        const embedUrl = getEmbedUrl(videoUrl);
        
        if (embedUrl) {
            videoContainer.innerHTML = `
                <iframe 
                    id="videoPlayer"
                    src="${embedUrl}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
        } else {
            videoContainer.innerHTML = `
                <div class="d-flex align-items-center justify-content-center h-100 bg-dark">
                    <div class="text-center text-white">
                        <i class="fas fa-video fa-4x mb-3"></i>
                        <p>Video not available</p>
                    </div>
                </div>
            `;
        }
    }
    
    // Load video on page load
    loadVideoPlayer();
    
    // Mark complete button
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    let markedComplete = false;
    
    function markLectureComplete() {
        if (markCompleteBtn && !markCompleteBtn.disabled) {
            const lectureId = markCompleteBtn.dataset.lectureId;
            const courseSlug = markCompleteBtn.dataset.courseSlug;
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            fetch(`/courses/${courseSlug}/lecture/${lectureId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ completed: true })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // Update button
                    markCompleteBtn.disabled = true;
                    markCompleteBtn.innerHTML = '<i class="fas fa-check-circle"></i> Completed!';
                    markCompleteBtn.classList.remove('btn-success');
                    markCompleteBtn.classList.add('btn-secondary');
                    
                    // Update progress bar
                    if (progressBar) {
                        progressBar.style.width = data.progress + '%';
                        progressBar.setAttribute('aria-valuenow', data.progress);
                        if (progressText) {
                            progressText.textContent = data.progress + '%';
                        }
                    }
                    
                    // Mark lecture in sidebar as completed
                    const currentLecture = document.querySelector('.curriculum-item.active');
                    if (currentLecture) {
                        currentLecture.classList.add('completed');
                        const statusIcon = currentLecture.querySelector('.lecture-status i');
                        if (statusIcon) {
                            statusIcon.className = 'fas fa-check-circle status-completed';
                        }
                    }
                    
                    // Show success message
                    showToast('Lecture marked as completed! 🎉', 'success');
                    
                    // If course completed
                    if (data.progress === 100) {
                        showToast('Congratulations! You completed the entire course! 🏆', 'success');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showToast('Error marking lecture as complete', 'danger');
            });
        }
    }
    
    // Try to auto-mark complete when video ends
    function setupVideoAutoComplete() {
        const iframe = document.getElementById('videoPlayer');
        if (iframe && iframe.src.includes('youtube.com')) {
            // YouTube auto-complete would require YouTube API
            // For simplicity, just use manual button
            console.log('Video loaded - use manual completion');
        }
    }
    
    // Mark complete button click
    if (markCompleteBtn) {
        markCompleteBtn.addEventListener('click', markLectureComplete);
        setupVideoAutoComplete();
    }
    
    // Curriculum navigation
    const curriculumItems = document.querySelectorAll('.curriculum-item');
    curriculumItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const lectureUrl = this.dataset.url;
            if (lectureUrl && !this.classList.contains('locked')) {
                window.location.href = lectureUrl;
            } else if (this.classList.contains('locked')) {
                showToast('This lecture is locked. Please complete previous lectures first.', 'warning');
            }
        });
    });
    
    // Save notes to localStorage
    const saveNotesBtn = document.getElementById('saveNotesBtn');
    const notesTextarea = document.getElementById('lectureNotes');
    
    if (saveNotesBtn && notesTextarea) {
        const lectureId = saveNotesBtn.dataset.lectureId;
        
        // Load saved notes
        const savedNotes = localStorage.getItem(`lecture_notes_${lectureId}`);
        if (savedNotes) {
            notesTextarea.value = savedNotes;
        }
        
        // Auto-save every 30 seconds
        let autoSaveInterval;
        notesTextarea.addEventListener('input', function() {
            clearTimeout(autoSaveInterval);
            autoSaveInterval = setTimeout(() => {
                localStorage.setItem(`lecture_notes_${lectureId}`, notesTextarea.value);
                showToast('Notes auto-saved', 'info');
            }, 3000);
        });
        
        // Manual save
        saveNotesBtn.addEventListener('click', function() {
            localStorage.setItem(`lecture_notes_${lectureId}`, notesTextarea.value);
            showToast('Notes saved successfully!', 'success');
        });
    }
    
    // Ask question
    const askQuestionBtn = document.getElementById('askQuestionBtn');
    const questionInput = document.getElementById('questionInput');
    
    if (askQuestionBtn && questionInput) {
        askQuestionBtn.addEventListener('click', function() {
            const question = questionInput.value.trim();
            if (question) {
                showToast('Question posted! Instructors will respond soon.', 'info');
                questionInput.value = '';
            } else {
                showToast('Please enter a question', 'warning');
            }
        });
        
        questionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                askQuestionBtn.click();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Left arrow - previous lecture
        if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.altKey) {
            const prevLink = document.querySelector('.btn-prev:not(.disabled)');
            if (prevLink && prevLink.href) {
                window.location.href = prevLink.href;
            }
        }
        
        // Right arrow - next lecture
        if (e.key === 'ArrowRight' && !e.ctrlKey && !e.altKey) {
            const nextLink = document.querySelector('.btn-next:not(.disabled)');
            if (nextLink && nextLink.href) {
                window.location.href = nextLink.href;
            }
        }
        
        // C key - mark complete
        if (e.key === 'c' || e.key === 'C') {
            if (markCompleteBtn && !markCompleteBtn.disabled) {
                markCompleteBtn.click();
            }
        }
    });
    
    // Show keyboard shortcuts hint
    console.log('Keyboard shortcuts: ← Previous | → Next | C = Mark Complete');
    
    // Track time spent on lecture
    let lectureStartTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.floor((Date.now() - lectureStartTime) / 1000);
        if (timeSpent > 10) {
            console.log(`Time spent on lecture: ${timeSpent} seconds`);
            // Here you could send to analytics
        }
    });
});

// Toast notification helper
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
        if (toastContainer) {
            toastContainer.style.opacity = '0';
            setTimeout(() => {
                toastContainer.remove();
            }, 300);
        }
    }, 3000);
}

// Add CSS for toast animation
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
    `;
    document.head.appendChild(style);
}