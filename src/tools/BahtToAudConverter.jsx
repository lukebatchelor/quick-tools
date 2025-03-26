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
    <div className="flex flex-col bg-gray-100 p-2 flex-grow">
      {/* Header - Minimized */}
      <div className="mb-2 text-center">
        <h2 className="text-xl font-bold text-gray-800">Baht to AUD Converter</h2>
        <p className="text-sm text-gray-600">Rate: 21.24 Baht = 1 AUD</p>
      </div>

      {/* Displays */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-3">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-600">Thai Baht (฿)</label>
          <div className="text-2xl font-bold text-center p-1 bg-gray-50 rounded border">
            {bahtValue || '0'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Australian Dollar ($)</label>
          <div className="text-2xl font-bold text-center p-1 bg-gray-50 rounded border text-green-600">
            {audValue || '0.00'}
          </div>
        </div>
      </div>

      {/* Number Pad - Using flex-grow to use available space */}
      <div className="grid grid-cols-3 gap-1 flex-grow">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => addDigit(num.toString())}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-xl font-bold"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => addDigit('00')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-xl font-bold"
        >
          00
        </button>
        <button
          onClick={() => addDigit('0')}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-xl font-bold"
        >
          0
        </button>
        <button
          onClick={deleteLastChar}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 text-xl font-bold"
        >
          ←
        </button>
        <button
          onClick={clearInput}
          className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-xl font-bold col-span-3"
        >
          CLEAR
        </button>
      </div>
    </div>
  );
};

export default BahtToAudConverter;
