// ============================================
// STUDYHUB - Main JavaScript
// Like Apna College Interactive Features
// ============================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    
    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
    
    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        let alerts = document.querySelectorAll('.alert:not(.alert-permanent)')
        alerts.forEach(function(alert) {
            let bsAlert = new bootstrap.Alert(alert)
            bsAlert.close()
        })
    }, 5000)
    
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault()
            const target = document.querySelector(this.getAttribute('href'))
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        })
    })
    
    // Course progress update
    const markCompleteBtns = document.querySelectorAll('.mark-complete-btn')
    markCompleteBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault()
            const lectureId = this.dataset.lectureId
            const courseSlug = this.dataset.courseSlug
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value
            
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
                    // Update progress bar
                    const progressBar = document.querySelector('.progress-bar')
                    if (progressBar) {
                        progressBar.style.width = data.progress + '%'
                        progressBar.setAttribute('aria-valuenow', data.progress)
                        progressBar.textContent = data.progress + '%'
                    }
                    
                    // Disable button
                    btn.disabled = true
                    btn.innerHTML = '<i class="fas fa-check"></i> Completed'
                    btn.classList.remove('btn-primary')
                    btn.classList.add('btn-success')
                    
                    // Show success message
                    showToast('Lecture marked as completed!', 'success')
                }
            })
            .catch(error => console.error('Error:', error))
        })
    })
    
    // Search functionality with debounce
    let searchTimeout
    const searchInput = document.querySelector('#searchInput')
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(() => {
                const searchTerm = this.value
                if (searchTerm.length > 2) {
                    performSearch(searchTerm)
                } else if (searchTerm.length === 0) {
                    resetSearch()
                }
            }, 500)
        })
    }
    
    // Course filter
    const filterButtons = document.querySelectorAll('.filter-btn')
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category
            filterCourses(category)
            
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'))
            this.classList.add('active')
        })
    })
    
    // Payment form validation
    const paymentForm = document.querySelector('#paymentForm')
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            const cardNumber = document.querySelector('#cardNumber')
            const expiry = document.querySelector('#expiry')
            const cvv = document.querySelector('#cvv')
            
            let isValid = true
            
            // Validate card number (16 digits)
            if (cardNumber && !/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
                showError(cardNumber, 'Please enter a valid 16-digit card number')
                isValid = false
            }
            
            // Validate expiry date
            if (expiry && !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry.value)) {
                showError(expiry, 'Please enter a valid expiry date (MM/YY)')
                isValid = false
            }
            
            // Validate CVV
            if (cvv && !/^\d{3,4}$/.test(cvv.value)) {
                showError(cvv, 'Please enter a valid CVV')
                isValid = false
            }
            
            if (!isValid) {
                e.preventDefault()
            }
        })
    }
    
    // Add to cart animation
    const addToCartBtns = document.querySelectorAll('.add-to-cart')
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.add('pulse')
            setTimeout(() => {
                this.classList.remove('pulse')
            }, 1000)
        })
    })
    
    // Video player progress tracking
    const videoPlayer = document.querySelector('#videoPlayer')
    if (videoPlayer) {
        let watchTime = 0
        videoPlayer.addEventListener('timeupdate', function() {
            const percentage = (this.currentTime / this.duration) * 100
            if (percentage > 80 && !this.dataset.completed) {
                // Auto-mark as completed when 80% watched
                const completeBtn = document.querySelector('.mark-complete-btn')
                if (completeBtn && !completeBtn.disabled) {
                    completeBtn.click()
                    this.dataset.completed = 'true'
                }
            }
        })
    }
})

// Helper Functions
function showToast(message, type = 'info') {
    const toastHTML = `
        <div class="toast-custom animate__animated animate__fadeInRight">
            <div class="alert alert-${type} alert-dismissible fade show mb-0" role="alert">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        </div>
    `
    
    const toastContainer = document.createElement('div')
    toastContainer.innerHTML = toastHTML
    document.body.appendChild(toastContainer)
    
    setTimeout(() => {
        toastContainer.remove()
    }, 3000)
}

function showError(input, message) {
    input.classList.add('is-invalid')
    const feedback = document.createElement('div')
    feedback.className = 'invalid-feedback'
    feedback.textContent = message
    input.parentNode.appendChild(feedback)
    
    input.addEventListener('input', function() {
        this.classList.remove('is-invalid')
        const feedback = this.parentNode.querySelector('.invalid-feedback')
        if (feedback) feedback.remove()
    })
}

function performSearch(term) {
    fetch(`/courses/search/?q=${encodeURIComponent(term)}`)
        .then(response => response.json())
        .then(data => {
            updateCourseList(data.courses)
        })
        .catch(error => console.error('Error:', error))
}

function resetSearch() {
    location.reload()
}

function filterCourses(category) {
    if (category === 'all') {
        document.querySelectorAll('.course-card').forEach(card => {
            card.style.display = 'block'
        })
    } else {
        document.querySelectorAll('.course-card').forEach(card => {
            if (card.dataset.category === category) {
                card.style.display = 'block'
            } else {
                card.style.display = 'none'
            }
        })
    }
}

function updateCourseList(courses) {
    const courseContainer = document.querySelector('#courseContainer')
    if (courseContainer) {
        courseContainer.innerHTML = ''
        courses.forEach(course => {
            courseContainer.innerHTML += `
                <div class="col-md-4">
                    <div class="card course-card">
                        <img src="${course.thumbnail}" class="card-img-top" alt="${course.title}">
                        <div class="card-body">
                            <h5 class="card-title">${course.title}</h5>
                            <p class="card-text">${course.description.substring(0, 100)}...</p>
                            <a href="/courses/${course.slug}/" class="btn btn-primary">View Course</a>
                        </div>
                    </div>
                </div>
            `
        })
    }
}

// Lazy loading images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src
            img.classList.add('loaded')
            observer.unobserve(img)
        }
    })
})

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img)
})

// Page loading animation
window.addEventListener('load', function() {
    const spinner = document.querySelector('.spinner-wrapper')
    if (spinner) {
        setTimeout(() => {
            spinner.style.opacity = '0'
            setTimeout(() => {
                spinner.style.display = 'none'
            }, 300)
        }, 500)
    }
    
    // Add fade-in animation to elements
    document.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.opacity = '0'
        setTimeout(() => {
            el.style.opacity = '1'
        }, 100)
    })
})