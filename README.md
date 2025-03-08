# Advanced Drone Flight Path Visualization

This React application visualizes drone flight paths in 3D space, including buffered path polygons and Digital Terrain Models (DTM). It is built using React, TypeScript, Plotly.js for visualization, and Turf.js for geospatial operations.

## Features

- 3D visualization of drone flight paths
- Path buffering to create polygons around the flight path
- Digital Terrain Model (DTM) as a base layer with 10m resolution
- Grid point generation inside buffered polygons for terrain modeling
- Elevation sampling from Open-Elevation API
- Interpolation for terrain visualization
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
  bufferDistance?: number; // Buffer distance in meters (default: 150)
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
        bufferDistance={100}
        terrainResolution={10}
      />
    </div>
  );
}
```

## Technical Implementation

- **Turf.js**: Used for GIS operations like creating buffered polygons and point grids
- **Plotly.js**: Used for 3D visualization of terrain, flight path, and buffer zones
- **Open-Elevation API**: Fetches real-world elevation data for the terrain
- **Terrain Rendering**: 
  - Creates a grid of points within the buffered polygon
  - Gets elevation data for each point from Open-Elevation API
  - Interpolates missing elevation data
  - Renders as a 3D surface
- **Buffer Zone**: 
  - Applies buffer operation to the flight path using Turf.js
  - Visualizes the buffer area as a polygon overlay

## Deployment Instructions

### Deploying to Vercel

This project includes a `vercel.json` configuration file for easy deployment to Vercel:

1. Create a Vercel account at [vercel.com](https://vercel.com) if you don't have one
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```
4. Deploy the project:
   ```bash
   vercel
   ```
5. For production deployment:
   ```bash
   vercel --prod
   ```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments:

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Import the repository in the Vercel dashboard
3. Configure build settings (should be detected automatically)
4. Deploy

### Environment Variables

If you're using your own API keys, you can configure them as environment variables in Vercel:

1. In the Vercel dashboard, go to your project settings
2. Navigate to the "Environment Variables" section
3. Add your API keys and other configuration variables

## Customization

You can customize the visualization by modifying the `AdvancedDroneVisualization.tsx` component, including:
- Buffer distance around the flight path
- Terrain resolution and generation algorithm
- Colors and styling of the flight path, terrain, and buffer zone
- Camera position and angle

## License

MIT
