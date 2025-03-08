import './App.css'
import { TrackPoint } from './types/DroneTypes'
import AdvancedDroneVisualization from './components/AdvancedDroneVisualization'

function App() {
  // Sample drone flight path data
  const sampleTrackPoints: TrackPoint[] = [
    { latitude: 37.7749, longitude: -122.4194, altitude: 5 },
    { latitude: 37.7750, longitude: -122.4190, altitude: 20 },
    { latitude: 37.7752, longitude: -122.4185, altitude: 35 },
    { latitude: 37.7756, longitude: -122.4180, altitude: 50 },
    { latitude: 37.7760, longitude: -122.4175, altitude: 65 },
    { latitude: 37.7765, longitude: -122.4170, altitude: 80 },
    { latitude: 37.7770, longitude: -122.4165, altitude: 75 },
    { latitude: 37.7775, longitude: -122.4160, altitude: 85 },
    { latitude: 37.7780, longitude: -122.4155, altitude: 90 },
    { latitude: 37.7785, longitude: -122.4150, altitude: 70 },
    { latitude: 37.7790, longitude: -122.4145, altitude: 50 },
    { latitude: 37.7795, longitude: -122.4140, altitude: 30 },
  ]

  return (
    <div className="app-container">
      <div className="header">
        <h1>Advanced Drone Flight Path Visualization</h1>
        <p>Using Open-Elevation API for real terrain data</p>
      </div>
      
      <div className="visualization-container">
        <AdvancedDroneVisualization
          trackPoints={sampleTrackPoints} 
          bufferDistance={100} // 100 meters buffer around path
          terrainResolution={10} // 10 meter resolution for DTM
        />
      </div>
    </div>
  )
}

export default App
