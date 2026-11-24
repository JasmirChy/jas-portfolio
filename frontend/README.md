# JAS — Full-Stack Interactive Developer Portfolio

A mobile-first, motion-driven full-stack portfolio built with **Python**, **Django REST Framework**, **PostgreSQL**, **React**, **Tailwind CSS**, and **Framer Motion**.

## Key Features
- **Dynamic Django Admin CMS:** Add, replace, reorder, or remove profile photos, projects with cover images, skill icons, and social links with live image previews.
- **Shattered-Glass Welcome & 404 Experience:** Interactive CRT parchment opening screen with spiderweb fractures, falling shards, and smooth zoom transition.
- **Scroll & Cursor-Reactive Profile Stage:** Counter-rotating orbital HUD rings, rotating stamp badge, and 3D gyroscopic tilt synced to scroll and cursor position.
- **3D Perspective Project Carousel:** Touch-swipeable and keyboard-navigable 3D stage with crosshair reticles, category filters, grid toggle, and detail modal.
- **Dynamic Skills Matrix & Kinetic Footer:** Filterable tech stack with animated proficiency bars, infinite marquee, and one-click email copy.

## Tech Stack
- **Backend:** Python, Django, Django REST Framework, django-cors-headers, Pillow
- **Database:** PostgreSQL
- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Axios

## Local Setup

### 1. Backend (Django + PostgreSQL)
```bash
cd backend
py -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver