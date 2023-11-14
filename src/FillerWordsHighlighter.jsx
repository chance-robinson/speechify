import React, { useEffect, useState } from "react";

const FillerWordsHighlighter = ({ transcriptions, confidences }) => {
  const [highlightedTranscriptions, setHighlightedTranscriptions] = useState([]);
  const [fillerScores, setFillerScores] = useState([]);
  const [userDefinedFillerWords, setUserDefinedFillerWords] = useState(() => {
    // Initialize with the value from local storage, or a default value if not present
    const storedValue = localStorage.getItem("userDefinedFillerWords");
    return storedValue ? storedValue : "okay";
  });

  useEffect(() => {
    highlightFillerWords(transcriptions);
    calculateFillerScores(transcriptions);
  }, [transcriptions, userDefinedFillerWords]);

  const highlightFillerWords = (transcriptions) => {
    const highlightedTexts = transcriptions.map((transcription) => {
      const words = transcription.split(/\s+/);

      return words.map((word) =>
        userDefinedFillerWords.includes(word.toLowerCase()) ? (
          <span key={word} style={{ color: "red", fontWeight: "bold" }}>
            {word}&nbsp;
          </span>
        ) : (
          <span key={word}>{word}&nbsp;</span>
        )
      );
    });

    setHighlightedTranscriptions(highlightedTexts);
  };

  const calculateFillerScores = (transcriptions) => {
    const scores = transcriptions.map((transcription) => {
      const words = transcription.split(/\s+/);
      const totalWords = words.length;
      const fillerCount = words.filter((word) =>
        userDefinedFillerWords.includes(word.toLowerCase())
      ).length;

      return 100 - (fillerCount / totalWords) * 100;
    });

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
        />
      </label>
      <p>
        Notes: A confidence score of less than 90 or around there indicates poor
        speech patterns such as mumbling/poor enunciation/etc... and will skew
        the transcription.
      </p>
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
          {transcriptions.map((_, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "10px" }}>
                {highlightedTranscriptions[index]}
              </td>
              <td style={{ padding: "10px" }}>{fillerScores[index]}%</td>
              <td style={{ padding: "10px" }}>
                {confidences[index].toFixed(4) * 100}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FillerWordsHighlighter;
