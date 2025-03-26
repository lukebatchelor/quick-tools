import React, { useState } from 'react';

const BahtToAudConverter = () => {
  const [bahtValue, setBahtValue] = useState('');
  const [audValue, setAudValue] = useState('');
  const conversionRate = 21.24; // Baht per AUD

  // Add digit to input
  const addDigit = (digit) => {
    const newValue = bahtValue + digit;
    setBahtValue(newValue);
    calculateAud(newValue);
  };

  // No longer needed since we removed decimal point functionality
  // Keeping other functions intact

  // Clear input
  const clearInput = () => {
    setBahtValue('');
    setAudValue('');
  };

  // Delete last character
  const deleteLastChar = () => {
    const newValue = bahtValue.slice(0, -1);
    setBahtValue(newValue);
    calculateAud(newValue);
  };

  // Calculate AUD value
  const calculateAud = (bahtStr) => {
    if (bahtStr === '') {
      setAudValue('');
      return;
    }
    
    const baht = parseFloat(bahtStr);
    if (!isNaN(baht)) {
      const aud = baht / conversionRate;
      setAudValue(aud.toFixed(2));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Baht to AUD Converter</h1>
        <p className="text-gray-600">Rate: 21.24 Baht = 1 AUD</p>
      </div>

      {/* Displays */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">Thai Baht (฿)</label>
          <div className="text-3xl font-bold text-center p-2 bg-gray-50 rounded border">
            {bahtValue || '0'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Australian Dollar ($)</label>
          <div className="text-3xl font-bold text-center p-2 bg-gray-50 rounded border text-green-600">
            {audValue || '0.00'}
          </div>
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2 mt-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => addDigit(num.toString())}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 text-2xl font-bold"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => addDigit('00')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 text-2xl font-bold"
        >
          00
        </button>
        <button
          onClick={() => addDigit('0')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 text-2xl font-bold"
        >
          0
        </button>
        <button
          onClick={deleteLastChar}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-4 text-xl font-bold"
        >
          ←
        </button>
        <button
          onClick={clearInput}
          className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-4 text-xl font-bold col-span-3"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};

export default BahtToAudConverter;
