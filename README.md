# Advanced Drone Flight Path Visualization

This React application visualizes drone flight paths in 3D space, including buffered path polygons and Digital Terrain Models (DTM). It is built using React, TypeScript, Plotly.js for visualization, and Turf.js for geospatial operations.

## Features

- 3D visualization of drone flight paths
- Path buffering to create polygons around the flight path
- Digital Terrain Model (DTM) as a base layer with 10m resolution
- Grid point generation inside buffered polygons for terrain modeling
- Elevation sampling and interpolation for terrain visualization
- Interactive controls for exploring the terrain and flight path

## Requirements

- Node.js version 14.0.0 or higher
- npm version 6.0.0 or higher

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd 3dForUnit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Usage

The main component `AdvancedDroneVisualization` accepts the following props:

```typescript
interface AdvancedDroneVisualizationProps {
  trackPoints: TrackPoint[]; // Array of latitude, longitude, altitude points
  bufferDistance?: number; // Buffer distance in meters (default: 50)
  terrainResolution?: number; // Resolution of terrain in meters (default: 10)
}

interface TrackPoint {
  latitude: number;
  longitude: number;
  altitude: number;
}
```

### Example

```tsx
import AdvancedDroneVisualization from './components/AdvancedDroneVisualization';
import { TrackPoint } from './types/DroneTypes';

// Sample track data
const sampleTrackPoints: TrackPoint[] = [
  { latitude: 37.7749, longitude: -122.4194, altitude: 10 },
  { latitude: 37.7750, longitude: -122.4190, altitude: 20 },
  // ... more points
];

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <AdvancedDroneVisualization 
        trackPoints={sampleTrackPoints} 
        bufferDistance={50}
        terrainResolution={10}
      />
    </div>
  );
}
```

## Technical Implementation

- **Turf.js**: Used for GIS operations like creating buffered polygons and point grids
- **Plotly.js**: Used for 3D visualization of terrain, flight path, and buffer zones
- **Terrain Rendering**: 
  - Creates a grid of points within the buffered polygon
  - Gets elevation data for each point (simulated in this demo)
  - Interpolates missing elevation data
  - Renders as a 3D surface
- **Buffer Zone**: 
  - Applies buffer operation to the flight path using Turf.js
  - Visualizes the buffer area as a polygon overlay

## Integration with Elevation APIs

The current implementation uses simulated terrain data. To integrate with a real elevation API:

1. Replace the `getElevationData` function in `AdvancedDroneVisualization.tsx`
2. Implement API calls to services like:
   - Google Maps Elevation API
   - Mapbox Terrain API
   - Open-Elevation API

## Customization

You can customize the visualization by modifying the `AdvancedDroneVisualization.tsx` component, including:
- Buffer distance around the flight path
- Terrain resolution and generation algorithm
- Colors and styling of the flight path, terrain, and buffer zone
- Camera position and angle

## License

MIT
