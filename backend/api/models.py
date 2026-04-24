from django.db import models

class RiderSegment(models.Model):
    dteday = models.DateField()
    season = models.IntegerField()
    yr = models.IntegerField()
    mnth = models.IntegerField()
    hr = models.IntegerField()
    holiday = models.IntegerField()
    weekday = models.IntegerField()
    workingday = models.IntegerField()
    weathersit = models.IntegerField()
    temp = models.FloatField()
    atemp = models.FloatField()
    hum = models.FloatField()
    windspeed = models.FloatField()
    casual = models.IntegerField()
    registered = models.IntegerField()
    cnt = models.IntegerField()
    daily_total = models.IntegerField()
    weather_name = models.CharField(max_length=50)
    season_name = models.CharField(max_length=50)
    cluster = models.IntegerField()
    
    # PCA coordinates for frontend plotting
    pca_1 = models.FloatField(null=True, blank=True)
    pca_2 = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.dteday} - Cluster {self.cluster}"
