export const getCanvasCoords = (e, canvas) => {
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
};

export const drawLine = (ctx, from, to, color, lineWidth, opacity = 1) => {
  if (!ctx) return;

  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
};


export const drawShapeOnContext = (
  ctx,
  shape,
  start,
  end,
  shapeColor,
  shapeLineWidth,
  shapeFillColor
) => {
  if (!ctx) return;

  ctx.strokeStyle = shapeColor;
  ctx.lineWidth = shapeLineWidth;
  ctx.fillStyle = shapeFillColor || 'transparent';
  ctx.globalAlpha = 1;
  ctx.beginPath();

  switch (shape) {
    case 'line':
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      break;

    case 'arrow':
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = 15;
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(
        end.x - headLength * Math.cos(angle - Math.PI / 6),
        end.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        end.x - headLength * Math.cos(angle + Math.PI / 6),
        end.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = shapeColor;
      ctx.fill();
      return;

    case 'rectangle':
      if (shapeFillColor && shapeFillColor !== 'transparent') {
        ctx.fillRect(start.x, start.y, end.x - start.x, end.y - start.y);
      }
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      return;

    case 'circle':
      const radiusX = Math.abs(end.x - start.x) / 2;
      const radiusY = Math.abs(end.y - start.y) / 2;
      const centerX = start.x + (end.x - start.x) / 2;
      const centerY = start.y + (end.y - start.y) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      break;

    case 'triangle':
      ctx.moveTo(start.x + (end.x - start.x) / 2, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(start.x, end.y);
      ctx.closePath();
      break;

    case 'diamond':
      const midX = start.x + (end.x - start.x) / 2;
      const midY = start.y + (end.y - start.y) / 2;
      ctx.moveTo(midX, start.y);
      ctx.lineTo(end.x, midY);
      ctx.lineTo(midX, end.y);
      ctx.lineTo(start.x, midY);
      ctx.closePath();
      break;

    case 'flowchart':
      const width = end.x - start.x;
      const height = end.y - start.y;
      const radius = Math.min(20, Math.abs(width) / 4, Math.abs(height) / 4);
      ctx.roundRect(start.x, start.y, width, height, radius);
      break;

    default:
      return;
  }

  if (shapeFillColor && shapeFillColor !== 'transparent') {
    ctx.fill();
  }
  ctx.stroke();
};

export const drawText = (
  ctx,
  position,
  text,
  color,
  fontSize = 18,
  fontFamily = 'Arial'
) => {
  if (!ctx) return;

  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillText(text, position.x, position.y);
};

export const drawCodeBlock = (ctx, position, code) => {
  if (!ctx) return;

  ctx.font = '14px Monaco, Consolas, monospace';
  const lines = code.split('\n');
  const lineHeight = 20;
  const padding = 10;
  const maxWidth =
    Math.max(...lines.map((l) => ctx.measureText(l).width)) + padding * 2;
  const height = lines.length * lineHeight + padding * 2;

  // Background
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(position.x, position.y, maxWidth, height);

  // Border
  ctx.strokeStyle = '#3c3c3c';
  ctx.lineWidth = 2;
  ctx.strokeRect(position.x, position.y, maxWidth, height);

  // Text
  ctx.fillStyle = '#d4d4d4';
  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      position.x + padding,
      position.y + padding + (i + 1) * lineHeight - 5
    );
  });
};

export const loadCanvasFromData = (canvas, canvasData) => {
  if (!canvas || !canvasData) return;

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = canvasData;
};

export const clearCanvasWithWhite = (canvas) => {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const getCursorStyle = (tool, isLocked, isInterviewer, isPanning) => {
  if (isLocked && !isInterviewer) return 'not-allowed';

  switch (tool) {
    case 'pan':
      return isPanning ? 'grabbing' : 'grab';
    case 'eraser':
      return 'crosshair';
    case 'text':
      return 'text';
    case 'select':
      return 'default';
    default:
      return 'crosshair';
  }
};
