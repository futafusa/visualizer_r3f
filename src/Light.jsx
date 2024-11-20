import { Environment, Lightformer, Sky } from "@react-three/drei";
import { useControls } from "leva";

export default function Light(props) {
  const { sunPosition } = useControls('sky', {
    sunPosition: { value: [1, 2, 3] }
  });

  return <>
   <directionalLight
      castShadow
      position={ sunPosition }
      intensity={ 1.5 + props.intensity }
      shadow-mapSize={ [ 1024, 1024 ] }
      shadow-camera-near={ 1 }
      shadow-camera-far={ 10 }
      shadow-camera-top={ 10 }
      shadow-camera-right={ 10 }
      shadow-camera-bottom={ - 10 }
      shadow-camera-left={ - 10 }
    />
    <ambientLight intensity={ props.intensity } />
    {/* <Sky sunPosition={ sunPosition } /> */}

    {/* <Environment background preset="city">
      <Lightformer 
        position-z={ -5 }
        scale={ 4 }
        color={ 'red' }
        intensity={ 10 }
        form={ 'ring' }
      />
    </Environment> */}
  </>;
}