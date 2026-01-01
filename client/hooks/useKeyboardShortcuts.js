import { useEffect } from 'react';
import { ALL_TOOLS } from '../constants/tools';

export const useKeyboardShortcuts = ({
  isTyping,
  setTool,
  handleUndo,
  handleRedo,
  handleDownload,
  commitText,
  setIsTyping,
  setShowColorPicker,
  setShowFillPicker,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle typing mode
      if (isTyping) {
        if (e.key === 'Escape') {
          commitText();
          setIsTyping(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
          commitText();
          setIsTyping(false);
        }
        return;
      }

      const key = e.key.toLowerCase();

      // Tool shortcuts
      const matchedTool = ALL_TOOLS.find(
        (t) => t.shortcut?.toLowerCase() === key
      );
      if (matchedTool && !e.ctrlKey && !e.metaKey) {
        setTool(matchedTool.id);
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Redo: Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Save/Download: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        handleDownload();
        return;
      }

      // Escape to close pickers
      if (key === 'escape') {
        setShowColorPicker(false);
        setShowFillPicker(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTyping,
    setTool,
    handleUndo,
    handleRedo,
    handleDownload,
    commitText,
    setIsTyping,
    setShowColorPicker,
    setShowFillPicker,
  ]);
};
