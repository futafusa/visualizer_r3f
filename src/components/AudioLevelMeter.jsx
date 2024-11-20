import { css } from "@emotion/react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";

function AudioLevelMeter() {
  const Meter = css({
    border: "1px solid white",
    width: "100%"
  });

  const Volume = css({
    height: "10px",
    background: "white",
    transition: "width 0.1s",
    width: "0%"
  });
  
  const audioContext = useRef(null);
  const audioVolume = useRef(null);
  const [analyser, setAnalyser] = useState(null);
  const [playState, setPlayState] = useState(false);

  const playVolume = async (event) => {
    const streamData = await createStreamSource();  
    setAnalyser(streamData.analyserNode);
    setPlayState(true);
  }

  const createStreamSource = async () => {
    const streamSource = await navigator.mediaDevices.getUserMedia({audio: true});
    audioContext.current = new AudioContext();
    const audioSourceNode = audioContext.current.createMediaStreamSource(streamSource);

    const analyserNode = audioContext.current.createAnalyser();
    audioSourceNode.connect(analyserNode);

    return {audioSourceNode, analyserNode};
  }

  const stopVolume = () => {
    if(audioContext.current) {
      audioContext.current.close();
      setPlayState(false);
    }
  } 

  useEffect(() => {
    if(playState === true) {
      analyser.fftSize = 32;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateMeter() {
        requestAnimationFrame(updateMeter);
        analyser.getByteFrequencyData(dataArray);

        const peak = dataArray.reduce((max, sample) => {
          const currentValue = Math.abs(sample);
          return max > currentValue ? max : currentValue;
        })
        const rePeak = peak / 255 * 100;

        audioVolume.current.style = `width: ${rePeak}%`;
        audioVolume.current.style.background = rePeak < 99 ? 'back' : 'red';
      }

      updateMeter();
    }
  }, [playState])

  return (
    <>
      <div css={Meter}>
        <div ref={audioVolume} css={Volume}></div>
      </div>
      <button onClick={playVolume}>MIC ON</button>
      <button onClick={stopVolume}>MIC OFF</button>
    </>
  );
}

export default AudioLevelMeter;