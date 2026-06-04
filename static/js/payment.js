// ============================================
// STUDYHUB - Payment Processing
// Razorpay Integration
// ============================================

class PaymentProcessor {
    constructor(config) {
        this.key = config.key
        this.orderId = config.orderId
        this.amount = config.amount
        this.courseName = config.courseName
        this.userName = config.userName
        this.userEmail = config.userEmail
        this.userPhone = config.userPhone
    }
    
    init() {
        const options = {
            key: this.key,
            amount: this.amount,
            currency: 'INR',
            name: 'StudyHub',
            description: `Purchase: ${this.courseName}`,
            image: '/static/images/logo.png',
            order_id: this.orderId,
            handler: this.handlePaymentSuccess.bind(this),
            prefill: {
                name: this.userName,
                email: this.userEmail,
                contact: this.userPhone
            },
            notes: {
                address: 'StudyHub Online Learning Platform'
            },
            theme: {
                color: '#1e3c72'
            },
            modal: {
                ondismiss: this.handlePaymentDismiss.bind(this)
            }
        }
        
        const rzp = new Razorpay(options)
        rzp.open()
        
        rzp.on('payment.failed', this.handlePaymentFailure.bind(this))
    }
    
    handlePaymentSuccess(response) {
        // Send payment details to server
        fetch('/payments/success/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': this.getCsrfToken()
            },
            body: new URLSearchParams({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = '/payments/success-page/'
            } else {
                this.showError('Payment verification failed')
            }
        })
        .catch(error => {
            console.error('Error:', error)
            this.showError('An error occurred. Please try again.')
        })
    }
    
    handlePaymentFailure(response) {
        console.error('Payment failed:', response)
        this.showError('Payment failed. Please try again or use another payment method.')
        setTimeout(() => {
            window.location.href = '/payments/failed/'
        }, 3000)
    }
    
    handlePaymentDismiss() {
        this.showInfo('Payment cancelled. You can try again.')
    }
    
    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value
    }
    
    showError(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'danger')
        } else {
            alert(message)
        }
    }
    
    showInfo(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'info')
        } else {
            alert(message)
        }
    }
}

// Initialize payment when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const paymentBtn = document.getElementById('paymentButton')
    if (paymentBtn) {
        paymentBtn.addEventListener('click', (e) => {
            e.preventDefault()
            
            const config = {
                key: paymentBtn.dataset.key,
                orderId: paymentBtn.dataset.orderId,
                amount: paymentBtn.dataset.amount,
                courseName: paymentBtn.dataset.courseName,
                userName: paymentBtn.dataset.userName,
                userEmail: paymentBtn.dataset.userEmail,
                userPhone: paymentBtn.dataset.userPhone
            }
            
            const processor = new PaymentProcessor(config)
            processor.init()
        })
    }
    
    // Add card input formatting
    const cardNumberInput = document.getElementById('cardNumber')
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\s/g, '')
            if (value.length > 16) value = value.slice(0, 16)
            let formatted = value.match(/.{1,4}/g)?.join(' ') || value
            this.value = formatted
        })
    }
    
    const expiryInput = document.getElementById('expiry')
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\//g, '')
            if (value.length > 4) value = value.slice(0, 4)
            if (value.length >= 3) {
                value = value.slice(0, 2) + '/' + value.slice(2)
            }
            this.value = value
        })
    }
    
    const cvvInput = document.getElementById('cvv')
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '')
            if (value.length > 4) value = value.slice(0, 4)
            this.value = value
        })
    }
})