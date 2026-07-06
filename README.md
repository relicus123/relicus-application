# Relicus - Mobile App

Relicus is a premium mobile-first web application combining mental health counselling, psychotherapy, entrance exam coaching, skill enhancement, one-to-one tuition, and mindfulness practices.

## Tech Stack

- **Framework:** [Expo](https://expo.dev/) & [React Native](https://reactnative.dev/)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling:** [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Animations:** [Moti](https://moti.fyi/) & React Native Reanimated
- **Icons:** [Lucide React Native](https://lucide.dev/)
- **Backend/Database:** [Supabase](https://supabase.com/)

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18 or newer recommended)
- npm, yarn, or pnpm
- [Expo Go](https://expo.dev/go) app on your physical device OR iOS Simulator/Android Emulator installed on your machine.

### Installation

1. Install the dependencies:

   ```bash
   npm install
   ```

### Running the App

Start the development server using Expo:

```bash
npm start
```
> [!NOTE]
> Previously you may have tried running `npx start` or `npm run dev`. These commands will not work for this project. Please use `npm start` which will run `expo start` under the hood.

This command will start the Metro bundler and provide a QR code in your terminal.

- **To run on a physical device:** Open the Expo Go app on your iOS or Android device and scan the QR code.
- **To run on an Android Emulator:** Press `a` in the terminal.
- **To run on an iOS Simulator (Mac only):** Press `i` in the terminal.
- **To run in a web browser:** Press `w` in the terminal, or run `npm run web`.

## Project Structure

- `app/`: Contains the Expo Router file-based routing.
- `components/`: Reusable React components (Buttons, Cards, Inputs, etc.).
- `constants/`: Theme colors, typography, and other constant values.
- `lib/`: Utility functions and integrations (e.g., Supabase client).
- `store/`: Zustand state management stores.
- `assets/`: Images, fonts, and other static files.

## Application Flow & Features

- **Onboarding:** Splash screens, carousel, and OTP verification.
- **Home:** Main dashboard featuring all services.
- **Sessions:** Client dashboard for mood tracking and upcoming tasks.
- **Learning:** Entrance coaching, mock tests, and student/teacher dashboards.
- **Counselling:** Therapist directory, scheduling, and video calling.
- **Wellness:** Mindfulness practices including meditation and yoga.

## Additional Documentation

For more detailed information on the design patterns, application flow, and color systems, please refer to the following files in the project root:

- `RELICUS_GUIDE.md`: Comprehensive guide to the UI, screens, and features.
- `Entrance Coaching User Flow.md`
- `Skill Enhancement User Flow.md`

## Next Steps / Roadmap

- Connect to real APIs for data
- Add user authentication (e.g., via Supabase)
- Implement push notifications
- Integrate payment processing
- Implement video calling with WebRTC