import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from 'lucide-react';
import { useTheme } from '../ThemeContext';

function RandomChoiceGenerator() {
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState([]);
  const [currentChoice, setCurrentChoice] = useState('');
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { isDarkMode } = useTheme();

  const addChoice = () => {
    if (currentChoice.trim() !== '') {
      setChoices([...choices, { text: currentChoice.trim(), selected: false }]);
      setCurrentChoice('');
    }
  };

  const toggleChoice = (index) => {
    setChoices(choices.map((choice, i) => 
      i === index ? { ...choice, selected: !choice.selected } : choice
    ));
  };

  const deleteChoice = (index) => {
    setChoices(choices.filter((_, i) => i !== index));
  };

  const selectRandomChoice = () => {
    if (choices.length === 0) return;
    
    setIsAnimating(true);
    const availableChoices = choices.filter(choice => !choice.selected);
    let count = 0;
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableChoices.length);
      setSelectedChoice(availableChoices[randomIndex].text);
      count++;
      if (count > 20) {
        clearInterval(intervalId);
        setIsAnimating(false);
        const finalChoice = availableChoices[Math.floor(Math.random() * availableChoices.length)];
        setSelectedChoice(finalChoice.text);
        setChoices(choices.map(choice => 
          choice.text === finalChoice.text ? { ...choice, selected: true } : choice
        ));
        setShowConfetti(true);
      }
    }, 100);
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question"
        className="w-full bg-white dark:bg-gray-700 text-black dark:text-white"
      />
      <div className="flex space-x-2">
        <Input
          type="text"
          value={currentChoice}
          onChange={(e) => setCurrentChoice(e.target.value)}
          placeholder="Enter a choice"
          className="flex-grow bg-white dark:bg-gray-700 text-black dark:text-white"
        />
        <Button onClick={addChoice} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">Add</Button>
      </div>
      <ul className="space-y-2">
        {choices.map((choice, index) => (
          <li 
            key={index} 
            className={`p-2 bg-white dark:bg-gray-700 rounded-md shadow flex justify-between items-center ${choice.selected ? 'text-gray-400 dark:text-gray-500' : 'text-black dark:text-white'}`}
          >
            <span 
              className={`flex-grow cursor-pointer ${choice.selected ? 'line-through' : ''}`}
              onClick={() => toggleChoice(index)}
            >
              {choice.text}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => deleteChoice(index)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
            >
              <X size={18} />
            </Button>
          </li>
        ))}
      </ul>
      <Button 
        onClick={selectRandomChoice} 
        disabled={isAnimating || choices.length === 0}
        className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
      >
        Choose Random
      </Button>
      {selectedChoice && (
        <div className="text-3xl font-bold text-center p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-black dark:text-white">
          {selectedChoice}
        </div>
      )}
      {showConfetti && <Confetti />}
    </div>
  );
}

export default RandomChoiceGenerator;