import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

// Web Audio API
function AudioApp() {
  const audioContext = useRef(null);

  const [audioBuffer, setAudioBuffer] = useState(null);

  useEffect(() => {
    audioContext.current = new AudioContext();
  }, []);

  const handleChangeFile = async (event) => {
    const _file = event.target.files[0];

    // Web Audio API の AudioBuffer オブジェクトに変換
    const _audioBuffer = await audioContext.current.decodeAudioData(
      await _file.arrayBuffer()
    );

    setAudioBuffer(_audioBuffer);

    console.log(event);
    console.log(_file.size);
  }

  const handleClickPlay = () => {
    if(audioContext.current.state === "suspend") {
      audioContext.current.resume();
    }

    const soudeNode = audioContext.current.createBufferSource();
    soudeNode.buffer = audioBuffer;

    soudeNode.connect(audioContext.current.destination);

    soudeNode.start();
  }

  return (
    <div>
      <input type="file" onChange={handleChangeFile} />
      <button onClick={handleClickPlay}>再生</button>
    </div>
  );

}

export default AudioApp;