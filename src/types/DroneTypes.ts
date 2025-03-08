/**
 * Represents a single point in the drone's flight path
 */
export interface TrackPoint {
  /**
   * The latitude coordinate of the drone position
   */
  latitude: number;
  
  /**
   * The longitude coordinate of the drone position
   */
  longitude: number;
  
  /**
   * The altitude of the drone in meters above sea level
   */
  altitude: number;
} 