import { useEffect, useRef } from 'react';

const useWebcam = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          videoRef.current.srcObject = stream;
        });
    }
  }, []);

  return videoRef;
};

export default useWebcam;
