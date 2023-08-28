from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

import WebApp.views as views
from WebApp import api_handlers

urlpatterns = [
    path('', views.home, name='home'),
    path('map_full_screen/', views.map_full_screen, name='map_full_screen'),
    path('map/', views.map_full_screen, name='map'),
    path('about/', views.about, name='about'),
    path('login/', views.login, name='login'),
    path('feedback/', views.feedback, name='feedback'),
    path('privacy/', views.privacy, name='privacy'),
    # path('firebox/', views.get_fires_in_bounding_box, name="firebox"), # depreciated
    path('monthlyfire/', views.get_fires_sum_by_month, name="monthlyfire"),

    path('nicfi_proxy/', views.nicfi_proxy, name='nicfi_proxy'),
    path('planet_proxy/', views.planet_proxy, name='planet_proxy'),
    path('get_cam_areas/', api_handlers.get_cam_areas, name='get_cam_areas'),
    ]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
