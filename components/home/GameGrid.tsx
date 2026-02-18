"use client";

import Image from "next/image";

export default function GameGrid() {
  const games = [
    { name: "Mobile Legends", image: "https://i.ibb.co.com/9wX5jZm/ml.png", popular: true },
    { name: "Free Fire", image: "https://i.ibb.co.com/yhRfk3L/ff.png", popular: true },
    { name: "PUBG Mobile", image: "https://i.ibb.co.com/fSLq9YH/pubg.png", popular: true },
    { name: "Genshin Impact", image: "https://i.ibb.co.com/YdBvqLZ/genshin.png", popular: true },
    { name: "Roblox", image: "https://i.ibb.co.com/k8sFvHN/roblox.png", popular: false },
    { name: "Valorant", image: "https://i.ibb.co.com/sH7p8WY/valorant.png", popular: false },
    { name: "Call of Duty", image: "https://i.ibb.co.com/d6NqZ3m/cod.png", popular: false },
    { name: "Arena of Valor", image: "https://i.ibb.co.com/HPfYg2J/aov.png", popular: false },
    { name: "Honor of Kings", image: "https://i.ibb.co.com/ZxtRv9n/hok.png", popular: false },
    { name: "Magic Chess", image: "https://i.ibb.co.com/fYbHq8B/magic-chess.png", popular: false },
    { name: "Soul Land", image: "https://i.ibb.co.com/j8Zy3Hq/soul-land.png", popular: false },
    { name: "Blood Strike", image: "https://i.ibb.co.com/LNjtGZy/blood-strike.png", popular: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Pilih Game</h3>
        <button className="text-sm text-purple-600 font-semibold">Lihat Semua →</button>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3">
        {games.map((game, idx) => (
          <button
            key={idx}
            className="flex flex-col items-center gap-2 bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow relative"
          >
            {game.popular && (
              <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                HOT
              </div>
            )}
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
              <Image
                src={game.image}
                alt={game.name}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 25vw"
              />
              <div className="absolute bottom-1 right-1 bg-purple-600 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-700 text-center leading-tight">
              {game.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
