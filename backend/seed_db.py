import os
import sys
import pandas as pd
import joblib
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import RiderSegment

def seed():
    print("Loading data and models...")
    df = pd.read_csv('../dataset/clustered_bike_data.csv')
    scaler = joblib.load('../scaler.pkl')
    pca = joblib.load('../pca.pkl')

    print("Computing PCA...")
    # Features used in notebook
    features = ['casual', 'registered']
    X = df[features]
    X_scaled = scaler.transform(X)
    X_pca = pca.transform(X_scaled)
    
    df['pca_1'] = X_pca[:, 0]
    df['pca_2'] = X_pca[:, 1]

    print("Seeding database...")
    RiderSegment.objects.all().delete()

    segments = []
    # Using batches to speed up bulk_create
    for idx, row in df.iterrows():
        segment = RiderSegment(
            dteday=row['dteday'],
            season=row['season'],
            yr=row['yr'],
            mnth=row['mnth'],
            hr=row['hr'],
            holiday=row['holiday'],
            weekday=row['weekday'],
            workingday=row['workingday'],
            weathersit=row['weathersit'],
            temp=row['temp'],
            atemp=row['atemp'],
            hum=row['hum'],
            windspeed=row['windspeed'],
            casual=row['casual'],
            registered=row['registered'],
            cnt=row['cnt'],
            daily_total=row['daily_total'],
            weather_name=row['weather_name'],
            season_name=row['season_name'],
            cluster=row['cluster'],
            pca_1=row['pca_1'],
            pca_2=row['pca_2']
        )
        segments.append(segment)
        if len(segments) >= 1000:
            RiderSegment.objects.bulk_create(segments)
            segments = []
            
    if segments:
        RiderSegment.objects.bulk_create(segments)
        
    print(f"Database seeded successfully with {df.shape[0]} records.")

if __name__ == '__main__':
    seed()
