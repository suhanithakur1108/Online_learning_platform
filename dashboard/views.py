from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from courses.models import Enrollment, Course, LectureProgress, Category
from django.utils.text import slugify

@login_required
def student_dashboard(request):
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    
    total_courses = enrollments.count()
    completed_courses = enrollments.filter(is_completed=True).count()
    in_progress_courses = total_courses - completed_courses
    
    recent_lectures = LectureProgress.objects.filter(
        enrollment__student=request.user,
        is_completed=True
    ).order_by('-completed_at')[:5]
    
    context = {
        'enrollments': enrollments,
        'total_courses': total_courses,
        'completed_courses': completed_courses,
        'in_progress_courses': in_progress_courses,
        'recent_lectures': recent_lectures,
    }
    return render(request, 'dashboard/student_dashboard.html', context)


@login_required
def my_learning(request):
    enrollments = Enrollment.objects.filter(student=request.user).select_related('course')
    
    # Calculate total hours (example)
    total_hours = 0
    for enrollment in enrollments:
        if enrollment.course.duration:
            try:
                hours = int(enrollment.course.duration.split()[0])
                total_hours += hours
            except:
                total_hours += 10
    
    context = {
        'enrollments': enrollments,
        'total_hours': total_hours,
    }
    return render(request, 'dashboard/my_learning.html', context)

