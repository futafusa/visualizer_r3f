import { useEffect, useRef, useState } from "react";

function AudioApp3() {
  const audioContext = useRef(null);
  const spectrumRef = useRef(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [source, setSource] = useState(null);
  const [analyserNode, setAnalyserNode] = useState(null);
  const [playState, setPlayState] = useState(false);

  // 初期化
  useEffect(() => {  
    audioContext.current = new AudioContext();

    (async () => {
      const _audioBuffer = await loadSound("/sample2.mp3");
      setAudioBuffer(_audioBuffer);
    })();
  }, []);

  const loadSound = async (url) => {
    const responce = await fetch(url);
    const arrayBuffer = await responce.arrayBuffer();

    // Web Audio APIで使える形式に変換
    const _audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
    return _audioBuffer;
  }

  const playSound = () => {
    if(playState) return;
    
    // ソースの作成と、ソースへ変換されたバッファーを音源として設定
    const _source = audioContext.current.createBufferSource();
    _source.buffer = audioBuffer;

    // GrainNode
    // const gainNode = audioContext.current.createGain();
    // gainNode.gain.value = 0.1;
    // _source.connect(gainNode);

    // BiquadFilter
    // const filter = audioContext.current.createBiquadFilter();
    // filter.type = 'lowpass';
    // filter.frequency.value = 440;
    // _source.connect(filter);

    // analyserノードの作成と接続（コネクト）
    const _analyser = audioContext.current.createAnalyser();
    _source.connect(_analyser);

    // 最終出力への接続（destination）
    _analyser.connect(audioContext.current.destination)

    // 再生
    _source.start();

    setSource(_source);
    setAnalyserNode(_analyser);
    setPlayState(true);
  }

  const stopSound = () => {
    source.stop();
    setPlayState(false);
  }

  useEffect(() => {
    if(playState === true) {
      const canvas = spectrumRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const canvasContext = canvas.getContext('2d');

      analyserNode.fftSize = 512;
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
          const barHeight = dataArray[i];
          
          canvasContext.fillStyle = `#FFF`;
          canvasContext.fillRect(x, canvas.height, barWidth, -barHeight);

          x += barWidth;
        }
      }

      drawGraph();
    }
  }, [playState])

  return (
    <>
      <button onClick={playSound}>PLAY</button>
      <button onClick={stopSound}>STOP</button>
      <canvas ref={spectrumRef}></canvas>
    </>
  );
}

export default AudioApp3;