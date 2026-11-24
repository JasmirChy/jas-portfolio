from django.urls import path
from .views import (
    PortfolioDataView,
    TrackVisitView,
    AdminLoginView,
    AdminStatsView,
    AdminProfileView,
    AdminProjectListCreateView,
    AdminProjectDetailView,
    AdminSkillListCreateView,
    AdminSkillDetailView,
    AdminSocialListCreateView,
    AdminSocialDetailView,
    ContactCreateView
)

urlpatterns = [
    # Public endpoints
    path("portfolio/", PortfolioDataView.as_view(), name="portfolio-data"),
    path("track-visit/", TrackVisitView.as_view(), name="track-visit"),

    # Admin Auth & Dashboard CRUD endpoints
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    path("admin/profile/", AdminProfileView.as_view(), name="admin-profile"),
    path("admin/projects/", AdminProjectListCreateView.as_view(), name="admin-projects"),
    path("admin/projects/<int:pk>/", AdminProjectDetailView.as_view(), name="admin-project-detail"),
    path("admin/skills/", AdminSkillListCreateView.as_view(), name="admin-skills"),
    path("admin/skills/<int:pk>/", AdminSkillDetailView.as_view(), name="admin-skill-detail"),
    path("admin/socials/", AdminSocialListCreateView.as_view(), name="admin-socials"),
    path("admin/socials/<int:pk>/", AdminSocialDetailView.as_view(), name="admin-social-detail"),
    path('contact/', ContactCreateView.as_view(), name='contact-create'),
]