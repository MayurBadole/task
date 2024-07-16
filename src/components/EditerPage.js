import React, { useRef, useEffect, useState } from "react";
import "./EditerPage.css";
import CirclePage from "../pages/CirclePage";
import RectanglePage from "../pages/RectanglePage";
import TextPage from "../pages/TextPage";

const EditerPage = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState(null);
  const [text, setText] = useState("");
  const [circles, setCircles] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    if (shape || text) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const addRectangle = () => {
    const newRectangle = {
      x: 50,
      y: 50,
      width: 150,
      height: 100,
      color: "blue",
    };
    setRectangles([...rectangles, newRectangle]);
    setShape(null);
  };

  const addCircle = () => {
    const newCircle = { x: 150, y: 150, radius: 50, color: "red" };
    setCircles([...circles, newCircle]);
    setShape(null);
  };

  const addText = (text) => {
    const newText = { x: 200, y: 200, initialText: text };
    setTexts([...texts, newText]);
    setText("");
  };

  useEffect(() => {
    if (shape === "rectangle") addRectangle();
    if (shape === "circle") addCircle();
    if (text) addText(text);
    // eslint-disable-next-line
  }, [shape, text]);

  return (
    <>
      <div className="controls">
        <button onClick={() => setShape("rectangle")}>Rectangle</button>
        <button onClick={() => setShape("circle")}>Circle</button>
        <button onClick={() => setText("write something here...")}>Text</button>
      </div>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
      />
      {circles.map((circle, index) => (
        <CirclePage key={index} {...circle} />
      ))}
      {rectangles.map((rectangle, index) => (
        <RectanglePage key={index} {...rectangle} />
      ))}
      {texts.map((textItem, index) => (
        <TextPage key={index} {...textItem} />
      ))}
    </>
  );
};

export default EditerPage;
