
import React, { useEffect, useRef, useState } from "react";

const PassingTheSticks: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (currentScene === 0) {
      // Neil shows for 3 seconds, then fade out
      timer = setTimeout(() => {
        setOpacity(0);
        // After fade out, switch to next scene and fade in
        setTimeout(() => {
          setCurrentScene(1);
          setOpacity(1);
        }, 1000);
      }, 3000);
    } else if (currentScene === 1) {
      // Transition shows briefly, then fade out
      timer = setTimeout(() => {
        setOpacity(0);
        // After fade out, switch to final scene and fade in
        setTimeout(() => {
          setCurrentScene(2);
          setOpacity(1);
          if (audioRef.current) {
            audioRef.current.play();
          }
        }, 1000);
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [currentScene]);

  return (
    <section id="passing-the-sticks" style={{ 
      position: "relative", 
      minHeight: "100vh", 
      background: "#000", 
      color: "#ccc", 
      overflow: "hidden" 
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
        <img 
          src="/images/passingthesticks/red_star_bg.png" 
          alt="Rush Red Star Logo Background" 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </div>
      
      <div style={{ 
        position: "relative", 
        width: "100%", 
        height: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "1rem"
      }}>
        {currentScene === 0 && (
          <div style={{
            opacity: opacity,
            transition: "opacity 1s ease-in-out"
          }}>
            <img 
              src="/images/passingthesticks/neil.png" 
              alt="Neil Peart behind the drums" 
              style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
            />
            <blockquote style={{ 
              marginTop: "2rem", 
              fontSize: "1.25rem", 
              fontStyle: "italic", 
              color: "#ccc", 
              maxWidth: "600px" 
            }}>
              "What is a master but a master student? And if that's true, then there's a responsibility on you to keep getting better and to explore avenues of your profession."
              <footer style={{ marginTop: "1rem", color: "#e3342f", fontWeight: "bold" }}>
                - Neil Peart
              </footer>
            </blockquote>
          </div>
        )}
        
        {currentScene === 1 && (
          <div style={{
            opacity: opacity,
            transition: "opacity 1s ease-in-out"
          }}>
            <img 
              src="/images/passingthesticks/kit_transition_overlay.png" 
              alt="Kit transition overlay" 
              style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
            />
          </div>
        )}
        
        {currentScene === 2 && (
          <div style={{
            opacity: opacity,
            transition: "opacity 1s ease-in-out"
          }}>
            <img 
              src="/images/passingthesticks/anika.png" 
              alt="Anika Nilles behind the drums" 
              style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
            />
          </div>
        )}
      </div>
      
      <audio ref={audioRef} src="/audio/passingthesticks/narrator_voice.mp3" preload="auto" />
    </section>
  );
};

export default PassingTheSticks;
