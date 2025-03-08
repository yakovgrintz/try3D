declare module 'd3-delaunay' {
  export class Delaunay<P = [number, number]> {
    points: Float64Array;
    halfedges: Int32Array;
    hull: Int32Array;
    triangles: Int32Array;
    
    constructor(points: ArrayLike<P>);
    
    find(x: number, y: number, i?: number): number;
    neighbors(i: number): IterableIterator<number>;
    render(context?: CanvasRenderingContext2D): this;
    renderHull(context?: CanvasRenderingContext2D): this;
    renderTriangle(i: number, context?: CanvasRenderingContext2D): this;
    renderPoints(context?: CanvasRenderingContext2D, r?: number): this;
    voronoi(bounds?: [number, number, number, number]): Voronoi<P>;
    update(): this;
  }
  
  export class Voronoi<P = [number, number]> {
    delaunay: Delaunay<P>;
    circumcenters: Float64Array;
    vectors: Float64Array;
    
    constructor(delaunay: Delaunay<P>, bounds?: [number, number, number, number]);
    
    render(context?: CanvasRenderingContext2D): this;
    renderBounds(context?: CanvasRenderingContext2D): this;
    renderCell(i: number, context?: CanvasRenderingContext2D): this;
    cellPolygons(): IterableIterator<[number, number][]>;
    cellPolygon(i: number): [number, number][];
    update(): this;
  }
} 