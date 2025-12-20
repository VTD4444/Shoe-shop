import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

const ShoeTryOn = forwardRef((props, ref) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        console.log("🎥 Đang yêu cầu quyền truy cập camera...");

        // Yêu cầu quyền truy cập camera sau (environment) hoặc trước (user)
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }, // Ưu tiên camera sau
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        streamRef.current = stream; // Lưu stream reference
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("✅ Camera đã được kích hoạt!");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Lỗi khi truy cập camera:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    startCamera();

    // Cleanup: Tắt camera khi component unmount
    return () => {
      stopCamera();
    };
  }, []);

  // Function để tắt camera
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log("🛑 Camera track đã được tắt:", track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Expose stopCamera function qua ref
  useImperativeHandle(ref, () => ({
    stopCamera
  }));

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
            <p className="text-lg">Đang khởi động camera...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-10">
          <div className="text-white text-center max-w-md px-4">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold mb-2">Không thể truy cập camera</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400">Vui lòng cho phép truy cập camera trong cài đặt trình duyệt</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Overlay hướng dẫn */}
      {!loading && !error && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-full">
          <p className="text-sm font-medium">📱 Hướng camera về phía chân của bạn</p>
        </div>
      )}
    </div>
  );
});

export default ShoeTryOn;