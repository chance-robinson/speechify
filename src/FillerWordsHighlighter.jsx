import React, { useEffect, useState } from 'react';

const FillerWordsHighlighter = ({ transcription, confidence }) => {
  const [highlightedTranscription, setHighlightedTranscription] = useState('');
  const [fillerScore, setFillerScore] = useState(0);
  const [userDefinedFillerWords, setUserDefinedFillerWords] = useState('okay');

  useEffect(() => {
    highlightFillerWords(transcription);
    calculateFillerScore(transcription);
  }, [transcription, userDefinedFillerWords]);

  const highlightFillerWords = (transcription) => {
    const words = transcription.split(/\s+/);

    const highlightedText = words
      .map((word) => (userDefinedFillerWords.includes(word.toLowerCase()) ? `<span style="color: red;">${word}</span>` : word))
      .join(' ');

    setHighlightedTranscription(highlightedText);
  };

  const calculateFillerScore = (transcription) => {
    const words = transcription.split(/\s+/);
    const totalWords = words.length;
    const fillerCount = words.filter((word) => userDefinedFillerWords.includes(word.toLowerCase())).length;

    const score = 100 - (fillerCount / totalWords) * 100;
    setFillerScore(score.toFixed(2));
  };

  const handleUserDefinedFillerWordsChange = (event) => {
    setUserDefinedFillerWords(event.target.value);
  };

  return (
    <div style={{width: '100%'}}>
      <label style={{display: 'flex', flexDirection:'column'}}>
        User-Defined Filler Words (seperate on space or comma):
        <input
          type="text"
          value={userDefinedFillerWords}
          onChange={handleUserDefinedFillerWordsChange}
        />
      </label>
      <div>
        <p dangerouslySetInnerHTML={{ __html: highlightedTranscription }} />
        <p>Score: {fillerScore}%</p>
        <p>Confidence (less than 90% means you REALLY need to enunciate better and it can skew the transcription): {confidence.toFixed(4)*100}%</p>
      </div>
    </div>
  );
};

export default FillerWordsHighlighter;
