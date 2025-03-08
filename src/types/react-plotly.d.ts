declare module 'react-plotly.js' {
  import * as Plotly from 'plotly.js';
  import * as React from 'react';

  interface PlotParams {
    data?: Array<Plotly.Data>;
    layout?: Partial<Plotly.Layout>;
    frames?: Array<Partial<Plotly.Frame>>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
    onSelected?: (event: Plotly.PlotSelectionEvent) => void;
    onDeselect?: () => void;
    onSelecting?: (event: Plotly.PlotSelectionEvent) => void;
    onRestyle?: (data: any) => void;
    onRelayout?: (data: any) => void;
    onRedraw?: () => void;
    onHover?: (data: any) => void;
    onUnhover?: (data: any) => void;
    onClickAnnotation?: (data: any) => void;
    onClick?: (data: any) => void;
    onDoubleClick?: (data: any) => void;
    onLegendClick?: (data: any) => boolean;
    onLegendDoubleClick?: (data: any) => boolean;
    onSliderChange?: (data: any) => void;
    onSliderEnd?: (data: any) => void;
    onSliderStart?: (data: any) => void;
    onAfterExport?: () => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: { name: string; frame: Plotly.Frame; animation: { frame: { duration: number } } }) => void;
    onBeforeExport?: () => void;
    onButtonClicked?: (data: any) => void;
    onWebglContextLost?: (event: any) => void;
    onAutoSize?: () => void;
    divId?: string;
  }

  export default class Plot extends React.Component<PlotParams> {}
} 