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
  const id = '673513cbced6d78cb22e00c0';
  const apiUrl = import.meta.env.VITE_API_URL;

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [date, setDate] = useState(false);

  const videoRef = useRef(null);
  const [isInnerFullScreen, setIsInnerFullScreen] = useState(false);

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
        const response = await axios.get(`${apiUrl}/match/${id}/${title}`);
        const item = response.data;
        setMatch(item)
        const dateStr = item.createdAt;
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        setDate(formattedDate);
        console.log(formattedDate)
        setVideoSrc(item.url); // Set the video source from the matched item
      } catch (error) {
        setError('Please Try Again', error);
        window.location.reload();
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id, title]);

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
      } else {
        alert('Your browser does not support HLS playback.');
      }
    }
  }, [videoSrc]);

  const toggleInnerFullScreen = () => {
    setIsInnerFullScreen(!isInnerFullScreen);
  };

  if (loading) return (
    <div className="App anim">
      <Lottie options={{ animationData, loop: true }} height={400} width={400} />
    </div>
  );
  if (error) return <p>{error}</p>;

  console.log(match)
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
          position: 'absolute',
          padding: '10px 20px',
          fontSize: '10px',
          cursor: 'pointer',
          background: 'none',
          color: isInnerFullScreen ? 'white' : 'black',
          border: 'none',
          zIndex: 10,
        }}
        className="fullscreen-btn"
      >
        {isInnerFullScreen ? (
          <div style={{ 
            display: 'flex',
            gap: '5px',
            alignItems: 'center', 
            transform: 'translateY(-50px)',
            color: 'white'
          }}>
            <Shrink style={{ marginRight: '10px' }} />
            <p>Exit FullScreen</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginBottom: '18px' }}>
            <Maximize size={17} />
            <p>Fullscreen</p>
          </div>
        )}
      </button>
      {/* <div style={{ backgroundColor: 'black', width: '100%', height: '2px', marginTop: "20px" }}></div> */}
      {match && (
        <div className='details'>
          <h1 className='title'>{match.title.replace(/_/g, ' ')}</h1>
          <div className='league-list'>
            <h2 className='league'>{match.leagueType.replace(/_/g, ' ')}</h2>
            <h2 className='league'>{match.teamNames[0].replace(/_/g, ' ')}</h2>
            <h2 className='league'>{match.teamNames[1].replace("__Highlights_Video","").replace("_"," ")}</h2>
          </div>
          <p className='date'>{date}</p>
        </div>
      )}
    </>
  );
};

export default Highlight;
