# AveoEarth MVP 🌱

A comprehensive eco-conscious marketplace platform built with Next.js, FastAPI, and Supabase.

## 📁 Project Structure

```
aveoearthdevs/
├── backend/              # FastAPI backend application
├── frontend/             # Next.js frontend (legacy)
├── frontend1/            # React frontend (current)
├── ai/                   # AI service microservice
├── tests/                # All test files (JS, Python)
├── docs/                 # Documentation and guides
├── scripts/              # Utility scripts and SQL files
│   └── sql/             # Database setup and migration scripts
├── test-data/            # Test data files (CSV, images)
├── test-results/         # Test output files and reports
└── README.md            # This file
```

## 📚 Quick Links

- **Tests**: See `tests/README.md` for test documentation
- **Documentation**: See `docs/README.md` for all guides
- **Scripts**: See `scripts/README.md` for utility scripts
- **Test Results**: See `test-results/README.md` for test reports

## 🚀 Features

- **Eco-Conscious Design**: Beautiful green and brown earth-tone gradient theme
- **Real-time Search**: Intelligent product search with autocomplete suggestions
- **AI Chatbot**: Floating AveoBuddy mascot with draggable chat interface
- **Shopping Cart**: Full cart functionality with mini-cart dropdown
- **User Authentication**: Complete auth system with Supabase integration
- **Vendor Dashboard**: Supplier onboarding and product management
- **Product Verification**: AI-powered image verification system
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Supabase** - Authentication & Database
- **Custom Components** - Modular architecture

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Supabase** - Database & Auth
- **Pydantic** - Data validation

### AI Services
- **Product Verification API** - Image verification system
- **CLIP Model** - Image-text matching (simplified version included)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:3000`

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000 --host 127.0.0.1
```
Backend API will be available at `http://localhost:8000`

### Product Verification API
```bash
cd product_verification
pip install fastapi uvicorn pillow
python simple_main.py
```
Verification API will be available at `http://localhost:8001`

## 📁 Detailed Project Structure

```
aveo-earth-mvp/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and API client
├── frontend1/               # React frontend (current)
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── features/       # Feature-based modules
│   │   ├── core/          # Core utilities
│   │   └── database/      # Database models
├── ai/                      # AI service microservice
├── product_verification/    # AI verification service
├── tests/                   # All test files
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
├── test-data/               # Test data files
├── test-results/            # Test results and reports
└── docker-compose.yml      # Docker configuration
```

## 🎨 Key Components

### Search Functionality
- Real-time autocomplete with debouncing
- Fallback to mock data when backend unavailable
- Eco-themed dropdown with product suggestions

### Floating Chatbot
- 2x size AveoBuddy mascot (no borders/background)
- Draggable and resizable chat modal
- Dynamic positioning based on screen size

### Shopping Cart
- Mini-cart dropdown in navbar
- Full cart page with item management
- Persistent cart state

## 🌍 Environment Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_VERIFICATION_API_BASE=http://localhost:8001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
DEBUG=True
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically

### Backend (Railway/Heroku)
1. Create new project
2. Connect GitHub repository
3. Set environment variables
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🌱 About AveoEarth

AveoEarth is a sustainability-focused marketplace connecting eco-conscious consumers with verified sustainable vendors worldwide. Our platform promotes environmental responsibility through every transaction.

---

**Built with ❤️ for a sustainable future**