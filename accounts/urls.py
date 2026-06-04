from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/edit/', views.edit_profile_view, name='edit_profile'),
    path('profile/picture/', views.change_profile_picture, name='change_profile_picture'),
     path('profile/remove-picture/', views.remove_profile_picture, name='remove_profile_picture'),
    path('profile/change-password/', views.change_password_view, name='change_password'),
   
]