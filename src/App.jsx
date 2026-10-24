
import { useEffect, useState } from "react";
import cricketApi from "./Services/cricketApi";
import "./App.css";

const emptyPlayer = {
  playerName: "",
  country: "",
  role: "",
  format: "T20",
  matchesPlayed: "",
  runsScored: "",
  highestScore: "",
  battingAverage: "",
  strikeRate: "",
  wicketsTaken: "",
  economyRate: "",
};

function App() {
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(emptyPlayer);
  const [editId, setEditId] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 1. Get all players when the page opens
  useEffect(() => {
    loadPlayers();
  }, []);

  // 2. GET all players
  async function loadPlayers() {
    try {
      const response = await cricketApi.get("/getPlayers");
      setPlayers(response.data);
      setError("");
    } catch (err) {
      setError("Cannot load players. Check Spring Boot and the API URL.");
      console.error(err);
    }
  }

  // 3. Update form values when typing
  function handleChange(event) {
    const { name, value } = event.target;

    setPlayer((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // 4. POST a new player or PUT an existing player
 
async function handleSubmit(event) {
  event.preventDefault();
  setMessage("");
  setError("");

  // Exclude ID from the request body
const playerDetails = { ...player };
delete playerDetails.id;

  const payload = {
  ...playerDetails,
  matchesPlayed: Number(player.matchesPlayed || 0),
  runsScored: Number(player.runsScored || 0),
  highestScore: Number(player.highestScore || 0),
  battingAverage: Number(player.battingAverage || 0),
  strikeRate: Number(player.strikeRate || 0),
  wicketsTaken: Number(player.wicketsTaken || 0),
  economyRate: Number(player.economyRate || 0),
};

  try {
    if (editId !== null) {
      await cricketApi.put(`/update/${editId}`, payload);
      setMessage("Player updated successfully!");
    } else {
      await cricketApi.post("/create", payload);
      setMessage("Player added successfully!");
    }

    setPlayer({ ...emptyPlayer });
    setEditId(null);
    await loadPlayers();
  } catch (err) {
    console.error("ERROR:", err);
    console.error("STATUS:", err.response?.status);
    console.error("RESPONSE:", err.response?.data);

    setError(
      err.response?.data?.message ||
      `Failed to save player. ${err.response?.status || err.message}`
    );
  }
}


  // 5. Put an existing player into the form
  function handleEdit(selectedPlayer) {
    setPlayer({
      ...emptyPlayer,
      ...selectedPlayer,
      matchesPlayed: String(selectedPlayer.matchesPlayed ?? ""),
      runsScored: String(selectedPlayer.runsScored ?? ""),
      highestScore: String(selectedPlayer.highestScore ?? ""),
      battingAverage: String(selectedPlayer.battingAverage ?? ""),
      strikeRate: String(selectedPlayer.strikeRate ?? ""),
      wicketsTaken: String(selectedPlayer.wicketsTaken ?? ""),
      economyRate: String(selectedPlayer.economyRate ?? ""),
    });

    setEditId(selectedPlayer.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // 6. DELETE a player
  async function handleDelete(id) {
    if (!window.confirm("Do you want to delete this player?")) {
      return;
    }

    try {
      await cricketApi.delete(`/delete/${id}`);
      setMessage("Player deleted successfully!");

      if (editId === id) {
        cancelEdit();
      }

      await loadPlayers();
    } catch (err) {
      setError("Could not delete the player.");
      console.error(err);
    }
  }

  // 7. GET one player by ID
  async function handleSearch() {
    if (!searchId.trim()) {
      setError("Please enter a player ID.");
      return;
    }

    try {
      const response = await cricketApi.get(
        `/getPlayers/${searchId.trim()}`
      );

      setPlayers([response.data]);
      setError("");
      setMessage("Player found!");
    } catch (err) {
      setError("Player not found. Check the ID.");
      console.error(err);
    }
  }

  function cancelEdit() {
    setPlayer({ ...emptyPlayer });
    setEditId(null);
    setMessage("");
    setError("");
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🏏 Cricket Player Management System</h1>
        <p>A Full-Stack Application for Player Records, Career Statistics, and Performance Analysis.  </p>
      </header>

      <main className="container">
        <section className="form-card">
          <h2>{editId !== null ? "Update Player" : "Add New Player"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Player Name
                <input
                  name="playerName"
                  value={player.playerName}
                  onChange={handleChange}
                  placeholder="Enter player name"
                  required
                />
              </label>

              <label>
                Country
                <input
                  name="country"
                  value={player.country}
                  onChange={handleChange}
                  placeholder="Enter country"
                  required
                />
              </label>

              <label>
                Role
                <select
                  name="role"
                  value={player.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select role</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
              </label>

              <label>
                Format
                <select
                  name="format"
                  value={player.format}
                  onChange={handleChange}
                  required
                >
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </label>

              {[
                ["matchesPlayed", "Matches Played"],
                ["runsScored", "Runs Scored"],
                ["highestScore", "Highest Score"],
                ["battingAverage", "Batting Average"],
                ["strikeRate", "Strike Rate"],
                ["wicketsTaken", "Wickets Taken"],
                ["economyRate", "Economy Rate"],
              ].map(([name, label]) => (
                <label key={name}>
                  {label}
                  <input
                    type="number"
                    name={name}
                    value={player[name]}
                    onChange={handleChange}
                    min="0"
                    step="any"
                    required
                  />
                </label>
              ))}
            </div>

            <div className="button-row">
              <button type="submit" className="primary">
                {editId !== null ? "Update Player" : "Add Player"}
              </button>

              {editId !== null && (
                <button
                  type="button"
                  className="secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <section className="list-card">
          <div className="list-heading">
            <h2>Cricket Players ({players.length})</h2>
            <button className="secondary" onClick={loadPlayers}>
              Show All Players
            </button>
          </div>

          <div className="search-row">
            <input
              type="number"
              min="1"
              placeholder="Search by player ID"
              value={searchId}
              onChange={(event) => setSearchId(event.target.value)}
            />
            <button className="primary" onClick={handleSearch}>
              Search
            </button>
          </div>

          {players.length === 0 ? (
            <p>No players found. Add your first player above!</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Player</th>
                    <th>Country</th>
                    <th>Role</th>
                    <th>Format</th>
                    <th>Matches</th>
                    <th>Runs</th>
                    <th>Highest</th>
                    <th>Average</th>
                    <th>Strike Rate</th>
                    <th>Wickets</th>
                    <th>Economy</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {players.map((p, index) => (
                  <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td>{p.playerName}</td>
                  <td>{p.country}</td>
                  <td>{p.role}</td>
                  <td>{p.format}</td>
                  <td>{p.matchesPlayed}</td>
                  <td>{p.runsScored}</td>
                  <td>{p.highestScore}</td>
                  <td>{p.battingAverage}</td>
                  <td>{p.strikeRate}</td>
                  <td>{p.wicketsTaken}</td>
                  <td>{p.economyRate}</td>
                 <td>
                  <div className="actions">
                  <button
                    className="edit"
                    onClick={() => handleEdit(p)}
                    >
                    Edit
                  </button>

                  <button
                   className="delete"
                   onClick={() => handleDelete(p.id)}
                   >
                   Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
