# GreenLeaf Hydroponics Monitor

**PROG7312 Portfolio of Evidence, Part 3**
A .NET IoT telemetry platform for a commercial hydroponics operation, built with an ASP.NET Core Minimal API backend and a Blazor WebAssembly frontend. Part 2 added a real-time command stream with queues, an undo stack, fast device lookup, duplicate alert suppression and suggested actions. Part 3 adds a mesh network topology module: a graph model of the sensor network, breadth-first and depth-first traversal, a minimum spanning tree for power-efficient routing, self-healing after relay failures, and an AVL tree for fast historical telemetry queries.

## Demo videos

- Part 1: <https://youtu.be/siNXom-CSH8>
- Part 2: <https://youtu.be/zFNhSGTJC44>
- Part 3: [INSERT URL]

## What This App Does

GreenLeaf monitors commercial hydroponic greenhouses and needs to catch equipment failures. The platform ingests telemetry from simulated ESP32 edge sensors over HTTP, flags anomalies in real time and gives operators a live health view of the whole sensor fleet.

In Part 2, every incoming packet goes through a processing queue, critical alerts jump ahead of normal traffic, operators can send override commands to devices and undo them, and the system suggests actions based on what the operator and the sensors have done before.

In Part 3, the wireless sensor network is modelled as a graph. Operators can trace the route from any sensor to its gateway, see which devices are connected or down, simulate a relay failure and watch the routes repair themselves, and query a sensor's history for any time range without scanning every reading.

## Tech Stack

- **.NET 9**: backend and shared class library
- **ASP.NET Core Minimal API**: telemetry, command, insight, history and mesh endpoints
- **Blazor WebAssembly (hosted)**: frontend, served from the same API process
- **Entity Framework Core + SQLite**: persistence, including the command audit log and mesh links
- **SignalR**: real-time push updates to the dashboard
- **Background services**: queue processor, stale sensor detector, mesh monitor and an ambient telemetry simulator that posts readings to the API over HTTP

The solution, project and namespace names (SmartX.sln, SmartX.Api, SmartX.Client and SmartX.Shared) come from the original project codename and are unchanged.

## How to Compile and Run

### Prerequisites

- .NET 9 SDK
- No additional installs required. SQLite and all packages are restored automatically.

### Steps

```powershell
git clone <repo-url>
cd Smart-X
dotnet restore SmartX.sln
dotnet build SmartX.sln
dotnet run --project src/SmartX.Api --urls "http://localhost:5000"
```

Open a browser at `http://localhost:5000`. The API hosts the Blazor client, so only one process is needed. The database is created and seeded automatically on first run.

To reset the database, stop the app, delete the `smartx.db` file (and any `-shm` or `-wal` files) in `src/SmartX.Api/App_Data`, and run again.

### Screenshot locations (insert screenshots here)

> **[SCREENSHOT 1]** Landing page showing all three phases active
> **[SCREENSHOT 2]** Network Topology page: Mesh Graph View with two facilities
> **[SCREENSHOT 3]** Route trace result showing MST route chain vs BFS path
> **[SCREENSHOT 4]** Offline Nodes & Route Self-Healing panel with a failed relay
> **[SCREENSHOT 5]** Historical Telemetry AVL Tree panel showing nodes-visited comparison
> **[SCREENSHOT 6]** BFS / DFS algorithm output panel

## How to Use the App

1. **Landing page**: start here. It shows the three delivery phases, and all three are active: Part 1 (Sensor Telemetry), Part 2 (Command Stream) and Part 3 (Network Topology and Mesh Routing).

2. **Navigation menu**: switch between Sensor Telemetry, Batch Array Ingest, Command Stream and Network Topology. Filters, the selected sensor, the command history, the suggestions and the topology selection are kept when you move between pages.

3. **Sensor Heartbeat Grid** (Part 1): each tile is one sensor.
   - Pulsing green = reporting normally
   - Red strobe = anomaly detected
   - Grey "FROZEN" = sensor has stopped reporting

   Click a tile to open its inspector and use Simulate Edge Ping to send a reading.

4. **Live Sensor Telemetry Feed** (Part 1): a table of all sensors. Use Register Sensor to add a device or Push Reading to submit a value. Readings are accepted by the API and processed through the queue.

5. **Incident Tracker, Spatial Hierarchy, File Vault and Batch Array Ingest** (Part 1): unchanged from Part 1. Batch Array Ingest accepts bursts of different lengths using jagged arrays.

6. **Command Stream** (Part 2): the real-time dashboard.
   - Search devices by name or MAC address and filter by category, status or alert state
   - Send manual commands:
