import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const transformations = {
  mirror: (text) => text.split('').reverse().join(''),
  upsideDown: (text) => {
    const upsideDownChars = {
      'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
      'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
      'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
      'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': 'q', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ',
      'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
      'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ɹ', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ',
      'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ',
      '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', ',': "'", '.': '˙',
      '?': '¿', '!': '¡', '"': '„', "'": ',', '(': ')', ')': '(', '[': ']', ']': '[',
      '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾',
    };
    return text.split('').map(char => upsideDownChars[char] || char).reverse().join('');
  },
  zalgo: (text) => {
    const zalgoChars = [
      '\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310',
      '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343',
      '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350',
      '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d',
      '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369',
      '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b',
    ];
    return text.split('').map(char => char + zalgoChars.map(z => Math.random() > 0.7 ? z : '').join('')).join('');
  },
  strikeThrough: (text) => text.split('').map(char => char + '\u0336').join(''),
  mockingSpongebob: (text) => {
    return text.split('').map(char => Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()).join('');
  },
  circled: (text) => {
    const circledChars = {
      'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ',
      'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ',
      'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ',
      'Y': 'Ⓨ', 'Z': 'Ⓩ', 'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ',
      'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ',
      'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ',
      'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ', '0': '⓪', '1': '①', '2': '②', '3': '③',
      '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨',
    };
    return text.split('').map(char => circledChars[char] || char).join('');
  },
  medieval: (text) => {
    const medievalChars = {
      'a': '𝔞', 'b': '𝔟', 'c': '𝔠', 'd': '𝔡', 'e': '𝔢', 'f': '𝔣', 'g': '𝔤', 'h': '𝔥', 'i': '𝔦', 'j': '𝔧',
      'k': '𝔨', 'l': '𝔩', 'm': '𝔪', 'n': '𝔫', 'o': '𝔬', 'p': '𝔭', 'q': '𝔮', 'r': '𝔯', 's': '𝔰', 't': '𝔱',
      'u': '𝔲', 'v': '𝔳', 'w': '𝔴', 'x': '𝔵', 'y': '𝔶', 'z': '𝔷',
      'A': '𝔄', 'B': '𝔅', 'C': 'ℭ', 'D': '𝔇', 'E': '𝔈', 'F': '𝔉', 'G': '𝔊', 'H': 'ℌ', 'I': 'ℑ', 'J': '𝔍',
      'K': '𝔎', 'L': '𝔏', 'M': '𝔐', 'N': '𝔑', 'O': '𝔒', 'P': '𝔓', 'Q': '𝔔', 'R': 'ℜ', 'S': '𝔖', 'T': '𝔗',
      'U': '𝔘', 'V': '𝔙', 'W': '𝔚', 'X': '𝔛', 'Y': '𝔜', 'Z': 'ℨ'
    };
    return text.split('').map(char => medievalChars[char] || char).join('');
  },

  script: (text) => {
    const scriptChars = {
      'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱', 'i': '𝓲', 'j': '𝓳',
      'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽',
      'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁', 'y': '𝔂', 'z': '𝔃',
      'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙',
      'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣',
      'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧', 'Y': '𝓨', 'Z': '𝓩'
    };
    return text.split('').map(char => scriptChars[char] || char).join('');
  },

  wide: (text) => {
    return text.split('').join(' ');
  },

  tinyCaps: (text) => {
    const tinyCapChars = {
      'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ',
      'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ',
      'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(char => tinyCapChars[char] || char).join('');
  },

  emojiLetters: (text) => {
    const emojiLetters = {
      'a': '🅰', 'b': '🅱', 'c': '🅲', 'd': '🅳', 'e': '🅴', 'f': '🅵', 'g': '🅶', 'h': '🅷', 'i': '🅸', 'j': '🅹',
      'k': '🅺', 'l': '🅻', 'm': '🅼', 'n': '🅽', 'o': '🅾', 'p': '🅿', 'q': '🆀', 'r': '🆁', 's': '🆂', 't': '🆃',
      'u': '🆄', 'v': '🆅', 'w': '🆆', 'x': '🆇', 'y': '🆈', 'z': '🆉'
    };
    return text.toLowerCase().split('').map(char => emojiLetters[char] || char).join('');
  },

  morse: (text) => {
    const morseCode = {
      'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
      'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
      'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
      'y': '-.--', 'z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
      '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
    };
    return text.toLowerCase().split('').map(char => morseCode[char] || char).join(' ');
  },
  binary: (text) => {
    return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
  },

  pigLatin: (text) => {
    return text.split(' ').map(word => {
      if (word.length > 2) {
        return word.slice(1) + word[0] + 'ay';
      }
      return word;
    }).join(' ');
  },

  leetSpeak: (text) => {
    const leetMap = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'};
    return text.toLowerCase().split('').map(char => leetMap[char] || char).join('');
  },

  vaporwave: (text) => {
    return text.split('').join(' ').toUpperCase();
  },

  subscript: (text) => {
    const subscriptMap = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
      'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
    };
    return text.toLowerCase().split('').map(char => subscriptMap[char] || char).join('');
  },
  superscript: (text) => {
    const superscriptMap = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
      'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
      'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
    };
    return text.toLowerCase().split('').map(char => superscriptMap[char] || char).join('');
  },

  invisibleInk: (text) => {
    return text.split('').map(char => char + '\u200B').join('');
  },

  sparkles: (text) => {
    return '✨' + text.split('').join('✨') + '✨';
  }
};

