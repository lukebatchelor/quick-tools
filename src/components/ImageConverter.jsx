import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTheme } from '../ThemeContext';

function ImageConverter() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [originalFormat, setOriginalFormat] = useState('');
  const [targetFormat, setTargetFormat] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);
  const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setOriginalFile(file);
      setOriginalImage(URL.createObjectURL(file));
      setOriginalFormat(file.type.split('/')[1]);
      setOriginalSize(file.size);
    }
  };

  const convertImage = () => {
    if (!originalFile || !targetFormat) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          setConvertedImage(URL.createObjectURL(blob));
          setConvertedSize(blob.size);
        }, `image/${targetFormat}`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(originalFile);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <div>
        <Label htmlFor="image-upload" className="block mb-2 dark:text-white">Upload Image</Label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current.click()} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
          Choose File
        </Button>
      </div>

      {originalImage && (
        <div className="space-y-4">
          <img src={originalImage} alt="Original" className="w-full rounded-lg shadow-md" />
          <p className="dark:text-white">Format: {originalFormat}</p>
          <p className="dark:text-white">Size: {(originalSize / 1024).toFixed(2)} KB</p>
          
          <Select value={targetFormat} onValueChange={setTargetFormat}>
            <SelectTrigger className="dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Select target format" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800">
              <SelectItem value="jpeg" className="dark:text-white dark:hover:bg-gray-700">JPEG</SelectItem>
              <SelectItem value="png" className="dark:text-white dark:hover:bg-gray-700">PNG</SelectItem>
              <SelectItem value="webp" className="dark:text-white dark:hover:bg-gray-700">WebP</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={convertImage} className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Convert</Button>
        </div>
      )}

      {convertedImage && (
        <div className="space-y-4">
          <img src={convertedImage} alt="Converted" className="w-full rounded-lg shadow-md" />
          <p className="dark:text-white">Converted size: {(convertedSize / 1024).toFixed(2)} KB</p>
          <p className="dark:text-white">Size difference: {((convertedSize - originalSize) / 1024).toFixed(2)} KB</p>
          <Button asChild className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
            <a href={convertedImage} download={`converted.${targetFormat}`}>
              Download Converted Image
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

export default ImageConverter;