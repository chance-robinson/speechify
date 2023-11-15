import React, { useState, useRef, useEffect } from "react";
import "./AudioFile.css";

const AudioRecorder = ({ maxRecordingDuration, setTranscriptions, setConfidences, infinitePlay, isRecording, setIsRecording }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef();
  const recordingTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const clearContentHandler = () => {
    setTranscriptions([]);
    setConfidences([]);
    setAudioURL("");
    setIsPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prevDuration) => prevDuration + 1000); // increment by 100 milliseconds
        if (recordingDuration >= maxRecordingDuration  && !infinitePlay) {
          stopRecording();
        }
      }, 1000);
    } else {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [isRecording, recordingDuration, maxRecordingDuration, infinitePlay]);


  const startRecording = () => {
    clearContentHandler();
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const transcript = event.results[lastIndex][0].transcript;
      const conf = event.results[lastIndex][0].confidence;
      setTranscriptions((prevTranscriptions) => [...prevTranscriptions, transcript]);
      setConfidences((prevConfidences) => [...prevConfidences, conf]);
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
        if (!infinitePlay) {
        recordingTimerRef.current = setTimeout(() => {
          recognition.stop();
          stopRecording();
        }, maxRecordingDuration);
      }
        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch((error) => console.error("Error accessing microphone:", error));
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      clearTimeout(recordingTimerRef.current);
  
      // Release the media stream tracks
      const stream = mediaRecorderRef.current.stream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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
  }, [audioRef.current]);

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
    </div>
  );
};

export default AudioRecorder;
