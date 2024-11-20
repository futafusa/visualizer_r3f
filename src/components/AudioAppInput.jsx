import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

function AudioAppInput() {
  const [volume, setVolume] = useState(0); // 音量を保存する状態
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      source.connect(analyserRef.current);

      // 音量を取得する
      const getVolume = () => {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        const total = dataArrayRef.current.reduce((sum, value) => sum + value, 0);
        const averageVolume = total / dataArrayRef.current.length;

        setVolume(averageVolume);

        animationFrameRef.current = requestAnimationFrame(getVolume);
      };

      getVolume();
    } catch (err) {
      console.error("マイクアクセスエラー", err);
    }
  };

  const stopAudio = () => {
    if(audioContextRef.current) {
      audioContextRef.current.close();
    }
    if(animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setVolume(0);
  };

  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, []);

  return (
    <>
      <h1>リアルタイム音声表示</h1>
      <div>音量: {volume.toFixed(2)}</div>
      <button onClick={startAudio}>マイク開始</button>
      <button onClick={stopAudio}>マイク停止</button>
      <div
        style={{
          width: "100%",
          height: "20px",
          background: "#ddd",
          marginTop: "20px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${volume}%`,
            height: "100%",
            background: "#4caf50",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </>
  );
}

export default AudioAppInput;