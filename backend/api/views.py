from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from .models import RiderSegment
from .serializers import RiderSegmentSerializer
import pandas as pd
import joblib

class RiderSegmentList(generics.ListAPIView):
    queryset = RiderSegment.objects.all()
    serializer_class = RiderSegmentSerializer

class UploadDatasetView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=400)
            
        try:
            df = pd.read_csv(file_obj)
            
            scaler = joblib.load('../scaler.pkl')
            kmeans = joblib.load('../kmeans.pkl')
            
            unseen_features = df[['casual', 'registered']].copy()
            scaled_features = scaler.transform(unseen_features)
            clusters = kmeans.predict(scaled_features)
            
            df['cluster'] = clusters
            
            season_map = {1: 'Spring', 2: 'Summer', 3: 'Fall', 4: 'Winter'}
            weather_map = {1: 'Clear', 2: 'Mist', 3: 'Light Snow/Rain', 4: 'Heavy Rain/Snow'}
            
            results = []
            for idx, row in df.iterrows():
                results.append({
                    'id': idx,
                    'dteday': str(row.get('dteday', '2030-01-01')) + f" {int(row.get('hr', 0))}:00", # App expects date or date+hour
                    'hr': int(row.get('hr', 0)),
                    'season_name': season_map.get(row.get('season', 1), 'Unknown'),
                    'weather_name': weather_map.get(row.get('weathersit', 1), 'Unknown'),
                    'temp': float(row.get('temp', 0.5)),
                    'casual': int(row.get('casual', 0)),
                    'registered': int(row.get('registered', 0)),
                    'cnt': int(row.get('cnt', row.get('casual', 0) + row.get('registered', 0))),
                    'cluster': int(row['cluster'])
                })
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
