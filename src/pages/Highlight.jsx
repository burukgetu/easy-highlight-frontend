// src/VideoPlayer.js
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
// import { useParams } from 'react-router-dom';

const Highlight = () => {
  // const { videoId } = useParams(); // Get videoId from URL params
  const videoSrc = `https://hls.upfootvid.com/upfiles/source/hls/51/291545/manifest/0.m3u8?token=T0kzVUYxVFpKcmR6WThvY0FFOURpQXpRVkJ4WTR5SWVuZHVQTHR5bGxyUT06VXBGaWxlcy8yMDI0LzExLzEwLzUxLzI5MTU0NS8wLm0zdTg6aHR0cHMlM0ElMkYlMkZobHMudXBmb290dmlkLmNvbSUyRjo2Mzg2NzAzNjkxOTc5NTM3Nzc=&keypair=cmVyazE4dldoS01KaEd6ZjRSand1N1VXV1dJY1I2eUE4c2NLQlNRZlI1dz06VXBGaWxlcy8yMDI0LzExLzEwLzUxLzI5MTU0NS86aHR0cHMlM0ElMkYlMkZobHMudXBmb290dmlkLmNvbSUyRjo2Mzg2NzAzNjkxOTc5NTM3Nzc=`; // Replace with actual video source
  
  const videoRef = useRef(null); // Reference to video element
  const [controlsVisible, setControlsVisible] = useState(true); // Track visibility of controls

  // Set up the HLS player and handle video playback
  useEffect(() => {
    const video = videoRef.current;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    } else {
      alert('Your browser does not support HLS playback.');
    }

    // Cleanup on unmount
    return () => {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.destroy();
      }
    };
  }, [videoSrc]);

  // Handle double-tap (double-click) to skip 5 seconds
  const handleDoubleClick = (e) => {
    const video = videoRef.current;
    if (video) {
      const skipTime = 5;
      const rect = video.getBoundingClientRect();
      const isLeftSide = e.clientX < rect.left + rect.width / 2; // Detect if double-tapped on the left side
      if (isLeftSide) {
        video.currentTime -= skipTime; // Skip backward by 5 seconds
      } else {
        video.currentTime += skipTime; // Skip forward by 5 seconds
      }
      setControlsVisible(true); // Ensure controls appear when the user interacts
    }
  };

  // Hide controls after 3 seconds of inactivity
  const hideControls = () => {
    setControlsVisible(false);
  };

  // Reset the hide controls timer every time the user interacts with the video
  const resetHideTimer = () => {
    if (controlsVisible) return; // Don't reset if controls are already visible
    setControlsVisible(true);
    setTimeout(hideControls, 3000); // Set a timeout to hide controls after 3 seconds
  };

  return (
    <div
      id="player-container"
      style={{
        position: 'relative',
        maxWidth: '100%',
        margin: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onClick={resetHideTimer} // Reset the timer on video click
    >
      <video
        ref={videoRef}
        controls={controlsVisible} // Show/hide controls dynamically
        onDoubleClick={handleDoubleClick} // Double-click to skip forward or backward
        onPlay={resetHideTimer} // Reset controls visibility on play
        onPause={resetHideTimer} // Reset controls visibility on pause
        style={{ width: '100%', height: 'auto' }}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
};

export default Highlight;
