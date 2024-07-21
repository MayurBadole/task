import React, { useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";
import { useDropzone } from "react-dropzone";
import "./EditerPage.css";
import CirclePage from "../pages/CirclePage";
import RectanglePage from "../pages/RectanglePage";
import TextPage from "../pages/TextPage";

const EditerPage = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shape, setShape] = useState(null);
  const [text, setText] = useState("");
  const [circles, setCircles] = useState([]);
  const [rectangles, setRectangles] = useState([]);
  const [texts, setTexts] = useState([]);
  const [svgData, setSvgData] = useState(null);
  const [pathPoints, setPathPoints] = useState([]);
  const svgRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [svgPosition, setSvgPosition] = useState({ x: 10, y: 120 });
  const [canDrag, setCanDrag] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth - 40}px`;
    canvas.style.height = `${window.innerHeight - 40}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.lineWidth = 5;
  }, []);

  const startDrawing = ({ nativeEvent }) => {
    if (shape || text || svgData) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext("2d");
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    const context = canvasRef.current.getContext("2d");
    context.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext("2d");
    context.lineTo(offsetX, offsetY);
    context.stroke();
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

  const onDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(reader.result, "image/svg+xml");
      const path = svgDoc.querySelector("path");
      if (path) {
        setSvgData(reader.result);
        const points = parsePathData(path.getAttribute("d"));
        setPathPoints(points);
      }
    };
    reader.readAsText(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".svg",
  });

  const parsePathData = (d) => {
    const commands = d.match(/([a-zA-Z][^a-zA-Z]*)/g);
    let points = [];
    for (let command of commands) {
      const coords = command
        .slice(1)
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (
        command[0].toUpperCase() === "M" ||
        command[0].toUpperCase() === "L"
      ) {
        points.push(coords);
      }
    }
    return points;
  };

  const updatePath = useCallback(
    (index, newPoint) => {
      const updatedPoints = [...pathPoints];
      updatedPoints[index] = newPoint;
      setPathPoints(updatedPoints);

      const newPathData = updatedPoints
        .map((point, idx) => `${idx === 0 ? "M" : "L"} ${point.join(" ")}`)
        .join(" ");

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
      const path = svgDoc.querySelector("path");
      path.setAttribute("d", newPathData);
      setSvgData(new XMLSerializer().serializeToString(svgDoc));
    },
    [pathPoints, svgData]
  );

  useEffect(() => {
    if (svgData) {
      d3.select(svgRef.current).selectAll("*").remove();
      d3.select(svgRef.current).html(svgData);

      d3.select(svgRef.current).selectAll("circle").remove();
      pathPoints.forEach((point, index) => {
        d3.select(svgRef.current)
          .append("circle")
          .attr("cx", point[0])
          .attr("cy", point[1])
          .attr("r", 5)
          .attr("fill", "blue")
          .call(
            d3.drag().on("drag", (event) => {
              const newPoint = [event.x, event.y];
              updatePath(index, newPoint);
            })
          );
      });
    }
  }, [svgData, pathPoints, updatePath]);

  const handleDoubleClick = () => {
    setCanDrag(true);
  };

  const handleMouseDown = (e) => {
    if (!canDrag) return;
    setDragging(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    setDragging(false);
    setCanDrag(false);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const { clientX, clientY } = e;
    setSvgPosition({ x: clientX - dragOffset.x, y: clientY - dragOffset.y });
  };

  useEffect(() => {
    if (svgData) {
      d3.select(svgRef.current).selectAll("*").remove();
      d3.select(svgRef.current).html(svgData);

      d3.select(svgRef.current).selectAll("circle").remove();

      const svgPadding = 20;

      pathPoints.forEach((point, index) => {
        d3.select(svgRef.current)
          .append("circle")
          .attr("cx", point[0] + svgPadding)
          .attr("cy", point[1] + svgPadding)
          .attr("r", 5)
          .attr("fill", "blue")
          .call(
            d3.drag().on("drag", (event) => {
              const newPoint = [event.x - svgPadding, event.y - svgPadding];
              updatePath(index, newPoint);
            })
          );
      });
    }
  }, [svgData, pathPoints, updatePath]);

  return (
    <>
      <div className="controls">
        <button onClick={() => setShape("rectangle")} disabled={svgData}>
          Rectangle
        </button>
        <button onClick={() => setShape("circle")} disabled={svgData}>
          Circle
        </button>
        <button
          onClick={() => setText("write something here...")}
          disabled={svgData}
        >
          Text
        </button>
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} type="file" />
          <p
            style={{
              cursor: "pointer",
              border: "1px solid gray",
              padding: "10px",
            }}
          >
            Upload image here
          </p>
        </div>
      </div>
      <div className="canvas-container">
        <canvas
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          ref={canvasRef}
        />
        {svgData && (
          <svg
            ref={svgRef}
            width={window.innerWidth - 40}
            height={window.innerHeight - 40}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              position: "absolute",
              top: svgPosition.y,
              left: svgPosition.x,
              cursor: canDrag ? (dragging ? "grabbing" : "grab") : "default",
              overflow: "visible",
              padding: "10px 20px",
            }}
          />
        )}
      </div>
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
