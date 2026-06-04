from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .forms import *
from .models import User



def register_view(request):
    if request.method == 'POST':
        form = UserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful!')
            return redirect('student_dashboard') 
    else:
        form = UserRegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('student_dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, 'Login successful!')
            return redirect('student_dashboard')
        else:
            messages.error(request, 'Invalid username or password!')
    
    return render(request, 'accounts/login.html')

@login_required
def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out successfully.')
    return redirect('home')

@login_required
def profile_view(request):
    return render(request, 'accounts/profile.html', {'user': request.user})

@login_required
def edit_profile_view(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'accounts/edit_profile.html', {'form': form, 'user': request.user})

@login_required
def change_profile_picture(request):
    if request.method == 'POST':
        form = ProfilePictureForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile picture updated successfully!')
            return redirect('profile')
    else:
        form = ProfilePictureForm(instance=request.user)
    
    return render(request, 'accounts/profile_picture.html', {'form': form})

@login_required
def change_password_view(request):
    if request.method == 'POST':
        form = ChangePasswordForm(request.user, request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  
            messages.success(request, 'Password changed successfully!')
            return redirect('profile')
    else:
        form = ChangePasswordForm(request.user)
    
    return render(request, 'accounts/change_password.html', {'form': form})


@login_required
def remove_profile_picture(request):
    """Remove user's profile picture"""
    if request.method == 'POST':
        if request.user.profile_picture:
            
            request.user.profile_picture.delete()
            request.user.profile_picture = None
            request.user.save()
            return JsonResponse({'status': 'success', 'message': 'Profile picture removed'})
        return JsonResponse({'status': 'error', 'message': 'No profile picture to remove'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request'})    