function FancyTextGenerator() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedTransformation, setSelectedTransformation] = useState('mirror');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (inputText && selectedTransformation) {
      const transformedText = transformations[selectedTransformation](inputText);
      setOutputText(transformedText);
    } else {
      setOutputText('');
    }
  }, [inputText, selectedTransformation]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    // You could add a toast notification here
  };

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center dark:text-white">Fancy Text Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text" className="dark:text-white">Enter your text</Label>
            <Input
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your text here"
              className="w-full dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transformation" className="dark:text-white">Select transformation</Label>
            <Select value={selectedTransformation} onValueChange={setSelectedTransformation}>
              <SelectTrigger id="transformation" className="w-full dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="Choose a transformation" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800">
              <SelectItem value="mirror" className="dark:text-white dark:hover:bg-gray-700">rorriM</SelectItem>
              <SelectItem value="upsideDown" className="dark:text-white dark:hover:bg-gray-700">nʍop ǝpᴉsd∩</SelectItem>
              <SelectItem value="zalgo" className="dark:text-white dark:hover:bg-gray-700">Z̸̢̡̯̰̳̯͈̈́̑̄̓͜a̴̢̨̘̙̣͎̾̊͗̆̕l̷̲̱̗̥̂̈́̀̕g̷̛̺͖̅̔̈́̊͝o̷̢̨̮͎̠̞̽</SelectItem>
              <SelectItem value="strikeThrough" className="dark:text-white dark:hover:bg-gray-700">S̶t̶r̶i̶k̶e̶ ̶T̶h̶r̶o̶u̶g̶h̶</SelectItem>
              <SelectItem value="mockingSpongebob" className="dark:text-white dark:hover:bg-gray-700">mOcKiNg SpOnGeBoB</SelectItem>
              <SelectItem value="circled" className="dark:text-white dark:hover:bg-gray-700">Ⓒⓘⓡⓒⓛⓔⓓ</SelectItem>
              <SelectItem value="medieval" className="dark:text-white dark:hover:bg-gray-700">𝔐𝔢𝔡𝔦𝔢𝔳𝔞𝔩</SelectItem>
              <SelectItem value="script" className="dark:text-white dark:hover:bg-gray-700">𝓢𝓬𝓻𝓲𝓹𝓽</SelectItem>
              <SelectItem value="wide" className="dark:text-white dark:hover:bg-gray-700">W i d e</SelectItem>
              <SelectItem value="tinyCaps" className="dark:text-white dark:hover:bg-gray-700">ᴛɪɴʏ ᴄᴀᴘs</SelectItem>
              <SelectItem value="emojiLetters" className="dark:text-white dark:hover:bg-gray-700">🅴🅼🅾🅹🅸 🅻🅴🆃🆃🅴🆁🆂</SelectItem>
              <SelectItem value="morse" className="dark:text-white dark:hover:bg-gray-700">-- --- .-. ... .</SelectItem>
              <SelectItem value="binary" className="dark:text-white dark:hover:bg-gray-700">01000010 01101001 01101110 01100001 01110010 01111001</SelectItem>
              <SelectItem value="pigLatin" className="dark:text-white dark:hover:bg-gray-700">igpay atinlay</SelectItem>
              <SelectItem value="leetSpeak" className="dark:text-white dark:hover:bg-gray-700">l337 5p34k</SelectItem>
              <SelectItem value="vaporwave" className="dark:text-white dark:hover:bg-gray-700">V A P O R W A V E</SelectItem>
              <SelectItem value="subscript" className="dark:text-white dark:hover:bg-gray-700">ₛᵤᵦₛcᵣᵢₚₜ</SelectItem>
              <SelectItem value="superscript" className="dark:text-white dark:hover:bg-gray-700">ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ</SelectItem>
              <SelectItem value="invisibleInk" className="dark:text-white dark:hover:bg-gray-700">I​n​v​i​s​i​b​l​e​ ​I​n​k</SelectItem>
              <SelectItem value="sparkles" className="dark:text-white dark:hover:bg-gray-700">✨S✨p✨a✨r✨k✨l✨e✨s✨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {outputText && (
            <div className="space-y-2">
              <Label htmlFor="output-text" className="dark:text-white">Transformed text</Label>
              <div className="relative">
                <Input
                  id="output-text"
                  value={outputText}
                  readOnly
                  className="w-full pr-10 dark:bg-gray-700 dark:text-white"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FancyTextGenerator;