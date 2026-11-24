from rest_framework import serializers
from .models import Profile, Project, Skill, SocialLink


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "id",
            "full_name",
            "brand_name",
            "hero_headline",
            "bio",
            "location",
            "availability_status",
            "avatar",
            "resume_url",
            "updated_at",
        ]


class ProjectSerializer(serializers.ModelSerializer):
    tech_list = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "subtitle",
            "description",
            "cover_image",
            "accent_color",
            "tech_stack",
            "tech_list",
            "live_url",
            "github_url",
            "featured",
            "order",
            "created_at",
        ]

    def get_tech_list(self, obj):
        if not obj.tech_stack:
            return []
        return [item.strip() for item in obj.tech_stack.split(",") if item.strip()]


class SkillSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "category",
            "category_display",
            "icon_image",
            "proficiency",
            "order",
        ]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = [
            "id",
            "platform",
            "label",
            "url",
            "icon_image",
            "order",
        ]