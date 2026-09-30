# Localink Build 001

Foundation for the first working Localink application.

## Architecture
- Mobile: React Native with Expo
- Web/admin: Next.js
- Backend: Supabase and PostgreSQL
- Maps: Mapbox
- Video/live: Mux
- Notifications: FCM and Apple Push

## Core navigation
Home, Explore, Map, Communities, Messages, Events, Marketplace, Live, Profile.

## First user flow
Create Account -> Username -> Profile -> Location -> Interests -> Privacy -> Follow Suggestions -> Home

## Product rules
- Approximate location by default.
- Precise location only with permission and when needed.
- Background location off by default.
- Users control location audience.
- Private Circles cannot override member sharing choices.
- Paid group membership revenue goes to the group creator. Platform charges 5% on creator withdrawal.
- Roll Call supports country, state, city, and local representation.
- Dedicated areas support reconnecting with people and missing-person notices.
- Inactivity handling must include advance notices and compliant handling of any stored balance before account deletion.

## Build sequence
1. Project workspace and design tokens
2. Authentication and onboarding
3. Profiles and privacy
4. Main navigation
5. Feed and posting
6. Communities and paid groups
7. Messaging
8. Local discovery and map
9. Events and marketplace
10. Live and creator tools
