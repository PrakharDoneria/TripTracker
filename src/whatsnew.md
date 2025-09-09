# What's New in TripTracker

This document highlights the major features and improvements added to the TripTracker application since the initial project setup (commit `08b7830`).

## Core User Experience & UI Enhancements

*   **Full Responsiveness**: The entire application has been optimized for a seamless experience on all devices, from mobile phones to desktops. UI components like the header, trip cards, and dashboard now adapt gracefully to different screen sizes.
*   **Live Location & Interactive Map**: The map view now displays your live GPS location with a distinct pin, providing real-time context. When creating a new trip, the map displays the full route from origin to destination as you type.
*   **Intuitive "New Trip" Page**: The "Add Trip" page has been redesigned to automatically detect your current location and set it as the origin, streamlining the trip logging process.
*   **Cleaner, AI-Focused Dashboard**: The dashboard has been redesigned to remove clutter and focus exclusively on your personal, AI-powered travel insights, such as frequent destinations, transportation modes, and proactive trip suggestions.
*   **Bug Fixes**: Addressed a bug where place search results would repeat, and fixed a server stability issue related to the map component.

## AI-Powered Features

We've integrated a powerful suite of AI features to make TripTracker an intelligent travel companion.

*   **AI Trip Suggestion**: The dashboard now features an AI-powered suggestion for your next trip. By analyzing your last five trips, the AI identifies your travel patterns and proactively recommends your next destination and purpose.
*   **Local Gem Discovery**: To help you discover authentic local experiences, the app now suggests a "hidden gem" (like a small café, unique shop, or viewpoint) near your trip's destination.
*   **Sustainable Recommendations**: The AI trip recommendation engine has been enhanced to prioritize sustainability. It now suggests eco-friendly modes of transport like walking, biking, or public transit by default.
*   **Assisted Data Capture**: AI-driven features to automatically detect your mode of transportation and provide contextual "nudges" to help complete trip details.
*   **CO₂ Emission Estimation**: The app automatically estimates the carbon footprint for each trip, promoting environmentally conscious travel.

## PWA & Mobile-First Features

*   **Installable PWA**: TripTracker is now a fully-fledged Progressive Web App (PWA). A button to "Install App" will appear on supported mobile devices, allowing you to add it to your home screen for easy access.
*   **Camera Integration**: You can now capture an image of your destination directly from your device's camera. The image is automatically compressed and saved with your trip details, using your browser's local storage.
*   **Vibration Alerts**: Mark a destination as a "nice place to visit," and your device will vibrate when you get close to it, providing a helpful real-time alert.

## Data & Functionality

*   **Data Export**: You can now export all your trip data as a single JSON file, fulfilling the data sharing requirement for NATPAC scientists.
*   **Expense Tracking**: A new field has been added to log expenses for each trip, helping you keep all your travel-related information in one place.
*   **Comprehensive README**: The project now includes a detailed `README.md` file that covers the app's vision, features, and technical stack.
