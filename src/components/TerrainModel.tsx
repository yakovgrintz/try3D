import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TrackPoint } from './DroneFlightVisualization';

interface TerrainModelProps {
  trackPoints: TrackPoint[];
  resolution: number; // in meters
  extent: number; // in meters
}

// Helper function to convert lat/long to x/y/z coordinates
const geoToCartesian = (
  latitude: number, 
  longitude: number, 
  altitude: number,
  center: { latitude: number; longitude: number }
): THREE.Vector3 => {
  // Simple conversion for demonstration
  // In a real app, you'd use proper geo-coordinate transformations
  const scale = 111000; // rough meters per degree at equator
  const x = (longitude - center.longitude) * scale;
  const z = (latitude - center.latitude) * scale;
  return new THREE.Vector3(x, altitude, z);
};

// Improved terrain generation with more variance
const generateTerrainData = (
  centerLat: number,
  centerLng: number,
  resolution: number,
  extent: number,
): number[][] => {
  const size = Math.ceil(extent * 2 / resolution);
  const terrain: number[][] = [];
  
  // Create a grid of heights with more variation
  for (let z = 0; z < size; z++) {
    terrain[z] = [];
    for (let x = 0; x < size; x++) {
      // More dramatic terrain with multiple frequencies
      const xPos = (x - size / 2) * resolution;
      const zPos = (z - size / 2) * resolution;
      
      // Combine multiple frequencies for more realistic terrain
      const height = 
        // Large hills
        Math.sin(xPos * 0.01) * Math.cos(zPos * 0.01) * 30 +
        // Medium features
        Math.sin(xPos * 0.05 + 0.5) * Math.cos(zPos * 0.05 + 0.5) * 10 +
        // Small details
        Math.sin(xPos * 0.2 + 1.0) * Math.cos(zPos * 0.2 + 1.0) * 3;
        
      terrain[z][x] = height;
    }
  }
  
  return terrain;
};

const TerrainModel: React.FC<TerrainModelProps> = ({ trackPoints, resolution, extent }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Skip if no track points are provided
  if (!trackPoints.length) return null;
  
  // Calculate the center point of the track for positioning
  const centerPoint = useMemo(() => {
    const sumLat = trackPoints.reduce((sum, point) => sum + point.latitude, 0);
    const sumLng = trackPoints.reduce((sum, point) => sum + point.longitude, 0);
    return {
      latitude: sumLat / trackPoints.length,
      longitude: sumLng / trackPoints.length
    };
  }, [trackPoints]);
  
  // Generate terrain data
  const terrainData = useMemo(() => {
    return generateTerrainData(
      centerPoint.latitude,
      centerPoint.longitude,
      resolution,
      extent
    );
  }, [centerPoint, resolution, extent]);
  
  // Create the terrain geometry
  const geometry = useMemo(() => {
    const size = terrainData.length;
    const geo = new THREE.PlaneGeometry(
      extent * 2, 
      extent * 2, 
      size - 1, 
      size - 1
    );
    
    // Apply height data to vertices
    const positionAttribute = geo.getAttribute('position');
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        const index = z * size + x;
        // Set Y (height) value of each vertex
        positionAttribute.setY(index, terrainData[z][x]);
      }
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [terrainData, extent]);
  
  // Add some subtle animation to make it look more dynamic
  useFrame((state) => {
    if (meshRef.current) {
      // Optional: add subtle animation or effects
    }
  });
  
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -5, 0]} // Raised the terrain position to be more visible
      receiveShadow
    >
      <meshStandardMaterial
        color="#4B7F52"
        wireframe={false}
        roughness={0.8}
        metalness={0.2}
        side={THREE.DoubleSide}
        // Add some displacement to further enhance terrain details
        displacementScale={5}
      />
    </mesh>
  );
};

export default TerrainModel; 