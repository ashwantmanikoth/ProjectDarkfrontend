"use client"
import React from 'react';

interface AnimatedHeadingProps {
  lines: string[];
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({ lines}) => {
  return (
    <div className="text-center">
      {lines.map((line, index) => (
        <h1
          key={index}
          className="text-4xl font-bold opacity-0"
          style={{
            animation: `fadeIn 0.5s ease forwards`,
            animationDelay: `${index * 1}s`,
          }}
        >
          {line}
        </h1>
      ))}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedHeading;