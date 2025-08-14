import * as fabric from 'fabric';

export interface ShapeProperties {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  borderRadius?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
}

export interface ShapeConfig {
  centerX: number;
  centerY: number;
  properties?: ShapeProperties;
  width?: number;
  height?: number;
  fill?: string;
  left?: number;
  top?: number;
  cornerRadius?: number;
}

export const createRectangle = (config: ShapeConfig): fabric.Rect => {
  const { centerX, centerY, properties } = config;
  return new fabric.Rect({
    left: centerX - 50,
    top: centerY - 50,
    width: 100,
    height: 100,
    fill: properties?.fill || '#ff6b6b',
    selectable: true,
    stroke: properties?.stroke || '#000000',
    strokeWidth: properties?.strokeWidth || 0,
    opacity: properties?.opacity || 1,
    rx: properties?.borderRadius || 0,
    ry: properties?.borderRadius || 0,
  });
};

export const createRoundedRectangle = (config: ShapeConfig): fabric.Rect => {
  const { centerX, centerY, properties } = config;
  
  // Use fabric.Rect with rx/ry for proper corner radius that doesn't distort
  return new fabric.Rect({
    left: centerX - 100,  // Half of width (200/2)
    top: centerY - 50,    // Half of height (100/2)
    width: 200,
    height: 100,
    rx: 25,  // Corner radius X - this won't distort when scaling
    ry: 25,  // Corner radius Y - this won't distort when scaling
    fill: properties?.fill || '#8B5CF6',
    selectable: true,
    stroke: properties?.stroke || '#000000',
    strokeWidth: properties?.strokeWidth || 0,
    opacity: properties?.opacity || 1,
  });
};

export const createCircle = (config: ShapeConfig): fabric.Circle => {
  const { centerX, centerY, properties } = config;
  return new fabric.Circle({
    left: centerX - 50,
    top: centerY - 50,
    radius: 50,
    fill: properties?.fill || '#4ecdc4',
    selectable: true,
    stroke: properties?.stroke || '#000000',
    strokeWidth: properties?.strokeWidth || 0,
    opacity: properties?.opacity || 1,
  });
};

export const createTriangle = (config: ShapeConfig): fabric.Polygon => {
  const { centerX, centerY, properties } = config;
  const trianglePoints = [
    { x: 0, y: -50 },
    { x: -43.3, y: 25 },
    { x: 43.3, y: 25 },
  ];
  return new fabric.Polygon(trianglePoints, {
    left: centerX,
    top: centerY,
    fill: properties?.fill || '#10B981',
    selectable: true,
    stroke: properties?.stroke || '#000000',
    strokeWidth: properties?.strokeWidth || 0,
    opacity: properties?.opacity || 1,
  });
};

export const createStar = (config: ShapeConfig): fabric.Polygon => {
  const { centerX, centerY, properties } = config;
  const starPoints = [];
  const outerRadius = 50;
  const innerRadius = 25;
  const spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    starPoints.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }
  return new fabric.Polygon(starPoints, {
    left: centerX,
    top: centerY,
    fill: properties?.fill || '#F59E0B',
    selectable: true,
    stroke: properties?.stroke || '#000000',
    strokeWidth: properties?.strokeWidth || 0,
    opacity: properties?.opacity || 1,
  });
};

export const createText = (config: ShapeConfig): fabric.Textbox => {
  const { centerX, centerY, properties } = config;
  return new fabric.Textbox(properties?.text || 'Text', {
    left: centerX,
    top: centerY,
    fontSize: properties?.fontSize || 20,
    fill: properties?.fill || '#000000',
    selectable: true,
    fontFamily: properties?.fontFamily || 'Arial',
    fontWeight: properties?.fontWeight || 'normal',
    fontStyle: properties?.fontStyle || 'normal',
    textAlign: properties?.textAlign || 'left',
    width: 200,
    editable: true,
  });
};

export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star' | 'text' | 'rounded-rectangle';

export const createShape = (shapeType: ShapeType, config: ShapeConfig): fabric.Object => {
  switch (shapeType) {
    case 'rounded-rectangle':
      return createRoundedRectangle(config);
    case 'rect':
      return createRectangle(config);
    case 'circle':
      return createCircle(config);
    case 'triangle':
      return createTriangle(config);
    case 'star':
      return createStar(config);
    case 'text':
      return createText(config);
    default:
      throw new Error(`Unsupported shape type: ${shapeType}`);
  }
};

export const duplicateObject = (obj: fabric.Object, offsetX: number = 20, offsetY: number = 20): fabric.Object | null => {
  const newId = Date.now().toString();
  let newObject: fabric.Object;

  if (obj instanceof fabric.Rect) {
    newObject = new fabric.Rect({
      left: (obj.left || 0) + offsetX,
      top: (obj.top || 0) + offsetY,
      width: obj.width,
      height: obj.height,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      rx: obj.rx,
      ry: obj.ry,
      selectable: true,
    });
  } else if (obj instanceof fabric.Circle) {
    newObject = new fabric.Circle({
      left: (obj.left || 0) + offsetX,
      top: (obj.top || 0) + offsetY,
      radius: obj.radius,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      selectable: true,
    });
  } else if (obj instanceof fabric.Polygon) {
    newObject = new fabric.Polygon(obj.points || [], {
      left: (obj.left || 0) + offsetX,
      top: (obj.top || 0) + offsetY,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      selectable: true,
    });
  } else if (obj instanceof fabric.Textbox) {
    newObject = new fabric.Textbox(obj.text || '', {
      left: (obj.left || 0) + offsetX,
      top: (obj.top || 0) + offsetY,
      fontSize: obj.fontSize,
      fill: obj.fill,
      fontFamily: obj.fontFamily,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      textAlign: obj.textAlign,
      width: obj.width,
      editable: true,
      selectable: true,
    });
  } else if (obj instanceof fabric.Path) {
    newObject = new fabric.Path(obj.path || '', {
      left: (obj.left || 0) + offsetX,
      top: (obj.top || 0) + offsetY,
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      opacity: obj.opacity,
      selectable: true,
    });
  } else {
    return null;
  }

  (newObject as fabric.Object & { name?: string }).name = newId;
  return newObject;
};