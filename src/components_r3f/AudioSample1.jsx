import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Grid, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import Light from '../Light';

export default function AudioSample1() {
  // setting leva
  const  { perfVisible } = useControls({
    perfVisible: false,
  });
 
  // def ref
  const refCube = useRef();
  const audioContext = useRef(null);
  const [analyser, setAnalyser] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0);

  // マイク入力のためのStreamSourceの作成
  const createStreamSource = async () => {
    const streamSource = await navigator.mediaDevices.getUserMedia({audio: true});
    audioContext.current = new AudioContext();
    const audioSourceNode = audioContext.current.createMediaStreamSource(streamSource);

    const analyserNode = audioContext.current.createAnalyser();
    analyserNode.fftSize = 256;
    audioSourceNode.connect(analyserNode);

    setAnalyser(analyserNode);

    return {audioSourceNode, analyserNode};
  }

  const updateAudioData = () => {
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const peak = dataArray.reduce((max, sample) => {
      const currentValue = Math.abs(sample);
      return max > currentValue ? max : currentValue;
    })
    const rePeak = peak / 255;

    setAudioVolume(rePeak);
  }

  const clickObject = async () => {
    const streamData = await createStreamSource();
  }
  
  useFrame((state, delta) => {
    refCube.current.rotation.y += delta * 0.2;
    
    updateAudioData();
  });

  return <>
    { perfVisible ? <Perf position="top-left" /> : null }
    
    <OrbitControls makeDefault />

    <Light intensity={audioVolume} />

    <ContactShadows
      position={[0, -0.99, 0 ]}
      scale={10}
      color={'#000000'}
      opacity={0.5}
      blur={2}
    />

    {/* <color args={ ['#FFFFFF' ]} attach="background" /> */}
  
    <mesh ref={refCube} castShadow position-x={ 0 } scale={1 + audioVolume} onClick={clickObject}>
      <boxGeometry />
      <meshStandardMaterial color="white" />
    </mesh>

    {/* <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh> */}

    <Grid position={[0, -1, 0]}  infiniteGrid={true} fadeDistance={20} />

  </>
}