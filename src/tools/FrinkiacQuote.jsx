import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from 'lucide-react';

const FrinkiacQuote = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomQuote = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://frinkiac.com/api/random');
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }
      const data = await response.json();

      // Fetch the caption for this frame
      const captionResponse = await fetch(`https://frinkiac.com/api/caption?e=${data.Episode.Key}&t=${data.Frame.Timestamp}`);
      const captionData = await captionResponse.json();

      setQuote({
        ...data,
        caption: captionData
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = () => {
    if (!quote) return null;
    return `https://frinkiac.com/meme/${quote.Episode.Key}/${quote.Frame.Timestamp}.jpg`;
  };

  const getCaptionText = () => {
    if (!quote || !quote.caption || !quote.caption.Subtitles) return '';
    return quote.caption.Subtitles.map(s => s.Content).join(' ');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Frinkiac Random Quote</h2>
        <p className="text-gray-600 dark:text-gray-400">Get a random Simpsons quote and screenshot</p>
      </div>

      <div className="mb-6 text-center">
        <Button
          onClick={fetchRandomQuote}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Get Random Quote'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
          Error: {error}
        </div>
      )}

      {quote && (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <img
              src={getImageUrl()}
              alt="Simpsons screenshot"
              className="w-full rounded-lg shadow-md mb-4"
            />
            <div className="text-center">
              <p className="text-lg font-medium dark:text-white mb-2">
                "{getCaptionText()}"
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Season {quote.Episode.Season}, Episode {quote.Episode.EpisodeNumber}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                "{quote.Episode.Title}"
              </p>
            </div>
          </div>
        </div>
      )}

      {!quote && !loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          Click the button to load a random Simpsons quote
        </div>
      )}
    </div>
  );
};

export default FrinkiacQuote;
