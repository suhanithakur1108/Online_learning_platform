from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, default="fas fa-book")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        db_table = 'categories'
    
    def __str__(self):
        return self.name

class Course(models.Model):
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    )
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses')
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_teaching')
    thumbnail = models.ImageField(upload_to='course_thumbnails/', null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    duration = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'courses'
    
    def __str__(self):
        return self.title
    
    def get_total_lectures(self):
        total = 0
        for section in self.sections.all():
            total += section.lectures.count()
        return total
    
    def enrolled_students_count(self):
        return self.enrollments.count()

class Section(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
        db_table = 'sections'
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lecture(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lectures')
    title = models.CharField(max_length=200)
    video_url = models.URLField(help_text="YouTube or Vimeo URL")
    duration = models.IntegerField(default=0, help_text="Duration in minutes")
    order = models.IntegerField(default=0)
    is_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
        db_table = 'lectures'
    
    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['student', 'course']
        db_table = 'enrollments'
    
    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

class LectureProgress(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='lecture_progress')
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['enrollment', 'lecture']
        db_table = 'lecture_progress'
    
    def __str__(self):
        return f"{self.enrollment.student.username} - {self.lecture.title}"
    
