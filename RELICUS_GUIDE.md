# Relicus - Mobile App Guide

## Overview
Relicus is a premium mobile-first web application combining mental health counselling, psychotherapy, entrance exam coaching, skill enhancement, one-to-one tuition, and mindfulness practices.

## Tech Stack
- **React 18** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS v4** for styling
- **Motion (Framer Motion)** for animations
- **Lucide React** for icons
- **Radix UI** for accessible components

## Color System
- **Midnight Blue**: `#1C4966` (Primary)
- **Healthcare Green**: `#5F8B70` (Secondary)
- **Warm Cream**: `#FFFFF0` (Background)
- **Soft Sky Blue**: `#8FBDD7` (Accent)
- **Light Mint**: `#DDEEE3`
- **Soft Gray**: `#F5F7FA`

## Application Flow

### Onboarding (Screens 1-4)
1. **App Intro** (`/`) - Hero showcase with 3 floating phone mockups
2. **Splash Screen** (`/splash`) - Animated loading with Relicus logo
3. **Landing Page** (`/landing`) - Carousel of services with phone/OTP entry
4. **OTP Verification** (`/otp`) - 6-digit OTP entry with timer

### Main Application (`/app`)
The app uses bottom navigation with 5 main tabs:

#### Home Tab (`/app`)
5. **Main Dashboard** - Flagship screen with feature cards for all services

#### Sessions Tab (`/app/sessions`)
10. **Client Dashboard** - Mood tracker, upcoming sessions, tasks, journal

#### Learning Tab (`/app/learning`)
12. **Entrance Coaching** - Study progress, subjects, mock tests, classes

#### Notifications Tab (`/app/notifications`)
Currently shows Client Dashboard (can be customized)

#### Profile Tab (`/app/profile`)
18. **Profile Screen** - User settings, session history, certificates

### Counselling & Therapy Flow
6. **Counselling Listing** (`/app/counselling`) - Browse therapists
7. **Therapist Profile** (`/app/counselling/:id`) - Detailed profile with booking
8. **Session Booking** (`/app/counselling/:id/book`) - Calendar, time slots, payment
9. **Video Call** (`/app/counselling/video/:id`) - Live therapy session interface
11. **Therapist Dashboard** (`/app/therapist/dashboard`) - For therapists to manage clients

### Education & Learning
13. **Mock Test** (`/app/coaching/test/:id`) - MCQ test interface with timer
14. **Skill Enhancement** (`/app/skills`) - Course catalog, certificates, progress
15. **Student Dashboard** (`/app/student/dashboard`) - Attendance, homework, grades
16. **Teacher Dashboard** (`/app/teacher/dashboard`) - Class management, assignments

### Wellness
17. **Mindfulness** (`/app/mindfulness`) - Meditation, breathing, yoga, mood journal

### Special Screens
19. **Design System** (`/app/design-system`) - Component library showcase
20. **Showcase** (`/showcase`) - Marketing presentation with 6 floating phones

## Key Features

### Design Patterns
- **Mobile-First**: Optimized for smartphone screens (max-width: 448px)
- **Premium Aesthetic**: Glassmorphism, soft shadows, rounded corners
- **Smooth Animations**: Motion-powered transitions and micro-interactions
- **Accessible**: Radix UI components for screen readers and keyboard navigation

### Navigation
- **Bottom Tab Bar**: Fixed at bottom with 5 main sections
- **Breadcrumb Navigation**: Back buttons on detail screens
- **Deep Linking**: All screens have unique URLs

### Interactions
- **Tap Feedback**: Scale animations on button press
- **Loading States**: Skeleton screens and progress indicators
- **Success Animations**: Checkmarks and confirmations
- **Pull to Refresh**: Native-like interactions

### Data Features
- **Progress Tracking**: Visual progress bars and streaks
- **Mood Analytics**: Charts and graphs for wellness tracking
- **Session Management**: Booking, scheduling, reminders
- **Achievement System**: Certificates and milestones

## Component Architecture

### Reusable Components
- **Button**: 4 variants (primary, secondary, outline, ghost), 3 sizes
- **Input**: Labeled text inputs with focus states
- **Card**: Flexible container with header/content sections
- **GradientCard**: Feature cards with icon, gradient, and navigation

### Layout Components
- **RootLayout**: Main app shell with bottom navigation
- **Screen Components**: 20 individual screen implementations

## Running the App

The app runs automatically in the Figma Make preview. Key routes to visit:

- `/` - Start here for the full onboarding experience
- `/app` - Jump directly to the main dashboard
- `/app/counselling` - Explore therapy features
- `/app/coaching` - View learning features
- `/app/mindfulness` - Experience wellness section
- `/app/design-system` - View all components
- `/showcase` - Marketing presentation

## Customization Points

1. **Color Scheme**: Edit `/src/styles/theme.css` for brand colors
2. **Typography**: Update font imports in `/src/styles/fonts.css`
3. **Navigation**: Modify tabs in `/src/app/layouts/RootLayout.tsx`
4. **Routes**: Add/edit routes in `/src/app/routes.tsx`
5. **Animations**: Adjust Motion parameters in individual components

## Best Practices Implemented

- ✅ Type-safe routing with React Router
- ✅ Consistent spacing and sizing system
- ✅ Accessible color contrast ratios
- ✅ Performance-optimized animations
- ✅ Mobile-responsive layouts
- ✅ Clean component architecture
- ✅ Reusable design tokens

## Next Steps

To enhance the app further:
1. Connect to real APIs for data
2. Add user authentication
3. Implement push notifications
4. Add offline support with service workers
5. Integrate payment processing
6. Add real-time chat for therapy sessions
7. Implement video calling with WebRTC
8. Add analytics and tracking
