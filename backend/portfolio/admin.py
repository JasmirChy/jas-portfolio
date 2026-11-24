from django.contrib import admin
from django.utils.html import format_html
from .models import Profile, Project, Skill, SocialLink, GalleryImage


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("brand_name", "full_name", "location", "availability_status", "avatar_thumb", "updated_at")
    readonly_fields = ("avatar_preview", "updated_at")
    fieldsets = (
        ("Identity", {
            "fields": ("brand_name", "full_name", "hero_headline", "bio")
        }),
        ("Status & Location", {
            "fields": ("location", "availability_status", "resume_url")
        }),
        ("Profile Photo (Add / Replace / Clear to Remove)", {
            "fields": ("avatar", "avatar_preview")
        }),
    )

    def avatar_thumb(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:42px;height:42px;object-fit:cover;border-radius:50%;border:1px solid #444;" />',
                obj.avatar.url,
            )
        return "No image"
    avatar_thumb.short_description = "Photo"

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="max-height:180px;border-radius:12px;border:1px solid #444;" />',
                obj.avatar.url,
            )
        return "No profile image uploaded yet."
    avatar_preview.short_description = "Current Image Preview"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "subtitle", "image_thumb", "accent_color", "featured", "order")
    list_editable = ("featured", "order")
    list_filter = ("featured",)
    search_fields = ("title", "subtitle", "tech_stack")
    readonly_fields = ("image_preview", "created_at")

    def image_thumb(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" style="width:64px;height:40px;object-fit:cover;border-radius:6px;" />',
                obj.cover_image.url,
            )
        return "No image"
    image_thumb.short_description = "Cover"

    def image_preview(self, obj):
        if obj.cover_image:
            return format_html(
                '<img src="{}" style="max-height:220px;border-radius:10px;" />',
                obj.cover_image.url,
            )
        return "No cover image uploaded."
    image_preview.short_description = "Cover Image Preview"


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "icon_thumb", "proficiency", "order")
    list_editable = ("category", "proficiency", "order")
    list_filter = ("category",)
    search_fields = ("name",)
    readonly_fields = ("icon_preview",)

    def icon_thumb(self, obj):
        if obj.icon_image:
            return format_html(
                '<img src="{}" style="width:32px;height:32px;object-fit:contain;" />',
                obj.icon_image.url,
            )
        return "No icon"
    icon_thumb.short_description = "Icon"

    def icon_preview(self, obj):
        if obj.icon_image:
            return format_html(
                '<img src="{}" style="max-height:100px;" />',
                obj.icon_image.url,
            )
        return "No skill icon uploaded."
    icon_preview.short_description = "Icon Preview"


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("label", "platform", "url", "is_active", "order")
    list_editable = ("is_active", "order")
    list_filter = ("platform", "is_active")
    search_fields = ("label", "url")


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ("title", "tag", "photo_thumb", "accent_color", "is_active", "order")
    list_editable = ("tag", "is_active", "order")
    list_filter = ("tag", "is_active")
    search_fields = ("title", "caption", "tag")
    readonly_fields = ("photo_preview", "created_at")

    def photo_thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid #444;" />',
                obj.image.url,
            )
        return "No image"
    photo_thumb.short_description = "Photo"

    def photo_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:240px;border-radius:12px;" />',
                obj.image.url,
            )
        return "No image uploaded."
    photo_preview.short_description = "Full Preview"


admin.site.site_header = "JAS Portfolio Admin"
admin.site.site_title = "JAS Admin Portal"
admin.site.index_title = "Manage Profile, Projects, Skills, Gallery & Links"