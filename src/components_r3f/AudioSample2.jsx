import { useEffect, useRef, useState } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial, Grid, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import Light from '../Light';

const TestShader = shaderMaterial(
  {
    uTime: 0,
  },
  /*glsl*/`
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += sin(modelPosition.z * 2.0 + uTime*2.0) * cos(uTime) * 0.4;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    vUv = uv;
  }
  `, 
  /*glsl*/`
  varying vec2 vUv;
  void main() {
    float strength = 1.0 - vUv.y;
    gl_FragColor = vec4(vec3(strength), 1.0);
  }
  `
);
extend({TestShader});

function AudioSample2() {
  // setting leva
  const  { perfVisible } = useControls({
    perfVisible: false,
  });

  // def ref
  const refCube = useRef();
  const refTestShader = useRef();

  useFrame((state, delta) => {
    refTestShader.current.uTime += delta;
  })

  return <>
    {perfVisible ? <Perf position="top-left" /> : null}

    <OrbitControls makeDefault />
    <Light />

    <mesh ref={refCube} scale={1} rotation={[-Math.PI/2, 0 , 0]}>
      <planeGeometry args={[4, 10, 20, 50]} />
      <testShader ref={refTestShader} wireframe />
    </mesh>

    <Grid position={[0, 0, 0]}  infiniteGrid={true} fadeDistance={20} />
  </>
}

export default AudioSample2;