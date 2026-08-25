from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from apps.salons.api import router as salons_router

api = NinjaAPI(
    title="منصة تَرجيل - Tarjeel Salon Management API",
    version="1.0.0",
    description="نظام سحابي شامل لإدارة صالونات التجميل، الكراسي، المصففات، المخزون بالجرام، وفواتير نقاط البيع (POS).",
    docs_url="/docs",
)

api.add_router("/", salons_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', api.urls),
]
