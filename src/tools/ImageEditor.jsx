import React, { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RgbaColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "../ThemeContext";
import {
  Upload,
  Type,
  Square,
  Image as ImageIcon,
  Download
} from "lucide-react";

function ImageEditor() {
  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const objectFileInputRef = useRef(null);
  const { isDarkMode } = useTheme();
  const [imageUploaded, setImageUploaded] = useState(false);
  const [layerPosition, setLayerPosition] = useState("");
  const [backgroundColor, setBackgroundColor] = useState({ r: 255, g: 255, b: 255, a: 0 }); // Default to transparent
  const [foregroundColor, setForegroundColor] = useState({ r: 0, g: 0, b: 0, a: 1 }); // Default to opaque black
  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [fontSize, setFontSize] = useState("20");
  const [borderThickness, setBorderThickness] = useState("2");

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const newCanvas = new fabric.Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerWidth * 0.75, // 4:3 aspect ratio
        backgroundColor: "#ffffff", // Set a default white background
      });
      setCanvas(newCanvas);

      const handleResize = () => {
        const newWidth = containerRef.current.offsetWidth;
        newCanvas.setDimensions({ width: newWidth, height: newWidth * 0.75 });
        newCanvas.renderAll();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        newCanvas.dispose();
      };
    }
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.on("selection:created", handleObjectSelection);
      canvas.on("selection:updated", handleObjectSelection);
      canvas.on("selection:cleared", handleSelectionCleared);

      return () => {
        canvas.off("selection:created", handleObjectSelection);
        canvas.off("selection:updated", handleObjectSelection);
        canvas.off("selection:cleared", handleSelectionCleared);
      };
    }
  }, [canvas]);

  const handleLayerChange = (position) => {
    setLayerPosition(position);
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      switch (position) {
        case "front":
          canvas.bringToFront(activeObject);
          break;
        case "forward":
          canvas.bringForward(activeObject);
          break;
        case "backward":
          canvas.sendBackwards(activeObject);
          break;
        case "back":
          canvas.sendToBack(activeObject);
          break;
      }
      canvas.renderAll();
    }
  };

  // Helper function to convert RGBA object to fabric.js color string
  const rgbaToFabricColor = (color) => {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  };

  const handleObjectSelection = (e) => {
    const selectedObject = e.selected[0];
    if (selectedObject) {
      setSelectedObjectType(selectedObject.type);
      if (selectedObject.type === "i-text") {
        setForegroundColor(fabricColorToRgba(selectedObject.fill));
        setBackgroundColor(fabricColorToRgba(selectedObject.backgroundColor));
        setFontSize(selectedObject.fontSize.toString());
      } else if (selectedObject.type === "rect") {
        setBackgroundColor(fabricColorToRgba(selectedObject.fill));
        setForegroundColor(fabricColorToRgba(selectedObject.stroke));
        setBorderThickness(selectedObject.strokeWidth.toString());
      }
      // Reset layer position on new selection
      setLayerPosition("");
    }
  };

  const handleSelectionCleared = () => {
    setSelectedObjectType(null);
    setForegroundColor({ r: 0, g: 0, b: 0, a: 1 }); // Reset to opaque black
    setBackgroundColor({ r: 255, g: 255, b: 255, a: 0 }); // Reset to transparent
  };

  // Helper function to convert fabric.js color to RGBA object
  const fabricColorToRgba = (color) => {
    if (!color) return { r: 0, g: 0, b: 0, a: 1 };
    if (typeof color === 'string') {
      if (color.startsWith('rgb')) {
        const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        return match ? {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: match[4] ? parseFloat(match[4]) : 1
        } : { r: 0, g: 0, b: 0, a: 1 };
      }
      // Handle hex colors
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return { r, g, b, a: 1 };
    }
    return color;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        canvas.clear();
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          scaleX: canvas.width / img.width,
          scaleY: canvas.height / img.height,
        });
        setImageUploaded(true);
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleObjectImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      fabric.Image.fromURL(event.target.result, (img) => {
        img.scaleToWidth(100); // Set a default width
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText("Text", {
      left: 100,
      top: 100,
      fill: rgbaToFabricColor(foregroundColor),
      backgroundColor: 'rgba(255,255,255,0)', // Transparent background
      fontSize: parseInt(fontSize),
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };


  const addRect = () => {
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: 'rgba(255,255,255,0)', // Transparent background
      stroke: rgbaToFabricColor(foregroundColor),
      strokeWidth: parseInt(borderThickness),
      width: 100,
      height: 100,
      lockUniScaling: false,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };

  const exportImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "edited-image.png";
    link.click();
  };

  const handleColorChange = (color, isForeground) => {
    const fabricColor = rgbaToFabricColor(color);
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      if (activeObject.type === "i-text") {
        if (isForeground) {
          activeObject.set("fill", fabricColor);
          setForegroundColor(color);
        } else {
          activeObject.set("backgroundColor", fabricColor);
          setBackgroundColor(color);
        }
      } else if (activeObject.type === "rect") {
        if (isForeground) {
          activeObject.set("stroke", fabricColor);
          setForegroundColor(color);
        } else {
          activeObject.set("fill", fabricColor);
          setBackgroundColor(color);
        }
      }
      canvas.renderAll();
    } else {
      if (isForeground) {
        setForegroundColor(color);
      } else {
        setBackgroundColor(color);
      }
    }
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.set("fontSize", parseInt(newSize));
      canvas.renderAll();
    }
  };

  const handleBorderThicknessChange = (newThickness) => {
    setBorderThickness(newThickness);
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "rect") {
      activeObject.set("strokeWidth", parseInt(newThickness));
      canvas.renderAll();
    }
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? "dark" : ""}`} ref={containerRef}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold dark:text-white">Image Editor</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload an image and use the tools below to edit it.
        </p>
      </div>

      <div className="flex justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" /> Upload Background Image
        </Button>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 dark:border-gray-600"
        />
      </div>

      {selectedObjectType && (
        <div className="flex flex-col space-y-4">
          {(selectedObjectType === "i-text" || selectedObjectType === "rect") && (
            <>
              <div>
                <Label htmlFor="bg-color" className="block mb-2 text-sm font-medium text-black dark:text-white">
                  Background Color
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="bg-color"
                      className="w-full h-10 p-1"
                      style={{
                        backgroundColor: `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`,
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <RgbaColorPicker color={backgroundColor} onChange={(color) => handleColorChange(color, false)} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="fg-color" className="block mb-2 text-sm font-medium text-black dark:text-white">
                  Foreground Color
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="fg-color"
                      className="w-full h-10 p-1"
                      style={{
                        backgroundColor: `rgba(${foregroundColor.r}, ${foregroundColor.g}, ${foregroundColor.b}, ${foregroundColor.a})`,
                      }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <RgbaColorPicker color={foregroundColor} onChange={(color) => handleColorChange(color, true)} />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}
          {selectedObjectType === "i-text" && (
            <div>
              <Label htmlFor="font-size" className="block mb-2 text-sm font-medium text-black dark:text-white">
                Font Size
              </Label>
              <Select value={fontSize} onValueChange={handleFontSizeChange}>
                <SelectTrigger id="font-size" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                      className="text-black dark:text-white"
                    >
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedObjectType === "rect" && (
            <div>
              <Label htmlFor="border-thickness" className="block mb-2 text-sm font-medium text-black dark:text-white">
                Border Thickness
              </Label>
              <Select
                value={borderThickness}
                onValueChange={handleBorderThicknessChange}
              >
                <SelectTrigger id="border-thickness" className="w-full bg-white dark:bg-gray-800 text-black dark:text-white">
                  <SelectValue placeholder="Thickness" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((thickness) => (
                    <SelectItem
                      key={thickness}
                      value={thickness.toString()}
                      className="text-black dark:text-white"
                    >
                      {thickness}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="layer-position" className="block mb-2 text-sm font-medium text-black dark:text-white">
              Layer Position
            </Label>
            <Select value={layerPosition} onValueChange={handleLayerChange}>
              <SelectTrigger
                id="layer-position"
                className="w-full bg-white dark:bg-gray-800 text-black dark:text-white"
              >
                <SelectValue placeholder="Move to" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem
                  value="front"
                  className="text-black dark:text-white"
                >
                  Bring to Front
                </SelectItem>
                <SelectItem
                  value="forward"
                  className="text-black dark:text-white"
                >
                  Bring Forward
                </SelectItem>
                <SelectItem
                  value="backward"
                  className="text-black dark:text-white"
                >
                  Send Backward
                </SelectItem>
                <SelectItem value="back" className="text-black dark:text-white">
                  Send to Back
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {imageUploaded && (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={addText}
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
          >
            <Type className="w-4 h-4 mr-2" /> Add Text
          </Button>
          <Button
            onClick={addRect}
            className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white"
          >
            <Square className="w-4 h-4 mr-2" /> Add Rect
          </Button>
          <input
            type="file"
            accept="image/*"
            onChange={handleObjectImageUpload}
            ref={objectFileInputRef}
            className="hidden"
          />
          <Button
            onClick={() => objectFileInputRef.current.click()}
            className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
          >
            <ImageIcon className="w-4 h-4 mr-2" /> Add Image
          </Button>
          <Button
            onClick={exportImage}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImageEditor;