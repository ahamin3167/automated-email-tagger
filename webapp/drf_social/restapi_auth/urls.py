"""restapi_auth URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from social_login.views import GoogleLogin, gethello, update_credentials, get_emails, query_by_tag, get_analytics, shift_weights, get_sorted_emails

urlpatterns = [
    path('admin/', admin.site.urls),
    path('rest-auth/', include('rest_auth.urls')),
    path('rest-auth/registration/', include('rest_auth.registration.urls')),
    path('rest-auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('accounts/', include('allauth.urls')),
    path('testend1/', gethello),
    path('updatecreds/', update_credentials),
    path('getemails/', get_emails),
    path('queryemails/', query_by_tag),
    path('getanalytics/', get_analytics),
    path('shiftweights/', shift_weights),
    path('getsortedemails/', get_sorted_emails)
]
