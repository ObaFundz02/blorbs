import { useState, useEffect } from "react";

const characters = [
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb1&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb2&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb3&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb4&size=128",
];

export default function Home() {
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [blobs, setBlobs] = useState([]);
  const [floating, setFloating] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // spawn blobs
  useEffect(() => {
    const interval = setInterval(() => {
      setBlobs((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * 80,
          y: Math.random() * 80,
          img: characters[Math.floor(Math.random() * characters.length)],
        },
      ]);
    }, Math.max(800 - level * 100, 200));

    return () => clearInterval(interval);
  }, [level]);

  // fetch leaderboard
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then(setLeaderboard);
  }, []);

  const clickBlob = (id, x, y) => {
    setScore((s) => s + 1);
    setBlobs((prev) => prev.filter((b) => b.id !== id));

    // level up
    if ((score + 1) % 10 === 0) setLevel((l) => l + 1);

    // floating +1
    const floatId = Date.now();
    setFloating((f) => [...f, { id: floatId, x, y }]);
    setTimeout(() => {
      setFloating((f) => f.filter((i) => i.id !== floatId));
    }, 800);

    // sound
    new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play();
  };

  return (
    <div>
      <style>{`
        body {
          margin:0;
          background:#0f172a;
          color:white;
          font-family:sans-serif;
          overflow:hidden;
        }

        .bg-lines {
          position:fixed;
          width:200%;
          height:200%;
          background: repeating-linear-gradient(
            45deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.05) 2px,
            transparent 2px,
            transparent 40px
          );
          animation: moveBg 20s linear infinite;
        }

        @keyframes moveBg {
          from { transform: translate(0,0); }
          to { transform: translate(-200px,-200px); }
        }

        .blob {
          position:absolute;
          width:80px;
          height:80px;
          cursor:pointer;
          animation: bounce 2s infinite;
          filter: drop-shadow(0 0 10px #8b5cf6);
        }

        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .float {
          position:absolute;
          color:#22c55e;
          font-weight:bold;
          animation: floatUp 0.8s forwards;
        }

        @keyframes floatUp {
          from { opacity:1; transform:translateY(0); }
          to { opacity:0; transform:translateY(-30px); }
        }

        .panel {
          position:fixed;
          top:10px;
          left:10px;
        }

        .leaderboard {
          position:fixed;
          top:10px;
          right:10px;
          background:#111827;
          padding:10px;
          border-radius:10px;
        }

        button {
          background:#7c3aed;
          border:none;
          padding:10px 20px;
          border-radius:10px;
          color:white;
          cursor:pointer;
        }
      `}</style>

      <div className="bg-lines"></div>

      <div className="panel">
        <h1>BLORBS</h1>
        <p>Score: {score} | Level: {level}</p>
        <p>Top players earn whitelist access.</p>
      </div>

      <div className="leaderboard">
        <h3>Leaderboard</h3>
        {leaderboard.map((p, i) => (
          <div key={i}>{p.name || "anon"}: {p.score}</div>
        ))}
      </div>

      {blobs.map((b) => (
        <img
          key={b.id}
          src={b.img}
          className="blob"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
          onClick={() => clickBlob(b.id, b.x, b.y)}
        />
      ))}

      {floating.map((f) => (
        <div
          key={f.id}
          className="float"
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
        >
          +1
        </div>
      ))}
    </div>
  );
  }
