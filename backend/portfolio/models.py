from django.db import models


class Profile(models.Model):
    full_name = models.CharField(max_length=100, default="Jasmir Chaudhary")
    brand_name = models.CharField(max_length=50, default="JAS")
    hero_headline = models.CharField(
        max_length=200,
        default="I design and build websites and digital products.",
    )
    bio = models.TextField(
        blank=True,
        default="Full-stack developer crafting bold, interactive web experiences with Python, Django, React, and PostgreSQL.",
    )
    location = models.CharField(max_length=100, default="Dhangadhi, Nepal")
    availability_status = models.CharField(
        max_length=100,
        default="Open to new projects.",
    )
    avatar = models.ImageField(
        upload_to="profile/",
        blank=True,
        null=True,
        help_text="Upload, replace, or check 'Clear' to remove your profile image.",
    )
    resume_url = models.URLField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profile"
        verbose_name_plural = "Profile"

    def __str__(self):
        return f"{self.brand_name} ({self.full_name})"


class Project(models.Model):
    title = models.CharField(max_length=120)
    subtitle = models.CharField(max_length=150, blank=True)
    description = models.TextField()
    cover_image = models.ImageField(
        upload_to="projects/",
        blank=True,
        null=True,
        help_text="Upload, replace, or check 'Clear' to remove the project image.",
    )
    accent_color = models.CharField(
        max_length=20,
        default="#FF1E00",
        help_text="Hex color for bold card highlight (e.g., #FF1E00, #F5C451, #D9381E).",
    )
    tech_stack = models.CharField(
        max_length=250,
        default="Python, Django, React, PostgreSQL",
        help_text="Comma-separated technologies (e.g., Django, React, PostgreSQL).",
    )
    live_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    featured = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ("frontend", "Frontend"),
        ("backend", "Backend"),
        ("database", "Database"),
        ("tools", "Tools & DevOps"),
    ]

    name = models.CharField(max_length=80)
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="backend",
    )
    icon_image = models.ImageField(
        upload_to="skills/",
        blank=True,
        null=True,
        help_text="Upload a PNG/SVG/WebP skill icon, replace it, or check 'Clear' to remove.",
    )
    proficiency = models.PositiveIntegerField(
        default=90,
        help_text="Skill level from 1 to 100.",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class SocialLink(models.Model):
    PLATFORM_CHOICES = [
        ("linkedin", "LinkedIn"),
        ("github", "GitHub"),
        ("instagram", "Instagram"),
        ("email", "Email"),
        ("youtube", "YouTube"),
        ("x", "X (Twitter)"),
        ("website", "Website"),
        ("other", "Other"),
    ]

    platform = models.CharField(
        max_length=30,
        choices=PLATFORM_CHOICES,
        default="linkedin",
    )
    label = models.CharField(
        max_length=60,
        help_text="Display text (e.g., LinkedIn, Email, Instagram).",
    )
    url = models.CharField(
        max_length=255,
        help_text="Full URL (https://...) or email link (mailto:you@example.com).",
    )
    icon_image = models.ImageField(
        upload_to="socials/",
        blank=True,
        null=True,
        help_text="Optional custom icon image.",
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "label"]

    def __str__(self):
        return f"{self.label} ({self.platform})"

class VisitorLog(models.Model):
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    visitor_hash = models.CharField(max_length=64, db_index=True)
    device_type = models.CharField(max_length=30, default="Desktop")
    browser = models.CharField(max_length=60, default="Browser")
    path = models.CharField(max_length=200, default="/")
    visited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-visited_at"]

    def __str__(self):
        return f"{self.device_type} • {self.path} ({self.visited_at:%Y-%m-%d %H:%M})"

class GalleryImage(models.Model):
    title = models.CharField(max_length=120)
    caption = models.CharField(
        max_length=200,
        blank=True,
        help_text="Short creative note, location, or camera/design context.",
    )
    tag = models.CharField(
        max_length=50,
        default="VISUAL",
        help_text="Short badge tag (e.g., DESIGN, STUDIO, LIFE, UI/UX).",
    )
    image = models.ImageField(
        upload_to="gallery/",
        help_text="Upload a photo, replace it, or delete the entry in Admin.",
    )
    accent_color = models.CharField(
        max_length=20,
        default="#F5C451",
        help_text="Glow accent color (e.g., #FF1E00 or #F5C451).",
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Gallery Image"
        verbose_name_plural = "Gallery Images"

    def __str__(self):
        return self.title