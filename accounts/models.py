from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True, null=True)
    address = models.TextField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)  
    country = models.CharField(max_length=100, default='India', blank=True)
    pin_code = models.CharField(max_length=10, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} - {self.role}"
    
    def is_student(self):
        return self.role == 'student'
    
    def is_instructor(self):
        return self.role == 'instructor'
    
    def is_admin_user(self):
        return self.role == 'admin'
    
    def get_full_name(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username
    
    def get_profile_picture_url(self):
        if self.profile_picture:
            return self.profile_picture.url
        
    
   