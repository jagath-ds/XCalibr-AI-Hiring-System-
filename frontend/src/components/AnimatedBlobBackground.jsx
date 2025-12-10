// src/components/AnimatedBlobBackground.jsx

export default function AnimatedBlobBackground() {
  return (
    <>
      {/* This style tag is now standard and will work correctly */}
      <style>{`
        .blob-motion {
          position: absolute;
          z-index: 0;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .blob {
          position: absolute;
          will-change: transform;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.3;
        }
        .blob-1 {
          width: 300px;
          height: 300px;
          background-color: #22c55e; /* primary green */
          animation: move 20s infinite alternate;
        }
        .blob-2 {
          width: 250px;
          height: 250px;
          background-color: #f9b52a; /* secondary yellow */
          animation: move 25s infinite alternate -5s;
        }
        .blob-3 {
          width: 200px;
          height: 200px;
          background-color: #3b82f6; /* A nice blue */
          animation: move 18s infinite alternate -10s;
        }

        @keyframes move {
          from {
            transform: translate(-100px, -50px) rotate(-90deg);
          }
          to {
            transform: translate(calc(100vw - 150px), calc(100vh - 150px)) rotate(90deg);
          }
        }
      `}</style>
      <div className="blob-motion">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
    </>
  );
}

