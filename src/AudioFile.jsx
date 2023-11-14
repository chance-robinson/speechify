import React, { useState, useRef, useEffect } from "react";
import FillerWordsHighlighter from './FillerWordsHighlighter';  // Import the FillerWordsHighlighter component
import "./AudioFile.css";

const AudioRecorder = ({ maxRecordingDuration }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef();
  const recordingTimerRef = useRef(null);
  const [transcription, setTranscription] = useState("");
  const recognitionRef = useRef(null);
  const [confidence, setConfidence] = useState(0);

  const clearContentHandler = () => {
    setTranscription("");
    setAudioURL("");
    setIsPlaying(false);
    setConfidence(0);
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1000); // increment by 100 milliseconds
        if (recordingDuration >= maxRecordingDuration) {
          stopRecording();
        }
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isRecording, recordingDuration, maxRecordingDuration]);

  const startRecording = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      console.log(event)
      const transcript = event.results[0][0].transcript;
      const conf = event.results[0][0].confidence;
      setTranscription(transcript);
      setConfidence(conf);
    };


    recognitionRef.current = recognition;
    recognition.start();

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        };

        mediaRecorderRef.current = mediaRecorder;

        // Set up a timer to stop recording after maxRecordingDuration milliseconds
        recordingTimerRef.current = setTimeout(() => {
          recognition.stop();
          stopRecording();
        }, maxRecordingDuration);

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => console.error("Error accessing microphone:", error));
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Call stop on the stored recognition object
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0); // Reset duration when recording stops
      clearTimeout(recordingTimerRef.current);
    }
  };

  const playRecording = () => {
    if (audioURL) {
      audioRef.current.currentTime = audioPosition;
      audioRef.current.play();
    }
  };
  
  useEffect(() => {
    const handlePlay = () => {
      setIsPlaying(true);
    };
  
    const handlePause = () => {
      setIsPlaying(false);
    };
  
    audioRef.current.addEventListener("ended", handlePlaybackEnd);
    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("pause", handlePause);
  
    return () => {
      audioRef.current.removeEventListener("ended", handlePlaybackEnd);
      audioRef.current.removeEventListener("play", handlePlay);
      audioRef.current.removeEventListener("pause", handlePause);
    };
  }, []);
  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPosition(audioRef.current.currentTime);
      setIsPlaying(false);
    }
  };

  const handlePlaybackEnd = () => {
    setIsPlaying(false);
    setAudioPosition(0); // Reset position when playback finishes
  };

  useEffect(() => {
    audioRef.current.src = audioURL;
    audioRef.current.addEventListener("ended", handlePlaybackEnd);
  }, [audioURL]);

  return (
    <div className="audiocontainer">
      <div className="recording-duration">
        {isRecording ? (
          <div>Recording Duration: {(recordingDuration / 1000)} s</div>
        ) : (
          ""
        )}
      </div>
      <audio ref={audioRef} controls />
      <div>
        <button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
        <button onClick={isPlaying ? pauseRecording : playRecording} disabled={!audioURL}>
          {isPlaying ? "Pause Recording" : "Play Recording"}
        </button>
        <button onClick={clearContentHandler}>
          Clear
        </button>
      </div>
      <div>
        <FillerWordsHighlighter transcription={transcription} confidence={confidence} />
      </div>
    </div>
  );
};

export default AudioRecorder;
