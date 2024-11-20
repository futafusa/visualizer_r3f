import { useEffect, useRef, useState } from "react";

function AudioApp2ForInput() {
  const audioRef = useRef(null);
  const timePositonRef = useRef(null);
  const spectrumRef = useRef(null);

  const audioCtxRef = useRef(null);
  const [source, setSource] = useState(null);
  const [analyserNode, setAnalyserNode] = useState(null);

  const [playState, setPlayState] = useState('stop');
  const [duration, setDuration] = useState(0);
  const [timePositino, setTimePosition] = useState(0);

  // 初期化
  useEffect(() => {
    audioCtxRef.current = new AudioContext();
    const elemSource = audioCtxRef.current.createMediaElementSource(audioRef.current);
    const analyser = audioCtxRef.current.createAnalyser();

    elemSource.connect(analyser).connect(audioCtxRef.current.destination);
    setSource(elemSource);
    setAnalyserNode(analyser);
  }, []);

  useEffect(() => {
    if(source && analyserNode && playState === 'play') {
      const canvas = spectrumRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const canvasCtx = canvas.getContext('2d');
      analyserNode.fftSize = 2048;
      const bufferLength = analyserNode.frequencyBinCount; // fftサイズの半分（1024）
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      function renderFrame() {
        requestAnimationFrame(renderFrame);

        analyserNode.getByteFrequencyData(dataArray);

        // canvasの初期化（黒潰し）
        canvasCtx.fillStyle = `rgb(30, 30, 30)`;
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength);
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i];
          const hue = (i / bufferLength) * 360;

          // canvasCtx.fillStyle = `hsl(${hue}, 20%, 50%)`;
          canvasCtx.fillStyle = `hsl(0, 0%, 80%)`;
          canvasCtx.fillRect(x, canvas.height, barWidth, -barHeight*2);

          x += barWidth + 1;
        }
      }

      renderFrame();
    }
  }, [playState])

  // 再生／停止
  const handleTogglePlay = () => {
    if(audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
      setPlayState('play');
    }

    if(playState === 'stop') {
      audioRef.current.play();
      setPlayState('play');
    }
    if(playState === 'play') {
      audioRef.current.pause();
      setPlayState('stop');
    }
  };

  // スライダー操作
  const handleTimeUpdate = () => {
    setTimePosition(audioRef.current.currentTime);
  }
  const handleChangeTimePosition = (event) => {
    const position = parseInt(event.target.value);
    setTimePosition(position);
    audioRef.current.currentTime = position;
  };

  const handleEnded = () => {
    setTimePosition(0);
    setPlayState('stop');
  };

  // 音声メタデータから時間を設定
  const handleLoadedMetadata = () => {
    const duration = audioRef.current.duration;
    setDuration(duration);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleTogglePlay}
      >
        {playState === 'stop' && '開始'}
        {playState === 'play' && '停止'}
      </button>
      <input
        type="range"
        ref={timePositonRef}
        min={0}
        max={duration}
        value={timePositino}
        onInput={handleChangeTimePosition}
      />
      <audio
        // src="/sample.m4a"
        src="/sample2.mp3"
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <canvas className="spectrum" ref={spectrumRef} />
    </>
  );
}

export default AudioApp2ForInput;