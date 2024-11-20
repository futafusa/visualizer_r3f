import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import Light from '../Light';

export default function Scene001() {
  // setting leva
  const  { perfVisible } = useControls({
    perfVisible: false,
  });
  const { envMapIntensity } = useControls('env map', {
    envMapIntensity: { value: 1.2, min: 0, max: 12}
  });

  // def ref
  const refCube = useRef();

  useFrame((state, delta) => {
    refCube.current.rotation.y += delta * 0.2;
  });

  return <>
    { perfVisible ? <Perf position="top-left" /> : null }
    
    <OrbitControls makeDefault />

    <Light />

    <ContactShadows
      position={ [0, -0.99, 0 ]}
      scale={ 10 }
      color={ '#000000' }
      opacity={ 0.5 }
      blur={ 2 }
    />

    {/* <color args={ ['#FFFFFF' ]} attach="background" /> */}
  
    <mesh castShadow  position-x={ - 2 }>
      <sphereGeometry />
      <meshStandardMaterial color="orange" envMapIntensity={ envMapIntensity } />
    </mesh>

    <mesh ref={ refCube } castShadow position-x={ 2 } scale={ 1.5 }>
      <boxGeometry />
      <meshStandardMaterial color="mediumpurple" envMapIntensity={ envMapIntensity } />
    </mesh>

    <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
      <planeGeometry />
      <meshStandardMaterial color="greenyellow" envMapIntensity={ envMapIntensity } />
    </mesh>

  </>
}