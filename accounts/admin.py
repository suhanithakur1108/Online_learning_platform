from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role',  'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Personal Info', {'fields': ('phone', 'profile_picture', 'bio', 'date_of_birth')}),
        ('Address', {'fields': ('address', 'city', 'state', 'country', 'pin_code')}),
       
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Personal Info', {'fields': ('role', 'phone', 'profile_picture')}),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login_ip')

admin.site.register(User, CustomUserAdmin)