from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
import razorpay
from courses.models import Course, Enrollment
from .models import Payment


client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@login_required
def create_payment(request, course_slug):
    """Create payment page"""
    course = get_object_or_404(Course, slug=course_slug)
    
    # Check if already enrolled
    if Enrollment.objects.filter(student=request.user, course=course).exists():
        messages.info(request, 'You are already enrolled in this course.')
        return redirect('my_learning')
    
    # Create Razorpay order
    amount_in_paise = int(float(course.price) * 100)
    
    order = client.order.create({
        'amount': amount_in_paise,
        'currency': 'INR',
        'payment_capture': '1'
    })
    
    # Save payment record
    Payment.objects.create(
        student=request.user,
        course=course,
        amount=course.price,
        razorpay_order_id=order['id'],
        status='pending'
    )
    
    context = {
        'course': course,
        'order_id': order['id'],
        'razorpay_key': settings.RAZORPAY_KEY_ID,
        'amount': amount_in_paise,
        'user_name': request.user.get_full_name() or request.user.username,
        'user_email': request.user.email,
        'user_phone': request.user.phone or '9999999999'
    }
    
    return render(request, 'payments/payment.html', context)


@login_required
def payment_success(request):
    """Handle successful payment"""
    if request.method == 'POST':
        order_id = request.POST.get('razorpay_order_id')
        payment_id = request.POST.get('razorpay_payment_id')
        signature = request.POST.get('razorpay_signature')
        
        try:
            # Verify payment signature
            params_dict = {
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            }
            client.utility.verify_payment_signature(params_dict)
            
            # Update payment record
            payment = Payment.objects.get(razorpay_order_id=order_id)
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature = signature
            payment.status = 'success'
            payment.save()
            
            # Enroll student
            enrollment, created = Enrollment.objects.get_or_create(
                student=request.user,
                course=payment.course
            )
            
            messages.success(request, f'Payment successful! Enrolled in {payment.course.title}')
            return render(request, 'payments/payment_success.html', {'payment': payment})
            
        except Exception as e:
            messages.error(request, 'Payment verification failed!')
            return redirect('payment_failed')
    
    return redirect('home')


@login_required
def payment_failed(request):
    """Handle failed payment"""
    return render(request, 'payments/payment_failed.html')