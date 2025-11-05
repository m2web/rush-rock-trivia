
import React, { useEffect, useRef, useState } from "react";

const PassingTheSticks: React.FC = () => {
  const [scene0Opacity, setScene0Opacity] = useState(1);
  const [scene1Opacity, setScene1Opacity] = useState(0);
  const [scene2Opacity, setScene2Opacity] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Scene 0 (Neil) shows for 3 seconds, then fades out while Scene 1 fades in
    const timer1 = setTimeout(() => {
      setScene0Opacity(0); // Start fade out
      setScene1Opacity(1); // Start fade in simultaneously
    }, 3000);

    // Scene 1 (Kit) shows for 3 seconds after fade-in completes, then fades out while Scene 2 fades in
    const timer2 = setTimeout(() => {
      setScene1Opacity(0); // Start fade out
      setScene2Opacity(1); // Start fade in simultaneously
    }, 9000); // 3s display + 6s transition = 9s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Audio will start automatically when the component loads due to autoPlay attribute

  return (
    <section 
      id="passing-the-sticks" 
      style={{ 
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
        {/* Scene 0: Neil - Always rendered, controlled by scene0Opacity */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: "1rem",
          opacity: scene0Opacity,
          transition: "opacity 6s ease-in-out"
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
        
        {/* Scene 1: Kit transition - Always rendered, controlled by scene1Opacity */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: "1rem",
          opacity: scene1Opacity,
          transition: "opacity 6s ease-in-out"
        }}>
          <img 
            src="/images/passingthesticks/kit_transition_overlay.png" 
            alt="Kit transition overlay" 
            style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
          />
        </div>
        
        {/* Scene 2: Anika - Always rendered, controlled by scene2Opacity */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: "1rem",
          opacity: scene2Opacity,
          transition: "opacity 6s ease-in-out"
        }}>
          <img 
            src="/images/passingthesticks/anika.png" 
            alt="Anika Nilles behind the drums" 
            style={{ width: "100%", maxWidth: "900px", margin: "0 auto", opacity: 0.8 }} 
          />
        </div>
      </div>
      
      <audio ref={audioRef} src="/audio/passingthesticks/narrator_voice.mp3" preload="auto" autoPlay />
    </section>
  );
};

export default PassingTheSticks;
