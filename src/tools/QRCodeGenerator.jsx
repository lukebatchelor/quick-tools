import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from '../ThemeContext';

function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [size, setSize] = useState(200);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    generateQRCode();
  }, [text, size, darkColor, lightColor]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(text || ' ', {
        width: size,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQrCode(url);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold dark:text-white">QR Code Generator</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Create custom QR codes for your URLs, text, or contact information.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="qr-text" className="block mb-2 dark:text-white">Enter text or URL</Label>
          <Input
            id="qr-text"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text or URL for QR code"
            className="w-full dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <Label htmlFor="qr-size" className="block mb-2 dark:text-white">QR Code Size</Label>
          <Select value={size.toString()} onValueChange={(value) => setSize(Number(value))}>
            <SelectTrigger id="qr-size" className="w-full dark:bg-gray-700 dark:text-white">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {[100, 200, 300, 400, 500].map((s) => (
                <SelectItem key={s} value={s.toString()} className="dark:text-white dark:hover:bg-gray-700">
                  {s}x{s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dark-color" className="block mb-2 dark:text-white">Dark Color</Label>
          <Input
            id="dark-color"
            type="color"
            value={darkColor}
            onChange={(e) => setDarkColor(e.target.value)}
            className="w-full h-10 dark:bg-gray-700"
          />
        </div>

        <div>
          <Label htmlFor="light-color" className="block mb-2 dark:text-white">Light Color</Label>
          <Input
            id="light-color"
            type="color"
            value={lightColor}
            onChange={(e) => setLightColor(e.target.value)}
            className="w-full h-10 dark:bg-gray-700"
          />
        </div>
      </div>

      {qrCode && (
        <div className="flex flex-col items-center space-y-4">
          <img src={qrCode} alt="QR Code" className="max-w-full" />
          <Button onClick={downloadQRCode} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
            Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
}

export default QRCodeGenerator;