from django.shortcuts import render
from rest_framework import generics
from biranerde_api.models import Mekan
from biranerde_api.serializers import MekanSerializer
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D

class MekanList(generics.ListAPIView):
    serializer_class = MekanSerializer

    def get_queryset(self):
        queryset = Mekan.objects.all()
        # Eğer konum bilgisi varsa, en yakın mekanları sırala
        if 'lat' in self.request.query_params and 'lon' in self.request.query_params:
            lat = float(self.request.query_params['lat'])
            lon = float(self.request.query_params['lon'])
            user_location = Point(lon, lat, srid=4326)
            queryset = queryset.annotate(distance=Distance('konum', user_location)).order_by('distance')
        return queryset
# Create your views here.
# biranerde_api/views.py


from django.core.serializers import serialize

from django.shortcuts import render
from biranerde_api.models import Mekan
from django.core.serializers import serialize

def home(request):
    mekanlar = Mekan.objects.all()
    mekan_json = serialize(
        'geojson',
        mekanlar,
        geometry_field='konum',
        fields=('ad', 'fiyat_araligi', 'puan', 'adres')
    )
    return render(request, 'biranerde_api/home.html', {'mekan_json': mekan_json})
