import React from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

interface Player {
  id: number;
  name: string;
  life: number;
}
interface DashboardProps {
  players: Player[];
  onLifeChange: (playerId: number, amount: number) => void;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ players, onLifeChange, onReset }) => {
  return (
    <div className="dashboard">
      <h2>Life Tracker</h2>
      <div className="player-list">
        {players.map((player) => (
          <div key={player.id} className="player-card">
            <h3>{player.name}</h3>
            <h1>{player.life}</h1>
            <button onClick={() => onLifeChange(player.id, 1)}><FaPlus /></button>
            <button onClick={() => onLifeChange(player.id, -1)}><FaMinus /></button>
          </div>
        ))}
      </div>
      <button onClick={onReset} className="reset-button">Reset</button>
    </div>
  );
};

export default Dashboard;