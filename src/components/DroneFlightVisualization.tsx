import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Environment } from '@react-three/drei';
import TerrainModel from './TerrainModel';
import FlightPath from './FlightPath';

// Types for the flight path data
export interface TrackPoint {
  latitude: number;
  longitude: number;
  altitude: number;
}

interface DroneFlightVisualizationProps {
  trackPoints: TrackPoint[];
  terrainResolution?: number; // in meters
  terrainExtent?: number; // in meters
}

const DroneFlightVisualization: React.FC<DroneFlightVisualizationProps> = ({
  trackPoints,
  terrainResolution = 1, // Default 10 meters resolution
  terrainExtent = 5000, // Default 100 meters in each direction
}) => {
  const controlsRef = useRef(null);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas
        camera={{ 
          position: [0, 80, 150], // Increased height for better overview
          fov: 50, // Reduced FOV for less distortion
          near: 0.1, 
          far: 10000 
        }}
        shadows
      >
        {/* Add Stats component for performance monitoring (can be removed in production) */}
        <Stats />
        
        {/* Ambient and directional light for better visualization */}
        <ambientLight intensity={0.5} />
        <directionalLight
          intensity={1.0}
          position={[100, 100, 100]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Add a second directional light from the opposite direction to reduce shadows */}
        <directionalLight
          intensity={0.5}
          position={[-100, 50, -100]}
        />
        
        {/* Environment lighting for better materials */}
        <Environment preset="sunset" />
        
        {/* Camera controls for interactive navigation */}
        <OrbitControls 
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={1000}
          target={[0, 0, 0]}
          minPolarAngle={0} // Allow looking from directly above
          maxPolarAngle={Math.PI / 2 - 0.1} // Restrict to just above horizon
        />
        
        {/* Terrain model */}
        <TerrainModel 
          trackPoints={trackPoints} 
          resolution={terrainResolution} 
          extent={terrainExtent}
        />
        
        {/* Flight path visualization */}
        <FlightPath trackPoints={trackPoints} />
        
        {/* Grid helper for reference */}
        <gridHelper args={[2000, 200]} position={[0, -0.01, 0]} />
      </Canvas>
    </div>
  );
};

export default DroneFlightVisualization; 