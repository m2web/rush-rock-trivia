
import React, { useEffect, useRef, useState } from "react";

const PassingTheSticks: React.FC = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentScene < 2) {
        setCurrentScene(currentScene + 1);
      }
    }, currentScene === 0 ? 3000 : currentScene === 1 ? 2500 : 0);

    if (currentScene === 2 && audioRef.current) {
      audioRef.current.play();
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
          <>
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
          </>
        )}
        
        {currentScene === 1 && (
          <img 
            src="/images/passingthesticks/kit_transition_overlay.png" 
            alt="Kit transition overlay" 
            style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
          />
        )}
        
        {currentScene === 2 && (
          <img 
            src="/images/passingthesticks/anika.png" 
            alt="Anika Nilles behind the drums" 
            style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
          />
        )}
      </div>
      
      <audio ref={audioRef} src="/audio/passingthesticks/narrator_voice.mp3" preload="auto" />
    </section>
  );
};

export default PassingTheSticks;
