import React, { useState, useEffect, useRef } from "react";

const TextPage = ({ x, y, initialText }) => {
  const [position, setPosition] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState(initialText);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
      const textNode = textRef.current.firstChild;
      if (textNode) {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [text]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX;
    const newY = e.clientY;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleInput = () => {
    setText(textRef.current.textContent);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        whiteSpace: "nowrap",
        border: "1px solid black",
        padding: "5px",
        minWidth: "100px",
        minHeight: "30px",
        backgroundColor: "white",
        textAlign: "left",
        direction: "ltr",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      ref={textRef}
    >
      {text}
    </div>
  );
};

export default TextPage;
