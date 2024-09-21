import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

function ImageConverter() {
  const [originalFile, setOriginalFile] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [originalFormat, setOriginalFormat] = useState('');
  const [targetFormat, setTargetFormat] = useState('');
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);
  const fileInputRef = useRef(null);

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
    <div className="space-y-6">
      <div>
        <Label htmlFor="image-upload" className="block mb-2">Upload Image</Label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current.click()}>
          Choose File
        </Button>
      </div>

      {originalImage && (
        <div className="space-y-4">
          <img src={originalImage} alt="Original" className="w-full rounded-lg shadow-md" />
          <p>Format: {originalFormat}</p>
          <p>Size: {(originalSize / 1024).toFixed(2)} KB</p>
          
          <Select value={targetFormat} onValueChange={setTargetFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select target format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpeg">JPEG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={convertImage} className="w-full">Convert</Button>
        </div>
      )}

      {convertedImage && (
        <div className="space-y-4">
          <img src={convertedImage} alt="Converted" className="w-full rounded-lg shadow-md" />
          <p>Converted size: {(convertedSize / 1024).toFixed(2)} KB</p>
          <p>Size difference: {((convertedSize - originalSize) / 1024).toFixed(2)} KB</p>
          <Button asChild className="w-full">
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