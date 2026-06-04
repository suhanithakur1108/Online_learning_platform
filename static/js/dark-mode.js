// ============================================
// STUDYHUB - Dark Mode Manager
// Like Apna College Dark Mode Feature
// ============================================

class DarkModeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light'
        this.init()
    }
    
    init() {
        this.applyTheme(this.theme)
        this.setupToggleButton()
        this.setupSystemThemeListener()
    }
    
    applyTheme(theme) {
        const html = document.documentElement
        html.setAttribute('data-bs-theme', theme)
        
        // Update icon
        const toggleIcon = document.querySelector('#darkModeToggle i')
        if (toggleIcon) {
            if (theme === 'dark') {
                toggleIcon.classList.remove('fa-moon')
                toggleIcon.classList.add('fa-sun')
            } else {
                toggleIcon.classList.remove('fa-sun')
                toggleIcon.classList.add('fa-moon')
            }
        }
        
        // Store in localStorage
        localStorage.setItem('theme', theme)
        this.theme = theme
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }))
    }
    
    setupToggleButton() {
        const toggleBtn = document.getElementById('darkModeToggle')
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const newTheme = this.theme === 'light' ? 'dark' : 'light'
                this.applyTheme(newTheme)
                
                // Show toast notification
                if (typeof showToast === 'function') {
                    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info')
                }
            })
        }
    }
    
    setupSystemThemeListener() {
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light'
                this.applyTheme(newTheme)
            }
        })
    }
    
    getCurrentTheme() {
        return this.theme
    }
}

// Initialize dark mode when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.darkModeManager = new DarkModeManager()
})

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkModeManager
}