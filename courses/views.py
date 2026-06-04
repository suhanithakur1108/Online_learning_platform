from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages  
from django.http import JsonResponse
from django.utils import timezone
from django.urls import reverse  
from django.urls import reverse
from .models import Course, Category, Lecture, Enrollment, LectureProgress

import json

def home_view(request):
    courses = Course.objects.filter(is_published=True)[:6]  
    return render(request, 'home.html', {'courses': courses})

def course_list_view(request):
    courses = Course.objects.filter(is_published=True)
    categories = Category.objects.all()
    
    category_slug = request.GET.get('category')
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        courses = courses.filter(category=category)
    
    search_query = request.GET.get('q')
    if search_query:
        courses = courses.filter(title__icontains=search_query)
    
    context = {
        'courses': courses,
        'categories': categories,
    }
    return render(request, 'courses/course_list.html', context)

def course_detail_view(request, slug):
    course = get_object_or_404(Course, slug=slug, is_published=True)
    is_enrolled = False
    enrollment = None
    
    if request.user.is_authenticated:
        is_enrolled = Enrollment.objects.filter(student=request.user, course=course).exists()
        if is_enrolled:
            enrollment = Enrollment.objects.get(student=request.user, course=course)
    
    context = {
        'course': course,
        'is_enrolled': is_enrolled,
        'enrollment': enrollment,
    }
    return render(request, 'courses/course_detail.html', context)
@login_required
def enroll_view(request, slug):
    course = get_object_or_404(Course, slug=slug)
    
    # Check if already enrolled
    if Enrollment.objects.filter(student=request.user, course=course).exists():
        messages.info(request, 'You are already enrolled in this course.')
        return redirect('course_detail', slug=course.slug)
    
    # Free course - direct enrollment
    if course.price == 0:
        Enrollment.objects.create(student=request.user, course=course)
        messages.success(request, f'Successfully enrolled in {course.title}!')
        return redirect('my_learning')
    
    # Paid course - redirect to payment
    return redirect(reverse('create_payment', kwargs={'course_slug': course.slug}))
@login_required
def lecture_detail_view(request, course_slug, lecture_id):
    course = get_object_or_404(Course, slug=course_slug)
    lecture = get_object_or_404(Lecture, id=lecture_id, section__course=course)
    
    # Check enrollment
    if not request.user.is_authenticated:
        return redirect('login')
    
    enrollment = get_object_or_404(Enrollment, student=request.user, course=course)
    
    # Get completed lectures for this enrollment
    completed_lectures = LectureProgress.objects.filter(
        enrollment=enrollment,
        is_completed=True
    ).values_list('lecture_id', flat=True)
    
    # Get previous and next lectures
    lectures = list(Lecture.objects.filter(section__course=course).order_by('section__order', 'order'))
    current_index = next((i for i, l in enumerate(lectures) if l.id == lecture.id), -1)
    prev_lecture = lectures[current_index - 1] if current_index > 0 else None
    next_lecture = lectures[current_index + 1] if current_index < len(lectures) - 1 else None
    
    context = {
        'course': course,
        'lecture': lecture,
        'enrollment': enrollment,
        'completed_lectures': completed_lectures,
        'prev_lecture': prev_lecture,
        'next_lecture': next_lecture,
        'is_enrolled': True,
    }
    return render(request, 'courses/lecture_detail.html', context)


