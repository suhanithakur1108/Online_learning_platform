from django.urls import path
from . import views

urlpatterns = [
    path('', views.student_dashboard, name='student_dashboard'),
    path('my-learning/', views.my_learning, name='my_learning'),
 
]