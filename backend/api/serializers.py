from rest_framework import serializers
from .models import RiderSegment

class RiderSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiderSegment
        fields = '__all__'
