from django.urls import path
from .views import RiderSegmentList, UploadDatasetView

urlpatterns = [
    path('segments/', RiderSegmentList.as_view(), name='segment-list'),
    path('upload/', UploadDatasetView.as_view(), name='upload-dataset'),
]
