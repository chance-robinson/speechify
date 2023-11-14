import React, { useEffect, useState } from "react";

const FillerWordsHighlighter = ({ transcriptions, confidences, finished }) => {
  const [highlightedTranscriptions, setHighlightedTranscriptions] = useState([]);
  const [fillerScores, setFillerScores] = useState([]);
  const [totalWords, setTotalWords] = useState(0);
  const [totalFillerWords, setTotalFillerWords] = useState(0);
  const [avgConfidences, setAvgConfidences] = useState(0);
  const [userDefinedFillerWords, setUserDefinedFillerWords] = useState(() => {
    // Initialize with the value from local storage, or a default value if not present
    const storedValue = localStorage.getItem("userDefinedFillerWords");
    return storedValue ? storedValue : "um, like, so, yeah";
  });
  const [waitFinish, setWaitFinish] = useState(false);

  useEffect(() => {
    highlightFillerWords(transcriptions);
    calculateFillerScores(transcriptions);
  }, [transcriptions, userDefinedFillerWords]);

  const highlightFillerWords = (transcriptions) => {
    const highlightedTexts = transcriptions.map((transcription, transIndex) => {
      const words = transcription.split(/\s+/);
    
      return words.map((word, wordIndex) =>
        userDefinedFillerWords.includes(word.toLowerCase()) ? (
          <span key={`${transIndex}-${wordIndex}`} style={{ color: "red", fontWeight: "bold" }}>
            {word}&nbsp;
          </span>
        ) : (
          <span key={`${transIndex}-${wordIndex}`}>{word}&nbsp;</span>
        )
      );
    });

    setHighlightedTranscriptions(highlightedTexts);
  };

  const calculateFillerScores = (transcriptions) => {
    let totalWordsCount = 0;
    let totalFillerWordsCount = 0;
    let allConfidencesSum = 0;
    let confidencesCount = 0;
  
    const scores = transcriptions.map((transcription) => {
      const words = transcription.split(/\s+/).filter((word) => word !== ''); // Exclude empty strings
      const totalWords = words.length;
      const fillerCount = words.filter((word) =>
        userDefinedFillerWords.includes(word.toLowerCase())
      ).length;
  
      totalWordsCount += totalWords;
      totalFillerWordsCount += fillerCount;
  
      const confidence = confidences[transcriptions.indexOf(transcription)];
      if (!isNaN(confidence)) {
        confidencesCount++;
        allConfidencesSum += confidence;
      }
  
      if (fillerCount === 0) {
        return 100;
      } else {
        return 100 - (fillerCount / totalWords) * 100;
      }
    });
  
    setTotalWords(totalWordsCount);
    setTotalFillerWords(totalFillerWordsCount);
    setAvgConfidences(allConfidencesSum / confidencesCount); // Calculate average confidence
  
    setFillerScores(scores.map((score) => score.toFixed(2)));
  };

  const handleUserDefinedFillerWordsChange = (event) => {
    const newValue = event.target.value;
    setUserDefinedFillerWords(newValue);
    localStorage.setItem("userDefinedFillerWords", newValue); // Save to local storage
  };

  return (
    <div style={{ width: "100%" }}>
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "10px",
        }}
      >
        User-Defined Filler Words (separate on space or comma):
        <input
          type="text"
          value={userDefinedFillerWords}
          onChange={handleUserDefinedFillerWordsChange}
          placeholder="don't forget to add commonly used filler words like 'um, yeah, so', etc..."
        />
      </label>
      <p>
        Notes: A confidence score of less than 90 or around there indicates poor
        speech patterns such as mumbling/poor enunciation/etc... and will skew
        the transcription.
      </p>
      <p>Total score: {totalWords === 0 ? '' : totalFillerWords === 0 ? 100 : (100 - (totalFillerWords / totalWords) * 100).toFixed(1)}%</p>
      <p>
  Average confidence: {isNaN(avgConfidences) ? '' : (avgConfidences*100).toFixed(1)}%
</p>
<label>
        Transcription after recording (not during):
        <input
          type="checkbox"
          checked={waitFinish}
          onChange={() => setWaitFinish(!waitFinish)}
        />
      </label>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333" }}>
            <th style={{ padding: "10px", textAlign: "left", width: "80%" }}>
              Sentence
            </th>
            <th style={{ padding: "10px", textAlign: "left", width: "10%" }}>
              Score
            </th>
            <th style={{ padding: "10px", textAlign: "left", width: "10%" }}>
              Confidence
            </th>
          </tr>
        </thead>
        <tbody>
        {(!waitFinish || (waitFinish && !finished)) && transcriptions.map((_, index) => (
  <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
    <td style={{ padding: "10px", wordBreak: 'break-word' }}>
      {highlightedTranscriptions[index]}
    </td>
    <td style={{ padding: "10px" }}>{fillerScores[index]}%</td>
    <td style={{ padding: "10px" }}>
      {(confidences[index] * 100).toFixed(1)}%
    </td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
};

export default FillerWordsHighlighter;
