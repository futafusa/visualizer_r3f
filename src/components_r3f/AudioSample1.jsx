import { useEffect, useRef, useState } from 'react';
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
  const refGrid = useRef();
  const refGroup = useRef();
  const FFT_SIZE = 64;

  // for audio
  const audioContext = useRef(null);
  const [analyser, setAnalyser] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0);

  // マイク入力のためのStreamSourceの作成
  const createStreamSource = async () => {
    const streamSource = await navigator.mediaDevices.getUserMedia({audio: true});
    audioContext.current = new AudioContext();
    const audioSourceNode = audioContext.current.createMediaStreamSource(streamSource);

    const analyserNode = audioContext.current.createAnalyser();
    analyserNode.fftSize = FFT_SIZE*2;
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

    // update mesh audio object
    for(let i = 0; i < refGroup.current.children.length; i++) {
      refGroup.current.children[i].position.y = dataArray[i]/255 * 2;
    }
  }

  const clickStartAudio = async () => {
    const streamData = await createStreamSource();
  }

  useFrame((state, delta) => {
    refCube.current.rotation.y -= delta * 0.2;
    refCube.current.rotation.z -= delta * 0.2;
    refGrid.current.rotation.y += delta * 0.1;
    refGroup.current.rotation.y += delta * 0.1;

    updateAudioData();
  });

  return <>
    {perfVisible ? <Perf position="top-left" /> : null}

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

    <mesh ref={refCube} castShadow position-y={2} scale={0.5 + audioVolume} onClick={clickStartAudio}>
      <boxGeometry />
      <meshStandardMaterial color={[0.5, 0.5, 0.5]} />
    </mesh>

    {/* <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" />
    </mesh> */}
    <group ref={refGroup}>
      {Array.from({length: FFT_SIZE}, (_, index) =>
        <mesh key={index} position={[(index/FFT_SIZE-0.5)*15, 0, 0]} scale={0.05}>
          <sphereGeometry />
          <meshStandardMaterial color="purple"/>
        </mesh>
      )}
    </group>

    <Grid ref={refGrid} position={[0, 0, 0]}  infiniteGrid={true} fadeDistance={20} />
  </>
}