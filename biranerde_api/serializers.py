from rest_framework import serializers
from .models import Mekan
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class MekanSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Mekan
        geo_field = "konum"
        fields = ['id', 'ad', 'aciklama', 'fiyat_araligi', 'adres', 'konum']