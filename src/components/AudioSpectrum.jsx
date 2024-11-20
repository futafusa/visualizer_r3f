import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";

function AudioSpectrum() {
  const cssSpectrum = css({
    width: "100%",
    height: "100px",
  });

  const audioContext = useRef(null);
  const spectrumRef = useRef(null);
  const [analyserNode, setAnalyserNode] = useState(null);
  const [audioSource, setAudioSource] = useState(null);

  const [playState, setPlayState] = useState(false);

  const playMic = async () => {
    if(playState) return;

    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    audioContext.current = new AudioContext();
    const _audioSource = audioContext.current.createMediaStreamSource(stream);

    const _analyser = audioContext.current.createAnalyser();
    _audioSource.connect(_analyser);

    setAudioSource(_audioSource);
    setAnalyserNode(_analyser);
    setPlayState(true);
  };

  const stopMic = ()=> {
    if(audioContext.current) {
      audioContext.current.close();
      setPlayState(false);
    }
  };

  useEffect(() => {
    if(playState === true) {
      const canvas = spectrumRef.current;
      canvas.width = window.innerWidth;
      canvas.height = `100`;
      const canvasContext = canvas.getContext('2d');

      // fftサイズ（最小32）
      analyserNode.fftSize = 32;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function drawGraph() {
        requestAnimationFrame(drawGraph);

        // 周波数グラフの取得
        analyserNode.getByteFrequencyData(dataArray);

        canvasContext.fillStyle = `#000`;
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength);
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i]/255*canvas.height;
          const hue = (i / bufferLength) * 270;
          
          canvasContext.fillStyle = `hsl(${hue}, 100%, 50%)`;
          canvasContext.fillRect(x, canvas.height, barWidth, -barHeight);

          x += barWidth;
        }
      }

      drawGraph();
    }
  }, [playState])

  return (
    <>
      <div>
        <button onClick={playMic}>MIC ON</button>
        <button onClick={stopMic}>MIC OFF</button>
      </div>
      <canvas ref={spectrumRef} css={cssSpectrum}></canvas>
    </>
  );
}

export default AudioSpectrum;