import { useState, useCallback } from 'react';
import { loadCanvasFromData } from '../utlis/canvasHelpers';

const MAX_HISTORY = 50;

export const useCanvasHistory = (canvasRef, socket, meetingId) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(dataUrl);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });

    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));

    if (socket && meetingId) {
      socket.emit('whiteboard-save-state', { meetingId, canvasData: dataUrl });
    }
  }, [canvasRef, historyIndex, socket, meetingId]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    const canvasData = history[newIndex];

    if (!canvasData) return;

    setHistoryIndex(newIndex);
    loadCanvasFromData(canvasRef.current, canvasData);

    if (socket && meetingId) {
      socket.emit('whiteboard-undo', {
        meetingId,
        canvasData,
        historyIndex: newIndex,
      });
    }
  }, [canvasRef, historyIndex, history, socket, meetingId]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    const canvasData = history[newIndex];

    if (!canvasData) return;

    setHistoryIndex(newIndex);
    loadCanvasFromData(canvasRef.current, canvasData);

    if (socket && meetingId) {
      socket.emit('whiteboard-redo', {
        meetingId,
        canvasData,
        historyIndex: newIndex,
      });
    }
  }, [canvasRef, historyIndex, history, socket, meetingId]);

  const initializeHistory = useCallback((initialData) => {
    setHistory([initialData]);
    setHistoryIndex(0);
  }, []);

  const loadFromHistory = useCallback(() => {
    if (historyIndex >= 0 && history[historyIndex]) {
      loadCanvasFromData(canvasRef.current, history[historyIndex]);
      return true;
    }
    return false;
  }, [canvasRef, historyIndex, history]);

  return {
    history,
    historyIndex,
    saveToHistory,
    handleUndo,
    handleRedo,
    initializeHistory,
    loadFromHistory,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
