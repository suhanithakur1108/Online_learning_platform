from django.contrib import admin
from .models import Category, Course, Section, Lecture, Enrollment, LectureProgress

class LectureInline(admin.TabularInline):
    model = Lecture
    extra = 1
    fields = ('title', 'video_url', 'duration', 'order', 'is_preview')

class SectionInline(admin.TabularInline):
    model = Section
    extra = 1
    fields = ('title', 'order')
    inlines = [LectureInline]

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'price', 'level', 'is_published', 'created_at')
    list_filter = ('level', 'category', 'is_published', 'created_at')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [SectionInline]
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    list_filter = ('course',)
    search_fields = ('title',)

@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'duration', 'order', 'is_preview')
    list_filter = ('section__course', 'is_preview')
    search_fields = ('title',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'enrolled_at', 'progress', 'is_completed')
    list_filter = ('course', 'is_completed')
    search_fields = ('student__username', 'course__title')
    readonly_fields = ('enrolled_at',)

@admin.register(LectureProgress)
class LectureProgressAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'lecture', 'is_completed', 'completed_at')
    list_filter = ('is_completed',)
    search_fields = ('enrollment__student__username', 'lecture__title')