# Oslo Transit Tracker

A real-time public transport tracker for Oslo, built with React, TypeScript, and the [Entur](https://developer.entur.org/) GraphQL API.

![CI](https://github.com/zakihufhsnbjk/oslo-transit-tracker/actions/workflows/ci.yml/badge.svg)

## Features

- 🔍 Stop search powered by the Entur Geocoder API
- 🚌 Live departures with countdown timers ("2 min", "Now")
- 🎨 Colour-coded line badges matching Ruter transport modes
- 🗺️ Interactive map with OpenStreetMap and Leaflet
- 🗓️ Journey planner with route polyline rendering
- ⭐ Favourite stops with persistent local storage
- 🔗 Shareable URLs per stop
- 📍 Nearby stops via geolocation
- ⚡ Auto-refresh every 20 seconds

## Tech Stack

- **React 18** + **TypeScript**
- **Vite**
- **Leaflet** + **React-Leaflet** for maps
- **Entur Journey Planner v3** (GraphQL)
- **Entur Geocoder v1** (stop search)
- GitHub Actions CI (type check + lint on every push)

## Getting Started

```bash
## Data Sources

- [Entur Journey Planner API](https://developer.entur.org/pages-journey-planner-journey-planner-v3)
- [Entur Geocoder API](https://developer.entur.org/pages-geocoder-api)
- Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
