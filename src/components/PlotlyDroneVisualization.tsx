import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import * as Plotly from 'plotly.js';
import { TrackPoint } from '../types/DroneTypes';

interface PlotlyDroneVisualizationProps {
  trackPoints: TrackPoint[];
  terrainResolution?: number; // in meters
  terrainExtent?: number; // in meters
}

const PlotlyDroneVisualization: React.FC<PlotlyDroneVisualizationProps> = ({
  trackPoints,
  terrainResolution = 5, // Default 5 meters resolution
  terrainExtent = 120, // Default 120 meters in each direction
}) => {
  // Skip if no track points are provided
  if (!trackPoints.length) return <div>No track points provided</div>;

  // Calculate the center point of the track for positioning
  const centerPoint = useMemo(() => {
    const sumLat = trackPoints.reduce((sum, point) => sum + point.latitude, 0);
    const sumLng = trackPoints.reduce((sum, point) => sum + point.longitude, 0);
    return {
      latitude: sumLat / trackPoints.length,
      longitude: sumLng / trackPoints.length
    };
  }, [trackPoints]);

  // Extract coordinates for the flight path
  const flightCoordinates = useMemo(() => {
    // Convert to relative coordinates for better visualization
    const scale = 111000; // rough meters per degree at equator
    
    return trackPoints.map(point => ({
      x: (point.longitude - centerPoint.longitude) * scale,
      y: (point.latitude - centerPoint.latitude) * scale,
      z: point.altitude
    }));
  }, [trackPoints, centerPoint]);

  // Generate terrain data
  const terrainData = useMemo(() => {
    const size = Math.ceil(terrainExtent * 2 / terrainResolution);
    const halfSize = size / 2;
    
    // Create a grid of x, y coordinates
    const x: number[] = [];
    const y: number[] = [];
    const z: number[][] = [];
    
    for (let i = 0; i < size; i++) {
      z[i] = [];
      const yPos = (i - halfSize) * terrainResolution;
      
      for (let j = 0; j < size; j++) {
        const xPos = (j - halfSize) * terrainResolution;
        
        // Add to the x, y arrays (only once per row/column)
        if (i === 0) x.push(xPos);
        if (j === 0) y.push(yPos);
        
        // Generate terrain height using multiple frequencies for realism
        const height = 
          // Large hills
          Math.sin(xPos * 0.01) * Math.cos(yPos * 0.01) * 30 +
          // Medium features
          Math.sin(xPos * 0.05 + 0.5) * Math.cos(yPos * 0.05 + 0.5) * 10 +
          // Small details
          Math.sin(xPos * 0.2 + 1.0) * Math.cos(yPos * 0.2 + 1.0) * 3;
          
        z[i][j] = height;
      }
    }
    
    return { x, y, z };
  }, [terrainResolution, terrainExtent]);

  // Create data for the Plotly chart
  const data: Plotly.Data[] = [
    // Terrain surface
    {
      type: 'surface' as const,
      x: terrainData.x,
      y: terrainData.y,
      z: terrainData.z,
      colorscale: 'Earth',
      showscale: false,
      name: 'Terrain',
      opacity: 0.9,
      hoverinfo: 'none' as const,
    },
    // Flight path line
    {
      type: 'scatter3d' as const,
      mode: 'lines',
      x: flightCoordinates.map(coord => coord.x),
      y: flightCoordinates.map(coord => coord.y),
      z: flightCoordinates.map(coord => coord.z),
      line: {
        color: 'red',
        width: 5
      },
      name: 'Flight Path',
    },
    // Drone points with markers
    {
      type: 'scatter3d' as const,
      mode: 'markers',
      x: flightCoordinates.map(coord => coord.x),
      y: flightCoordinates.map(coord => coord.y),
      z: flightCoordinates.map(coord => coord.z),
      marker: {
        size: 8,
        color: 'blue',
        symbol: 'circle',
      },
      name: 'Drone Position',
      text: trackPoints.map((point, index) => 
        `Point ${index + 1}<br>` +
        `Latitude: ${point.latitude.toFixed(6)}<br>` +
        `Longitude: ${point.longitude.toFixed(6)}<br>` + 
        `Altitude: ${point.altitude}m`
      ),
      hoverinfo: 'text' as const,
    }
  ];

  // Layout configuration
  const layout: Partial<Plotly.Layout> = {
    title: 'Drone Flight Path Visualization',
    autosize: true,
    height: 800,
    scene: {
      aspectmode: 'data' as const,
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.2 },
        up: { x: 0, y: 0, z: 1 }
      },
      xaxis: {
        title: 'East-West Distance (m)',
        showgrid: true,
        zeroline: true,
      },
      yaxis: {
        title: 'North-South Distance (m)',
        showgrid: true,
        zeroline: true,
      },
      zaxis: {
        title: 'Altitude (m)',
        showgrid: true,
        zeroline: true,
      }
    },
    margin: {
      l: 65,
      r: 50,
      b: 65,
      t: 90,
    }
  };

  // Responsive config
  const config: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true
  };

  return (
    <div className="plotly-visualization-container">
      <Plot
        data={data}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default PlotlyDroneVisualization; 