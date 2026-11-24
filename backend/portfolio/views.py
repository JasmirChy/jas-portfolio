from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile, Project, Skill, SocialLink
from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    SkillSerializer,
    SocialLinkSerializer,
)


class PortfolioDataView(APIView):
    """
    Returns all portfolio data (Profile, Projects, Skills, Social Links)
    in a single optimized JSON response with full media URLs.
    """

    def get(self, request):
        profile = Profile.objects.first()
        projects = Project.objects.all()
        skills = Skill.objects.all()
        socials = SocialLink.objects.filter(is_active=True)

        context = {"request": request}

        data = {
            "profile": ProfileSerializer(profile, context=context).data if profile else None,
            "projects": ProjectSerializer(projects, many=True, context=context).data,
            "skills": SkillSerializer(skills, many=True, context=context).data,
            "socials": SocialLinkSerializer(socials, many=True, context=context).data,
        }
        return Response(data)