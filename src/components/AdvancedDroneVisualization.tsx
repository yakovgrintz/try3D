import React, { useMemo, useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import * as Plotly from 'plotly.js';
import * as turf from '@turf/turf';
import { TrackPoint } from '../types/DroneTypes';

interface AdvancedDroneVisualizationProps {
  trackPoints: TrackPoint[];
  bufferDistance?: number; // Buffer distance in meters
  terrainResolution?: number; // in meters
}

// Structure for elevation query response
interface OpenElevationResponse {
  results: {
    latitude: number;
    longitude: number;
    elevation: number;
  }[];
}

/**
 * Advanced drone visualization component that shows:
 * 1. Terrain (DTM) as base layer
 * 2. Drone track as a path
 * 3. Buffered polygon overlay
 */
const AdvancedDroneVisualization: React.FC<AdvancedDroneVisualizationProps> = ({
  trackPoints,
  bufferDistance = 150, // Default 150 meters buffer
  terrainResolution = 10, // Default 10 meters resolution
}) => {
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elevationData, setElevationData] = useState<Array<{
    longitude: number;
    latitude: number;
    elevation: number;
  }>>([]);

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

  // Convert track points to GeoJSON LineString
  const trackLineString = useMemo(() => {
    const coordinates = trackPoints.map(point => [point.longitude, point.latitude]);
    return turf.lineString(coordinates);
  }, [trackPoints]);

  // Create buffered polygon from track
  const bufferedPolygon = useMemo(() => {
    if (!trackLineString) return null;
    
    // Buffer distance in degrees (roughly convert meters to degrees)
    // 111,320 meters = 1 degree at the equator
    const bufferDistanceDegrees = bufferDistance / 111320;
    
    // Apply buffer operation with non-null assertion for TypeScript
    return turf.buffer(trackLineString, bufferDistanceDegrees, { units: 'degrees' });
  }, [trackLineString, bufferDistance]);

  // Generate grid of points inside the buffered polygon
  const gridPoints = useMemo(() => {
    if (!bufferedPolygon) return { type: 'FeatureCollection', features: [] };
    
    // Get bounding box of buffered polygon
    const bbox = turf.bbox(bufferedPolygon);
    
    // Convert resolution from meters to degrees
    const resolutionDegrees = terrainResolution / 111320;
    
    // Create point grid
    const pointGrid = turf.pointGrid(bbox, resolutionDegrees, { units: 'degrees' });
    
    // Filter to only include points inside the buffer
    const pointsInside = turf.pointsWithinPolygon(pointGrid, bufferedPolygon);
    
    return pointsInside;
  }, [bufferedPolygon, terrainResolution]);

  // Fetch elevation data from Open-Elevation API
  useEffect(() => {
    if (!gridPoints.features.length) return;
    
    const fetchElevationData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        // Prepare the query for Open-Elevation API
        // The API accepts a batch of coordinates in a single request
        const locations = gridPoints.features.map(feature => {
          const coordinates = feature.geometry.coordinates;
          return {
            latitude: coordinates[1],
            longitude: coordinates[0]
          };
        });
        
        // Fetch in batches to avoid overwhelming the API 
        // Open-Elevation might have limits on request size
        const BATCH_SIZE = 100;
        let allResults: Array<{
          longitude: number;
          latitude: number;
          elevation: number;
        }> = [];
        
        // Process in batches
        for (let i = 0; i < locations.length; i += BATCH_SIZE) {
          const batchLocations = locations.slice(i, i + BATCH_SIZE);
          
          // Make API request to Open-Elevation
          const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ locations: batchLocations }),
          });
          
          if (!response.ok) {
            throw new Error(`Elevation API responded with status: ${response.status}`);
          }
          
          const data: OpenElevationResponse = await response.json();
          allResults = [...allResults, ...data.results];
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setElevationData(allResults);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching elevation data:', error);
        setErrorMessage('Failed to fetch elevation data. Using simulated terrain instead.');
        setIsLoading(false);
        
        // Fall back to simulated data if API fails
        const simulatedData = gridPoints.features.map(feature => {
          const coordinates = feature.geometry.coordinates;
          const lng = coordinates[0] as number;
          const lat = coordinates[1] as number;
          
          // Simulate terrain using sine waves as fallback
          const x = (lng - centerPoint.longitude) * 111320;
          const y = (lat - centerPoint.latitude) * 111320;
          
          // Generate elevation using multiple frequencies
          const elevation = 
            Math.sin(x * 0.005) * Math.cos(y * 0.005) * 30 +  // Large features
            Math.sin(x * 0.02) * Math.cos(y * 0.02) * 10 +   // Medium features
            Math.sin(x * 0.05) * Math.cos(y * 0.05) * 5;     // Small details
          
          return {
            longitude: lng,
            latitude: lat,
            elevation: elevation
          };
        });
        
        setElevationData(simulatedData);
      }
    };
    
    fetchElevationData();
  }, [gridPoints, centerPoint]);

  // Convert geographical coordinates to relative coordinates for visualization
  const convertToRelativeCoords = (
    lng: number, 
    lat: number, 
    elev: number = 0
  ) => {
    // Scale is rough meters per degree at the equator
    const scale = 111320;
    
    const x = (lng - centerPoint.longitude) * scale;
    const y = (lat - centerPoint.latitude) * scale;
    return { x, y, z: elev };
  };

  // Extract flight path in relative coordinates
  const flightPath = useMemo(() => {
    return trackPoints.map(point => {
      const { x, y } = convertToRelativeCoords(point.longitude, point.latitude);
      return { x, y, z: point.altitude };
    });
  }, [trackPoints, centerPoint]);

  // Extract buffered polygon outline in relative coordinates
  const bufferOutline = useMemo(() => {
    if (!bufferedPolygon) return [];
    
    // Get the first polygon (in case of multi-polygon)
    const coordinates = bufferedPolygon.geometry.coordinates[0];
    
    return coordinates.map(coord => {
      // Type assertion to make TypeScript happy
      const lng = coord[0] as number;
      const lat = coord[1] as number;
      const { x, y } = convertToRelativeCoords(lng, lat);
      return { x, y, z: 0 }; // Set z to 0 for the outline
    });
  }, [bufferedPolygon, centerPoint]);

  // Prepare terrain data for visualization
  const terrainData = useMemo(() => {
    if (!elevationData.length) return { x: [], y: [], z: [[]] };

    // Sort points by latitude and longitude for visualization
    const points = elevationData.map(p => ({
      ...p,
      relCoords: convertToRelativeCoords(p.longitude, p.latitude, p.elevation)
    }));

    // Get unique x and y values
    const uniqueX = Array.from(new Set(points.map(p => p.relCoords.x))).sort((a, b) => a - b);
    const uniqueY = Array.from(new Set(points.map(p => p.relCoords.y))).sort((a, b) => a - b);

    // Create 2D grid for z values
    const zGrid: number[][] = [];
    for (let i = 0; i < uniqueY.length; i++) {
      zGrid[i] = [];
      for (let j = 0; j < uniqueX.length; j++) {
        // Find point with matching coordinates or use interpolation
        const matchingPoint = points.find(
          p => p.relCoords.x === uniqueX[j] && p.relCoords.y === uniqueY[i]
        );
        
        if (matchingPoint) {
          zGrid[i][j] = matchingPoint.relCoords.z;
        } else {
          // For missing points, use a simple average of neighbors
          // In a real app, you'd use proper interpolation (e.g., Delaunay triangulation)
          const nearbyPoints = points.filter(
            p => Math.abs(p.relCoords.x - uniqueX[j]) < terrainResolution * 2 && 
                 Math.abs(p.relCoords.y - uniqueY[i]) < terrainResolution * 2
          );
          
          if (nearbyPoints.length > 0) {
            const avgElevation = nearbyPoints.reduce((sum, p) => sum + p.relCoords.z, 0) / nearbyPoints.length;
            zGrid[i][j] = avgElevation;
          } else {
            zGrid[i][j] = 0; // Fallback value
          }
        }
      }
    }

    return {
      x: uniqueX,
      y: uniqueY,
      z: zGrid
    };
  }, [elevationData, terrainResolution, centerPoint]);

  // Create data for Plotly visualization
  const data: Plotly.Data[] = [
    // Terrain surface (DTM)
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
    // Drone flight path
    {
      type: 'scatter3d' as const,
      mode: 'lines',
      x: flightPath.map(p => p.x),
      y: flightPath.map(p => p.y),
      z: flightPath.map(p => p.z),
      line: {
        color: 'red',
        width: 5
      },
      name: 'Flight Path',
    },
    // Drone position markers
    {
      type: 'scatter3d' as const,
      mode: 'markers',
      x: flightPath.map(p => p.x),
      y: flightPath.map(p => p.y),
      z: flightPath.map(p => p.z),
      marker: {
        size: 5,
        color: 'blue',
      },
      name: 'Drone Position',
      text: trackPoints.map((point, index) => 
        `Point ${index + 1}<br>` +
        `Latitude: ${point.latitude.toFixed(6)}<br>` +
        `Longitude: ${point.longitude.toFixed(6)}<br>` + 
        `Altitude: ${point.altitude}m`
      ),
      hoverinfo: 'text' as const,
    },
    // Buffered polygon outline
    {
      type: 'scatter3d' as const,
      mode: 'lines',
      x: bufferOutline.map(p => p.x),
      y: bufferOutline.map(p => p.y),
      z: bufferOutline.map(p => p.z).map(() => 1), // Slightly above terrain
      line: {
        color: 'rgba(0, 128, 0, 0.7)',
        width: 3
      },
      name: 'Buffer Zone',
    }
  ];

  // Layout configuration for Plotly
  const layout: Partial<Plotly.Layout> = {
    title: 'Drone Flight Path with Buffered Zone',
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

  // Configuration for Plotly
  const config: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true
  };

  return (
    <div className="plotly-visualization-container">
      {isLoading && <div className="loading-indicator">Loading terrain data...</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
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

export default AdvancedDroneVisualization; 