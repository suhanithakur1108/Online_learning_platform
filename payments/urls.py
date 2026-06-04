from django.urls import path
from . import views

urlpatterns = [
    path('create/<slug:course_slug>/', views.create_payment, name='create_payment'),
    path('success/', views.payment_success, name='payment_success'),
    path('failed/', views.payment_failed, name='payment_failed'),
]