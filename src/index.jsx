import './style.css';
import ReactDOM from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import AudioSpectrum from './components/AudioSpectrum.jsx';
import AudioLevelMeter from './components/AudioLevelMeter.jsx';
import AudioSample1 from './components_r3f/AudioSample1.jsx';
import AudioSample2 from './components_r3f/AudioSample2.jsx';

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
  <>
    <Canvas
      shadows
      camera={ {
        fov: 45,
        near: 0.1,
        far: 200,
        position: [ 4, 2, 6 ]
      } }
    >
      <AudioSample2 />
    </Canvas>
    {/* <AudioSpectrum /> */}
    {/* <AudioLevelMeter /> */}
  </>
)