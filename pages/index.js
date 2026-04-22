import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const characters = [
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb1&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb2&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb3&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb4&size=128",
  "https://api.dicebear.com/7.x/fun-emoji/png?seed=blorb5&size=128"
];

export default function Home() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playing, setPlaying] = useState(false);
  const [blobPosition, setBlobPosition] = useState({ top: "50%", left: "50%" });
  const [character, setCharacter] = useState(characters[0]);
  const [level, setLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [particles, setParticles] = useState([]);
  const [plusOnes, setPlusOnes] = useState([]);

  const clickSound = useRef(null);
  const scoreSound = useRef(null);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3");
    scoreSound.current = new Audio("/sounds/score.mp3");
  }, []);

  const fetchLeaderboard = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setLeaderboard(data);
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 3000);
    return () => clearInterval(interval);
  }, []);

  const moveBlob = () => {
    setBlobPosition({
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 80}%`,
    });
    setCharacter(characters[Math.floor(Math.random() * characters.length)]);
  };

  useEffect(() => {
    let timer;
    if (playing && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setPlaying(false);
      saveScore();
    }
    return () => clearTimeout(timer);
  }, [playing, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setLevel(1);
    setPlaying(true);
    moveBlob();
  };

  const handleClickBlob = () => {
    clickSound.current?.play();

    const newScore = score + 1;
    setScore(newScore);

    if (newScore % 5 === 0) {
      setLevel((prev) => prev + 1);
      scoreSound.current?.play();
    }

    const id = Date.now();

    setPlusOnes((prev) => [...prev, { id, ...blobPosition }]);
    setTimeout(() => {
      setPlusOnes((prev) => prev.filter((p) => p.id !== id));
    }, 800);

    const newParticles = Array.from({ length: 6 }).map((_, i) => ({
      id: id + i,
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
      ...blobPosition,
    }));
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id < id));
    }, 600);

    moveBlob();
  };

  const saveScore = async () => {
    await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "player",
        wallet: "0x",
        score,
      }),
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center p-6 gap-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <div className="w-full h-full bg-[linear-gradient(120deg,transparent,white,transparent)]" />
      </motion.div>

      <h1 className="text-6xl font-bold z-10">BLORBS</h1>
      <p className="text-gray-400">Play. Compete. Earn your spot.</p>

      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md text-center relative h-72 overflow-hidden z-10">
        <p>Score: {score} | Level: {level}</p>
        <p>Time: {timeLeft}s</p>

        {!playing && (
          <button onClick={startGame} className="bg-white text-black px-4 py-2 rounded">
            Start
          </button>
        )}

        {playing && (
          <motion.img
            key={character + score}
            src={character}
            onClick={handleClickBlob}
            className="absolute w-16 h-16 cursor-pointer drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            style={{ top: blobPosition.top, left: blobPosition.left }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: Math.max(0.2, 0.6 - level * 0.05) }}
          />
        )}

        <AnimatePresence>
          {plusOnes.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              className="absolute text-green-400 font-bold"
              style={{ top: p.top, left: p.left }}
            >
              +1
            </motion.div>
          ))}
        </AnimatePresence>

        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y }}
            transition={{ duration: 0.5 }}
            style={{ top: p.top, left: p.left }}
          />
        ))}
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md z-10">
        <h2>Leaderboard</h2>
        {leaderboard.map((e, i) => (
          <p key={i}>{i + 1}. {e.name} - {e.score}</p>
        ))}
      </div>

      <p className="text-green-400">Top players earn whitelist access.</p>
    </div>
  );
      }
