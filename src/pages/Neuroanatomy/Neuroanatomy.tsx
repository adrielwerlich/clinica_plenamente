import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Typography, Container, Box } from '@mui/material';
import { Canvas, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const HOVER_COLOR = 'orange';
const DEFAULT_COLOR = '#ccc';

type HoverInfo = {
  name: string;
  x: number;
  y: number;
} | null;

const LABELS: Record<string, string> = {
  "Brain_Part_04_Colour_Brain_Texture_0": "Hemisfério Esquerdo",
  "Brain_Part_06_Colour_Brain_Texture_0": "Hemisfério Direito",
  "Brain_Part_02_Colour_Brain_Texture_0": "Cerebelo",
  "Brain_Part_05_Colour_Brain_Texture_0": "Tronco Cerebral",
  "Brain_Part_01_Colour_Brain_Texture_0": "Glandula Pituitária",
};

const NeuroanatomyModel = ({ setHoverInfo }: { setHoverInfo: (info: HoverInfo) => void }) => {
  const { scene } = useGLTF('/models/brain_project.glb');
  // const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const { gl, camera } = useThree();
  const partRegex = /^Brain_Part_\d+$/;

  const [meshes, setMeshes] = useState<THREE.Mesh[]>([]);

  useEffect(() => {
    const found: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof THREE.Object3D && partRegex.test(child.name)) {
        child.traverse((subChild) => {
          if (subChild instanceof THREE.Mesh) {
            found.push(subChild);
          }
        });
      }
    });
    setMeshes(found);
  }, [scene]);

  useEffect(() => {
    meshes.forEach((mesh) => {
      // Only clone if not already cloned
      if (mesh.material && !mesh.material.userData.isCloned) {
        mesh.material = mesh.material.clone();
        mesh.material.userData.isCloned = true;
        mesh.material.color.set(DEFAULT_COLOR);
      }
    });
  }, [meshes]);

  return (
    <>
      {meshes.map((mesh) => (
        <primitive
          scale={1.8}
          position={[0, -1, -1.1]}
          key={mesh.uuid}
          object={mesh}
          onPointerOver={(e) => {
            e.stopPropagation();
            mesh.material.color.set(HOVER_COLOR);
            // Convert 3D position to 2D screen position
            const vector = mesh.getWorldPosition(new THREE.Vector3()).clone().project(camera);
            const x = ((vector.x + 1) / 2) * gl.domElement.clientWidth;
            const y = ((-vector.y + 1) / 2) * gl.domElement.clientHeight;
            setHoverInfo({ name: mesh.name, x, y });
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            mesh.material.color.set(DEFAULT_COLOR);
            setHoverInfo(null);
          }}
        />
      ))}
    </>
  );
};

const CortexPanel = () => (
  <Box
    sx={{
      minWidth: 220,
      maxWidth: 320,
      bgcolor: '#fafafa',
      borderRadius: 2,
      p: 2,
      ml: 0,
      boxShadow: 1,
      height: 'fit-content',
      position: 'absolute',
      alignSelf: 'flex-start'
    }}
  >
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
      Áreas Corticais
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ width: 24, height: 24, bgcolor: '#34A69E', borderRadius: 1, mr: 1 }} />
      <Box>
        <span>Frontal (Ciano)</span>
        <Typography variant="body2" sx={{ color: '#333' }}>
          Controle das outras áreas corticais, planejamento, tomada de decisão e movimentos voluntários.
        </Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ width: 24, height: 24, bgcolor: '#E0DD40', borderRadius: 1, mr: 1 }} />
      <Box>
        <span>Parietal (Amarelo)</span>
        <Typography variant="body2" sx={{ color: '#333' }}>
          Associação entre múltiplos inputs sensoriais, percepção tátil e integração sensorial.
        </Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ width: 24, height: 24, bgcolor: '#C32B2A', borderRadius: 1, mr: 1 }} />
      <Box>
        <span>Occipital (Vermelho)</span>
        <Typography variant="body2" sx={{ color: '#333' }}>
          Processamento das informações visuais e percepção da visão.
        </Typography>
      </Box>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: 24, height: 24, bgcolor: '#34B638', borderRadius: 1, mr: 1 }} />
      <Box>
        <span>Temporal (Verde)</span>
        <Typography variant="body2" sx={{ color: '#333' }}>
          Processamento auditivo, memória e compreensão da linguagem.
        </Typography>
      </Box>
    </Box>
  </Box>
);


const Neuroanatomy: React.FC = () => {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4, mb: 4 }}>
        Neuroanatomia Interativa
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>

        <Box
          ref={boxRef}
          sx={{
            width: '100%',
            height: '60vh',
            minHeight: '500px',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            overflow: 'hidden',
            mb: { xs: 4, md: 0 },
            flex: 1,
            position: 'relative'
          }}>
          <Canvas camera={{
            position: [10, 0, 0],
            fov: 25
          }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              <hemisphereLight
                groundColor={0x080820}
                intensity={0.3}
              />
              <NeuroanatomyModel setHoverInfo={setHoverInfo} />
              <Environment preset="city" />
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                autoRotate={false}
                minDistance={3}
                maxDistance={20}
              />
            </Suspense>
          </Canvas>
          {hoverInfo && (
            <Box
              sx={{
                position: 'absolute',
                left: hoverInfo.x,
                top: hoverInfo.y,
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: 14,
                transform: 'translate(-50%, -120%)',
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
            >
              {LABELS[hoverInfo.name] ?? hoverInfo.name}
            </Box>
          )}
        </Box>

        <CortexPanel />
      </Box>
      {/* 3D Model Canvas */}

      <Typography variant="body1" sx={{ mb: 2 }}>
        Explore o modelo 3D do cérebro acima. Use o mouse para:
      </Typography>
      <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
        <li>Rotacionar: Clique e arraste</li>
        <li>Zoom: Use a roda do mouse</li>
        <li>Mover: Clique com botão direito e arraste</li>
      </Typography>

      <Typography variant="body1" sx={{ mt: 3 }}>
        Este modelo interativo permite estudar a anatomia cerebral de forma detalhada,
        proporcionando uma experiência de aprendizado imersiva.
      </Typography>
    </Container>
  );
};

export default Neuroanatomy;