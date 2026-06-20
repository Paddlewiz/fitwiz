# AGENTS.md

# FitWiz - Health & Weight Loss Tracking App

## Project Overview
FitWiz is a free web-based health and weight loss tracking application built with Next.js 16, React 19, TypeScript, and Supabase. The app provides free SEO calculator pages (TDEE, BMI) and authenticated body metrics tracking.

## Version Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Database**: Supabase PostgreSQL with RLS
- **Auth**: Supabase Auth (Email/Password + Google OAuth)

## Project Structure
```
/workspace/projects/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with SupabaseConfigProvider
│   │   ├── page.tsx              # Home page
│   │   ├── calculators/
│   │   │   ├── tdee/             # TDEE Calculator (SSG)
│   │   │   └── bmi/              # BMI Calculator (SSG)
│   │   ├── login/                # Login page with email/Google OAuth
│   │   ├── dashboard/            # User dashboard
│   │   ├── metrics/              # Body metrics tracking
│   │   └── api/
│   │       └── supabase-config/  # API route for Supabase credentials
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── header.tsx            # Navigation header
│   │   └ footer.tsx              # Footer component
│   ├── lib/
│   │   ├── supabase-config-inject.tsx  # Supabase config provider
│   │   ├── supabase-browser.ts         # Browser client
│   │   └── utils.ts                    # Utility functions
│   └── storage/database/
│       └── supabase-client.ts    # Server-side Supabase client
│       └── shared/
│           ├── schema.ts         # Database schema
│           └── relations.ts      # Table relations
├── DESIGN.md                     # Design guidelines (teal #10B981)
├── AGENTS.md                     # This file
└── .coze                         # Project configuration
```

## Database Tables (Supabase with RLS)
- **user_profiles**: Extended user profile (target_weight, height, activity_level)
- **body_metrics**: Weight, body fat %, BMI, body age, visceral fat, muscle mass, bone mass, water %
- **diet_logs**: Food intake records
- **exercise_logs**: Workout records
- **foods**: Food database (public + user custom)
- **plans**: Diet/exercise plans
- **daily_summary**: Aggregated daily stats

All user-specific tables use RLS Scenario D (user_id with default auth.uid()).

## Build Commands
- `pnpm install` - Install dependencies
- `pnpm run dev` - Start development server (port 5000)
- `pnpm run build` - Build for production
- `pnpm ts-check` - TypeScript type checking

## Database Commands
- `npx coze-coding-ai db generate-models` - Sync schema from database
- `npx coze-coding-ai db upgrade` - Push schema changes to database

## Auth Commands
- `npx coze-coding-ai supabase auth get-config-v2` - Get auth configuration
- `npx coze-coding-ai supabase auth update-config-v2` - Update auth configuration

## Key Features
1. **TDEE Calculator**: Mifflin-St Jeor formula, SSG page, SEO optimized
2. **BMI Calculator**: Visual scale, health advice, SSG page
3. **Email/Password Auth**: Registration + Login, auto-confirm enabled
4. **Google OAuth**: One-click sign-in
5. **Body Metrics Tracking**: Weight, body composition, history list + Recharts
6. **Dashboard**: Stats cards, 30-day trend, progress bar, quick actions

## API Endpoints
- `/api/supabase-config` - GET Supabase URL and anon key (public)
- All data APIs require `x-session` header with user token

## Design Tokens (DESIGN.md)
- Primary: Teal `#10B981`
- Background: White/Gray-50
- Font: Inter (system fonts fallback)
- Cards: White with shadow, 8px rounded
- Mobile-first responsive design

## Notes
- Auth uses `mailer_auto_confirm: true` - no email verification required
- Phone login disabled (`external_phone_enabled: false`)
- RLS policies configured for all tables
- Charts use Recharts library