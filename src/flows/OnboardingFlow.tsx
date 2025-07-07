import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import animationData from '../assets/equal-ai-intro.json';

const OnboardingFlow: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [isGreyscale, setIsGreyscale] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  const handleAnimationComplete = useCallback(() => {
    if (lottieRef.current) {
      lottieRef.current.pause();
      setAnimationComplete(true);
    }
  }, []);

  useEffect(() => {
    if (animationComplete) {
      const timeout = setTimeout(() => setIsGreyscale(true), 1200); // matches move-to-top duration
      return () => clearTimeout(timeout);
    } else {
      setIsGreyscale(false);
    }
  }, [animationComplete]);

  return (
    <div className="h-full w-full bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
      
      {/* Lottie Animation Container */}
      <motion.div
        className="flex items-center justify-center"
        initial={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
          scale: 1
        }}
        animate={animationComplete ? {
          position: 'absolute',
          top: '-7%', // Just under the notch
          left: '50%',
          x: '-50%',
          y: '0%',
          scale: 0.6
        } : {}}
        transition={{
          duration: 1.2,
          ease: "easeInOut",
          delay: 0.3
        }}
        style={{
          filter: isGreyscale ? 'grayscale(1)' : 'none',
          transition: 'filter 0.7s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
                 <div className="w-80 h-60">
           <Lottie
             lottieRef={lottieRef}
             animationData={animationData}
             loop={false}
             autoplay={true}
             onComplete={handleAnimationComplete}
             style={{
               width: '100%',
               height: '100%'
             }}
           />
         </div>
      </motion.div>

      
    </div>
  );
};

export default OnboardingFlow; 