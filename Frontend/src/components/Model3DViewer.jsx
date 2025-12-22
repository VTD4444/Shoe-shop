import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Center, Environment, ContactShadows, useProgress } from '@react-three/drei';

const Model = ({ fileName }) => {
  const path = `${process.env.PUBLIC_URL}/models_3d/${fileName}`;
  const { scene } = useGLTF(path);
  
  // Tối ưu Deep Clone: Chỉ clone khi cần thiết
  const primitive = useMemo(() => {
    return <primitive object={scene} scale={1.5} />;
  }, [scene]);

  return primitive;
};

const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-semibold text-gray-700">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  );
};

// Dùng React.memo để ngăn Component này render lại khi cha (ProductDetail) thay đổi state khác
const Model3DViewer = React.memo(({ fileName }) => {
  if (!fileName) return null;

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 relative rounded-lg overflow-hidden">
      <Canvas
        shadows={false}
        dpr={1} 
        frameloop="demand" 
        camera={{ position: [0, 0, 25], fov: 45 }}
        gl={{ 
          powerPreference: "high-performance", 
          antialias: false,
          preserveDrawingBuffer: true 
        }}
        performance={{ min: 0.5 }}
      >
        {/* Ánh sáng môi trường nhẹ */}
        <Environment preset="apartment" />
        
        {/* Ánh sáng đơn giản */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />

        <Suspense fallback={<Loader />}>
          <Center>
            <Model fileName={fileName} />
          </Center>
          
          {/* Bóng đổ tối ưu */}
          <ContactShadows 
            position={[0, -1.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={1.5} 
            far={2} 
          />
        </Suspense>

        <OrbitControls 
          makeDefault 
          enablePan={false}
          enableDamping={false}
          rotateSpeed={0.6}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          maxDistance={10}
        />
      </Canvas>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-gray-500 select-none">
        Kéo để xoay • Cuộn để Zoom
      </div>
    </div>
  );
});

export default Model3DViewer;