// src/VideoPlayer.js
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize, Shrink } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Lottie from 'react-lottie';
import animationData from '/src/ball-animation.json';

const Highlight = () => {
  const { title } = useParams();
  // const id = '673513cbced6d78cb22e00c0';
  const apiUrl = import.meta.env.VITE_API_URL;

  const [isInnerFullScreen, setIsInnerFullScreen] = useState(false);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [date, setDate] = useState(false);
  const [is720, setIs720] = useState(true);

  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleMediaQueryChange = () => setIsMobile(mediaQuery.matches);
    handleMediaQueryChange();
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.get(`${apiUrl}/alternate/${title}`);
        const item = response.data;
        setMatch(item)
        const dateStr = item.createdAt;
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        setDate(formattedDate);
        console.log(item)
        setVideoSrc(item.vidSrc.replace("http","https")); // Set the video source from the matched item
      } catch (error) {
        setError('Please Try Again', error);
        window.location.reload();
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [title]);

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hlsRef.current = hls;

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
      } else {
        alert('Your browser does not support HLS playback.');
      }
    }
  }, [videoSrc]);

  const handleQualityChange = (quality) => {
    if (hlsRef.current) {
      const levels = hlsRef.current.levels;

      // Find the level index based on the quality
      const levelIndex = levels.findIndex((level) => level.height === quality);

      if (quality === 720) {
        setIs720(true);
      } else {
        setIs720(false);
      }
      if (levelIndex !== -1) {
        hlsRef.current.currentLevel = levelIndex; // Set the current level to the selected quality
      } else {
        alert(`Quality ${quality}p not available`);
      }
    } else {
      alert('HLS instance is not initialized.');
    }
  };

  const toggleInnerFullScreen = () => {
    setIsInnerFullScreen(!isInnerFullScreen);
  };

  if (loading) return (
    <div className="App anim">
      <Lottie options={{ animationData, loop: true }} height={400} width={400} />
    </div>
  );
  if (error) return <p>{error}</p>;

  // console.log(match)
  return (
    <>
      <div
        id="player-container"
        style={{
          position: 'relative',
          width: isInnerFullScreen ? '100vw' : isMobile ? "100%" : '60%',
          height: isInnerFullScreen ? '100vh' : 'auto',
          maxWidth: '100%',
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: isInnerFullScreen ? 'black' : 'transparent',
        }}
      >
        <video
          ref={videoRef}
          controls
          style={{
            width: isInnerFullScreen ? '100vh' : '100%',
            height: isInnerFullScreen ? '100vw' : 'auto',
            transform: isInnerFullScreen ? 'rotate(90deg)' : 'none',
            objectFit: 'fill',
            transition: 'width 0.3s, height 0.3s, transform 0.3s',
            marginTop: isMobile ? "0" : "70px"
          }}
          className='video'
        >
          Your browser does not support the video element.
        </video>
      </div>
      <button
        onClick={toggleInnerFullScreen}
        style={{
          position: isInnerFullScreen ? "" : 'absolute',
          // padding: '0 20px',
          marginRight: isInnerFullScreen ? "" : "2vw",
          right: isInnerFullScreen ? "" : "0",
          fontSize: '10px',
          cursor: 'pointer',
          backgroundColor: isInnerFullScreen ? "none" : 'none',
          color: isInnerFullScreen ? 'white' : 'black',
          borderRadius: "10px",
          border: 'none',
          width: isInnerFullScreen ? "" : "auto",
          height: isInnerFullScreen ? "" : "",
          // border: "5px solid red",
          zIndex: 10,
        }}
        className="fullscreen-btn"
      >
        {isInnerFullScreen ? (
          <div style={{ 
            // position: "relative",
            display: 'flex',
            gap: '5px',
            alignItems: 'center', 
            transform: 'translate(82vw, -10vh) rotate(90deg)',
            // border: "5px solid red",
            color: 'white',
          }}>
            <Shrink style={{ marginRight: '10px' }} />
            {/* <p>Exit FullScreen</p> */}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <Maximize size={17} />
            <p style={{ fontSize: "12px"}}>Fullscreen</p>
          </div>
        )}
      </button>

      <div className='qua-list'>
        Quality:
          <button
            className='qua' 
            style={{ 
              backgroundColor: is720 ? "" : "rgb(243, 100, 100)",
              color: !is720 ? "antiquewhite" : "black",
              border: "0"
            }} 
            onClick={() => handleQualityChange(360)}
          >
            360p
          </button>
          <button
            className='qua' 
            style={{ 
              backgroundColor: is720 ? "rgb(243, 100, 100)" : "",
              color: is720 ? "antiquewhite" : "black",
              border: "0"
            }} 
            onClick={() => handleQualityChange(720)}
          >
              720p
          </button>
      </div>
      {/* <div style={{ backgroundColor: 'black', width: '100%', height: '2px', marginTop: "20px" }}></div> */}
      {match && (
        <div className='details'>
          <h1 className='title'>{match.title.replace(/_/g, ' ')}</h1>
          <div className='league-list'>
            <h2 className='league'>{match.leagueType.replace(/_/g, ' ')}</h2>
            <h2 className='league'>{match.keyWords[0].replace(/_/g, ' ')}</h2>
            <h2 className='league'>{match.keyWords[1].replace("__Highlights_Video","").replace("_"," ")}</h2>
          </div>
          <p className='date'>{date}</p>
        </div>
      )}
    </>
  );
};

export default Highlight;


// useEffect(() => {
//   const video = videoRef.current;
//   if (!video || !videoSrc) return;

//   // Save the current time before changing the video source
//   const currentTime = video.currentTime;

//   const loadVideo = () => {
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(videoSrc);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         // After the manifest is parsed, set the video time
//         video.currentTime = currentTime;
//       });

//       return () => {
//         hls.destroy();
//       };
//     } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//       video.src = videoSrc;
//       // Immediately set the time after changing the source
//       video.currentTime = currentTime;
//     } else {
//       alert('Your browser does not support HLS playback.');
//     }
//   };

//   loadVideo();

//   // Cleanup when the component unmounts or when videoSrc changes
//   return () => {
//     if (videoSrc && Hls.isSupported()) {
//       // If HLS was used, destroy the instance
//       const hls = new Hls();
//       hls.destroy();
//     }
//   };
// }, [videoSrc]);