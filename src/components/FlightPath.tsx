import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { TrackPoint } from '../types/DroneTypes';

interface FlightPathProps {
  trackPoints: TrackPoint[];
}

// Helper function to convert lat/long to x/y/z coordinates (same as in TerrainModel)
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

const FlightPath: React.FC<FlightPathProps> = ({ trackPoints }) => {
  const lineRef = useRef(null);
  const droneRef = useRef<THREE.Mesh>(null);
  
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
  
  // Convert track points to 3D coordinates
  const pathPoints = useMemo(() => {
    return trackPoints.map(point => 
      geoToCartesian(
        point.latitude, 
        point.longitude, 
        point.altitude, 
        centerPoint
      )
    );
  }, [trackPoints, centerPoint]);
  
  // Track animation progress
  const progressRef = useRef(0);
  
  // Animate the drone along the path
  useFrame((_, delta) => {
    if (droneRef.current && pathPoints.length > 1) {
      // Update the progress value (0-1 range)
      progressRef.current = (progressRef.current + delta * 0.1) % 1;
      
      // Get current position on the path based on progress
      const index = Math.floor(progressRef.current * (pathPoints.length - 1));
      const nextIndex = Math.min(index + 1, pathPoints.length - 1);
      const subProgress = progressRef.current * (pathPoints.length - 1) - index;
      
      // Interpolate between current and next point
      const currentPos = pathPoints[index];
      const nextPos = pathPoints[nextIndex];
      
      if (currentPos && nextPos) {
        const interpolatedPos = currentPos.clone().lerp(nextPos, subProgress);
        droneRef.current.position.copy(interpolatedPos);
        
        // Set rotation to face direction of travel
        if (index < pathPoints.length - 1) {
          const direction = nextPos.clone().sub(currentPos).normalize();
          const target = new THREE.Vector3(direction.x, 0, direction.z).normalize();
          const angle = Math.atan2(target.x, target.z);
          droneRef.current.rotation.y = angle;
        }
      }
    }
  });
  
  return (
    <group>
      {/* Flight path line using drei's Line component */}
      <Line
        ref={lineRef}
        points={pathPoints}
        color="#FF0000"
        lineWidth={2}
      />
      
      {/* Drone representation */}
      <mesh ref={droneRef} position={pathPoints[0]} castShadow>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#2196F3" />
        {/* Propeller representations */}
        <group position={[0, 0.5, 0]}>
          <mesh position={[1, 0, 1]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[-1, 0, 1]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[1, 0, -1]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[-1, 0, -1]}>
            <cylinderGeometry args={[0.5, 0.5, 0.1, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      </mesh>
      
      {/* Track point markers */}
      {pathPoints.map((point, index) => (
        <mesh key={index} position={point} scale={0.5}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#FFC107" />
        </mesh>
      ))}
    </group>
  );
};

export default FlightPath; 