import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from '../ThemeContext';
import { Upload } from 'lucide-react';

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

  const ImagePreview = ({ src, alt }) => {
    return (
      <div className="w-full flex justify-center items-center" style={{ maxHeight: '70vh' }}>
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
        />
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold dark:text-white">Image Converter</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Convert your images to different formats with ease. Start by uploading an image below.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current.click()} 
          className="w-64 h-32 flex flex-col items-center justify-center bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-300"
        >
          <Upload size={32} className="mb-2" />
          <span>Choose Image</span>
        </Button>
        {!originalImage && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: JPEG, PNG, WebP
          </p>
        )}
      </div>

      {originalImage && (
        <div className="space-y-6">
          <ImagePreview src={originalImage} alt="Original" />
          <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            <p className="dark:text-white">Format: {originalFormat}</p>
            <p className="dark:text-white">Size: {(originalSize / 1024).toFixed(2)} KB</p>
          </div>
          
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

          <Button onClick={convertImage} className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white">Convert</Button>
        </div>
      )}

      {convertedImage && (
        <div className="space-y-6">
          <ImagePreview src={convertedImage} alt="Converted" />
          <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            <p className="dark:text-white">Converted size: {(convertedSize / 1024).toFixed(2)} KB</p>
            <p className="dark:text-white">Size difference: {((convertedSize - originalSize) / 1024).toFixed(2)} KB</p>
          </div>
          <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
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