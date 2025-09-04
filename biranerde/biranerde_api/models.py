from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

class Mekan(models.Model):
    ad = models.CharField(max_length=200)
    aciklama = models.TextField(blank=True, null=True)
    fiyat_araligi = models.CharField(max_length=50)
    puan = models.FloatField(default=0)
    konum = models.PointField(srid=4326)  # lon/lat
    adres = models.CharField(max_length=250, blank=True, null=True)

    class Meta:
        db_table = 'mekan'  # <- İşte buraya tablo adını yazıyoruz

    def __str__(self):
        return self.ad
