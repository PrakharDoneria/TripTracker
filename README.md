# TripTracker - Intelligent Travel Companion

TripTracker is a modern, responsive web application designed to help users log, manage, and analyze their travel patterns. Built with Next.js, React, and Tailwind CSS, it offers a seamless experience on both desktop and mobile devices. The app integrates powerful AI features through Genkit to provide smart assistance, making it more than just a trip logger—it's an intelligent travel companion.

This project was developed to address the need for accurate transportation data collection, as outlined by NATPAC, to aid in urban and transportation planning.

## Core Features

*   **Trip Logging**: Easily record your trips with details like origin, destination, mode of transport, purpose, number of companions, and personal notes.
*   **Interactive Map View**: Visualize your trips and live location on an interactive map powered by Geoapify.
*   **Trip Chain**: All your trips are organized in a chronological "trip chain" on the main dashboard, giving you a clear overview of your travel history.
*   **Edit & Delete Trips**: Full control over your data with options to edit or delete any trip entry.
*   **Travel Dashboard**: A dedicated dashboard page provides insights into your travel habits, including your most frequent destinations and a breakdown of transportation modes used.
*   **User Consent**: The app ensures user privacy by requesting consent for data collection upon the first visit.

## AI-Powered Intelligence

TripTracker leverages Generative AI to provide a smarter user experience:

*   **Assisted Data Capture**: Automatically detect the user's mode of transportation using sensor data mocks.
*   **AI Trip Recommendations**: Get intelligent suggestions for the best mode of transport based on trip purpose, traffic, and weather conditions.
*   **Contextual Nudges**: If you're unsure where you're headed, the app can provide a "travel nudge" with suggestions based on your recent destinations and current location.
*   **CO₂ Emission Estimation**: Automatically calculates the estimated carbon footprint (in grams of CO₂e) for each trip, promoting environmentally conscious travel choices.

## Mobile & PWA Features

The application is designed to be mobile-first and can be installed on your phone as a Progressive Web App (PWA).

*   **Installable**: An "Install App" button appears on supported devices, allowing you to add TripTracker to your home screen for easy access.
*   **Camera Integration**: Capture an image of your destination directly from your device's camera and save it with your trip details. The image is compressed to save space in browser storage.
*   **Vibration Alerts**: Mark a destination as a "nice place to visit," and your device will vibrate when you get close to it, providing a helpful, real-time alert.
*   **Offline Access**: As a PWA, the app can be used even without an internet connection.

## Our Vision: A Smarter, More Connected Travel Ecosystem

### For Travelers
Imagine carrying not just a ticket and a map, but a personal travel companion in your pocket. The app transforms scattered details—bookings, routes, expenses, memories—into a seamless journey.

### For Travel Agencies & Service Providers
The app acts like a window into the traveler’s mind. By understanding preferences and patterns, it enables providers to offer hyper-personalized experiences. This makes services more personal and less transactional—turning one-time tourists into loyal travelers.

### For Local Communities
A small café in a remote town or a hidden homestay gains visibility. Instead of tourists clustering in overcrowded hotspots, the app helps authentic local gems get discovered, spreading the economic benefits of tourism more evenly.

## Benefits of TripTracker

### Socio-Economic Benefits

*   **Democratizing Travel**: By capturing trip data and personalizing recommendations, the app helps travelers explore within their budget—whether it’s luxury escapes or backpacking routes.
*   **Smarter Policies, Smarter Cities**: With aggregated trip data, governments can see where infrastructure is failing, where tourists drop off, or which destinations need promotion. Tourism becomes a data-driven ecosystem, not a guessing game.

### Environmental Benefits

*   **Making Sustainability the Default, Not the Exception**: Instead of presenting eco-friendly choices as an “option,” the app prioritizes greener routes, carpooling suggestions, or low-carbon accommodations.
*   **Balancing Tourism Pressure**: With real-time trip insights, the app can help redirect crowds to lesser-known areas, giving nature a breather and keeping travel experiences fresh.


## Getting Started

This is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Running the Development Server

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
