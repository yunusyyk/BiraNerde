from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------------
# GeoDjango GDAL/GEOS Ayarları
# -------------------------------

# Linux ortamı için GDAL ve GEOS path
GDAL_LIBRARY_PATH = '/usr/lib/libgdal.so'       # Render üzerinde libgdal.so yolu
GEOS_LIBRARY_PATH = '/usr/lib/libgeos_c.so'    # Render üzerinde libgeos_c.so yolu

# GDAL ve PROJ veri dosyalarının yolu
os.environ.setdefault('GDAL_DATA', '/usr/share/gdal')
os.environ.setdefault('PROJ_LIB', '/usr/share/proj')

# PATH güncellemesi (Linux için genellikle gerekli değil ama eklenebilir)
os.environ['PATH'] = '/usr/lib:' + os.environ.get('PATH', '')

# -------------------------------
# Django Standart Ayarları
# -------------------------------

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
DEBUG = False
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',         # GeoDjango uygulamaları
    'rest_framework',
    'rest_framework_gis',
    'biranerde_api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'biranerde.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'biranerde.wsgi.application'

# -------------------------------
# Database (PostgreSQL / PostGIS)
# -------------------------------
from dotenv import load_dotenv
load_dotenv()

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),  # Render'da DB hostunu localhost değil, Render PostgreSQL hostu yap
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# -------------------------------
# Password Validation
# -------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -------------------------------
# Internationalization
# -------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -------------------------------
# Static Files
# -------------------------------
STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
