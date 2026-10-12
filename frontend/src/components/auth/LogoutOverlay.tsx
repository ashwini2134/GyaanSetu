import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./LogoutOverlay.css";

interface LogoutOverlayProps {
  /** Called once the door-closing animation has finished — perform the real logout here. */
  onComplete: () => void;
}

/**
 * Full-screen transition shown between "Sign out" being clicked and the actual
 * logout/redirect happening — the door swings shut instead of the page just
 * vanishing. Starts mid-swing (as if you're already stepping through), closes
 * over ~2s, holds for a beat, then hands off to `onComplete` at the 5s mark —
 * which takes you back to the landing page, not the login screen.
 */
export default function LogoutOverlay({ onComplete }: LogoutOverlayProps) {
  const [closed, setClosed] = useState(false);
  const [farewell, setFarewell] = useState(false);

  useEffect(() => {
    const closeTimer = setTimeout(() => setClosed(true), 100);
    const farewellTimer = setTimeout(() => setFarewell(true), 2200);
    const doneTimer = setTimeout(onComplete, 5000);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(farewellTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div className="logout-overlay">
      <div className="logout-overlay__frame">
        <motion.div
          className="logout-overlay__beam"
          animate={{ opacity: closed ? 0 : 1 }}
          transition={{ duration: 1.2, ease: "easeIn" }}
        />
        <div className="logout-overlay__jamb" />
        <div className="logout-overlay__doorway" />
        <motion.div
          className="logout-overlay__door"
          initial={{ rotateY: -115 }}
          animate={{ rotateY: closed ? 0 : -115 }}
          transition={{ type: "tween", duration: 1.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="logout-overlay__hinge logout-overlay__hinge--top" />
          <div className="logout-overlay__hinge logout-overlay__hinge--mid" />
          <div className="logout-overlay__hinge logout-overlay__hinge--bottom" />
          <div className="logout-overlay__door-panel logout-overlay__door-panel--top" />
          <div className="logout-overlay__door-panel logout-overlay__door-panel--bottom" />
          <div className="logout-overlay__knob-plate">
            <div className="logout-overlay__knob" />
          </div>
        </motion.div>
      </div>
      <motion.p
        className="logout-overlay__text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {farewell ? "See you soon!" : "Signing you out…"}
      </motion.p>
    </div>
  );
}
