import os
import hashlib
from datetime import timedelta
from django.contrib.auth import authenticate
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ContactMessageSerializer


from .models import Profile, Project, Skill, SocialLink, VisitorLog
from .serializers import (
    ProfileSerializer,
    ProjectSerializer,
    SkillSerializer,
    SocialLinkSerializer,
)


class PortfolioDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        profile = Profile.objects.first()
        projects = Project.objects.all()
        skills = Skill.objects.all()
        socials = SocialLink.objects.filter(is_active=True)

        context = {"request": request}
        return Response({
            "profile": ProfileSerializer(profile, context=context).data if profile else None,
            "projects": ProjectSerializer(projects, many=True, context=context).data,
            "skills": SkillSerializer(skills, many=True, context=context).data,
            "socials": SocialLinkSerializer(socials, many=True, context=context).data,
        })


class TrackVisitView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "127.0.0.1")
        user_agent = request.META.get("HTTP_USER_AGENT", "Unknown")
        path = request.data.get("path", "/")[:200]

        ua_lower = user_agent.lower()
        if "mobile" in ua_lower or "android" in ua_lower or "iphone" in ua_lower:
            device_type = "Mobile"
        elif "ipad" in ua_lower or "tablet" in ua_lower:
            device_type = "Tablet"
        else:
            device_type = "Desktop"

        if "edg" in ua_lower:
            browser = "Edge"
        elif "chrome" in ua_lower:
            browser = "Chrome"
        elif "firefox" in ua_lower:
            browser = "Firefox"
        elif "safari" in ua_lower:
            browser = "Safari"
        else:
            browser = "Other"

        raw_id = f"{ip}-{user_agent}".encode("utf-8")
        visitor_hash = hashlib.sha256(raw_id).hexdigest()

        VisitorLog.objects.create(
            ip_address=ip if ip else None,
            visitor_hash=visitor_hash,
            device_type=device_type,
            browser=browser,
            path=path,
        )
        return Response({"status": "recorded"}, status=status.HTTP_201_CREATED)


class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        user = authenticate(username=username, password=password)
        if not user or not user.is_staff:
            return Response(
                {"detail": "Invalid admin credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "username": user.username,
            "email": user.email,
        })


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        seven_days_ago = today_start - timedelta(days=6)

        total_views = VisitorLog.objects.count()
        unique_visitors = VisitorLog.objects.values("visitor_hash").distinct().count()
        today_views = VisitorLog.objects.filter(visited_at__gte=today_start).count()

        # Last 7 days traffic breakdown
        daily_qs = (
            VisitorLog.objects.filter(visited_at__gte=seven_days_ago)
            .annotate(day=TruncDate("visited_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        daily_map = {str(item["day"]): item["count"] for item in daily_qs}
        daily_chart = []
        for i in range(7):
            day_date = (seven_days_ago + timedelta(days=i)).date()
            daily_chart.append({
                "date": day_date.strftime("%b %d"),
                "views": daily_map.get(str(day_date), 0),
            })

        recent_logs = VisitorLog.objects.all()[:12]
        recent_visitors = [
            {
                "id": log.id,
                "visitor_id": f"VIS-{log.visitor_hash[:6].upper()}",
                "device_type": log.device_type,
                "browser": log.browser,
                "path": log.path,
                "visited_at": timezone.localtime(log.visited_at).strftime("%b %d, %I:%M %p"),
            }
            for log in recent_logs
        ]

        return Response({
            "total_views": total_views,
            "unique_visitors": unique_visitors,
            "today_views": today_views,
            "projects_count": Project.objects.count(),
            "skills_count": Skill.objects.count(),
            "socials_count": SocialLink.objects.count(),
            "daily_chart": daily_chart,
            "recent_visitors": recent_visitors,
        })


class AdminProfileView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(id=1)
        return Response(ProfileSerializer(profile, context={"request": request}).data)

    def patch(self, request):
        profile, _ = Profile.objects.get_or_create(id=1)
        data = request.data.copy()

        if str(data.get("remove_avatar", "")).lower() == "true":
            if profile.avatar:
                profile.avatar.delete(save=False)
            profile.avatar = None

        serializer = ProfileSerializer(
            profile, data=data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProjectListCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        projects = Project.objects.all()
        return Response(
            ProjectSerializer(projects, many=True, context={"request": request}).data
        )

    def post(self, request):
        serializer = ProjectSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProjectDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        data = request.data.copy()

        if str(data.get("remove_cover_image", "")).lower() == "true":
            if project.cover_image:
                project.cover_image.delete(save=False)
            project.cover_image = None

        serializer = ProjectSerializer(
            project, data=data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        if project.cover_image:
            project.cover_image.delete(save=False)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSkillListCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        skills = Skill.objects.all()
        return Response(
            SkillSerializer(skills, many=True, context={"request": request}).data
        )

    def post(self, request):
        serializer = SkillSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSkillDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request, pk):
        skill = get_object_or_404(Skill, pk=pk)
        data = request.data.copy()

        if str(data.get("remove_icon_image", "")).lower() == "true":
            if skill.icon_image:
                skill.icon_image.delete(save=False)
            skill.icon_image = None

        serializer = SkillSerializer(
            skill, data=data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        skill = get_object_or_404(Skill, pk=pk)
        if skill.icon_image:
            skill.icon_image.delete(save=False)
        skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSocialListCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        socials = SocialLink.objects.all()
        return Response(
            SocialLinkSerializer(socials, many=True, context={"request": request}).data
        )

    def post(self, request):
        serializer = SocialLinkSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSocialDetailView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request, pk):
        social = get_object_or_404(SocialLink, pk=pk)
        serializer = SocialLinkSerializer(
            social, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        social = get_object_or_404(SocialLink, pk=pk)
        social.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ContactCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        contact = serializer.save()

        resend_api_key = os.environ.get("RESEND_API_KEY", "").strip()
        receiver_email = os.environ.get("CONTACT_RECEIVER_EMAIL", "").strip()

        if resend_api_key and receiver_email:
            try:
                requests.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {resend_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": "Portfolio Contact <onboarding@resend.dev>",
                        "to": [receiver_email],
                        "reply_to": contact.email,
                        "subject": f"[Portfolio] {contact.subject or 'New Message'} from {contact.name}",
                        "text": (
                            f"Name: {contact.name}\n"
                            f"Email: {contact.email}\n"
                            f"Subject: {contact.subject or 'N/A'}\n\n"
                            f"Message:\n{contact.message}"
                        ),
                    },
                    timeout=10,
                )
            except requests.RequestException:
                pass

        return Response(
            {"detail": "Message sent successfully."},
            status=status.HTTP_201_CREATED,
        )