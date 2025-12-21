import React, { useEffect, useRef } from 'react';
import * as deepar from 'deepar';

const ShoeTryOn = () => {
  const deepARRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const startDeepAR = async () => {
      if (deepARRef.current) return;

      try {
        console.log("Đang khởi động DeepAR...");

        const deepARInstance = await deepar.initialize({
          licenseKey: 'mm',
          previewElement: canvasRef.current,

          effect: '/effects/test.deepar',

          // CẤU HÌNH CAMERA SAU (Bắt buộc cho thử giày)
          additionalOptions: {
            cameraConfig: {
              facingMode: 'environment', // Camera sau
              disableDefaultCamera: false
            },
            hint: "footInit" // Gợi ý cho AI tìm chân nhanh hơn
          }
        });

        deepARRef.current = deepARInstance;
        console.log("DeepAR đã chạy thành công!");

      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      }
    };

    startDeepAR();

    return () => {
      if (deepARRef.current) {
        deepARRef.current.shutdown();
        deepARRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      { }
      <div
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default ShoeTryOn;