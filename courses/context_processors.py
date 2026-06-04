from .models import Category

def course_categories(request):
    try:
        categories = Category.objects.all()
    except:
        categories = []
    return {
        'categories': categories
    }