from django.urls import path
from . import views

urlpatterns = [
    path('', views.course_list_view, name='course_list'),
    path('<slug:slug>/', views.course_detail_view, name='course_detail'),
    path('<slug:slug>/enroll/', views.enroll_view, name='enroll'),
    path('<slug:course_slug>/lecture/<int:lecture_id>/', views.lecture_detail_view, name='lecture_detail'),
]