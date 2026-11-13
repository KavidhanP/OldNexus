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
   - Send manual commands: Toggle Pump, Toggle Relay, Shut Down All Valves and Set Dosing
   - Undo the last command and view the command history
   - See queue health: queue depth, priority queue depth, stack depth and processing latency
   - See active faults and how many duplicate alerts were suppressed
   - View a timeline graph for the selected sensor
   - Use the Suggested Actions panel to run a suggested command in one click

7. **Network Topology and Mesh Routing** (Part 3):
   - Open **Network Topology and Mesh Routing** from the sidebar. The summary strip shows total vertices, live nodes, down nodes, isolated nodes, the MST power cost against the full mesh cost, and the percentage saved.
   - The **Mesh Network Graph View** shows two facilities (FAC-HYDRO-01: Commercial Campus and FAC-NURSERY-02: Propagation Nursery). Nodes are colour-coded: blue = gateway, green = live, orange = anomaly, red = offline. The label on each node (L1, L2) is its BFS level, the number of hops from the gateway.
   - Use the **Hardware MAC & Sensor Routing Lookup** bar to trace the route from any sensor to its gateway. It accepts a sensor ID or a MAC address in colon, hyphen or raw hex format. The result shows the MST route chain with its cost and hops next to the BFS shortest-hop path, and the traced route is highlighted on the graph with numbered hop markers.
   - Click any node to select it. The bar below the graph shows the node's status and BFS level. **Fail Node** and **Recover Node** simulate a relay going offline and coming back.
   - **BFS Hop Hierarchy** lists devices by hop level from the gateway. **DFS Subnet Component** lists every device in the connected subnet.
   - The **MST Links Only** checkbox hides every link that is not part of the minimum spanning tree.
   - The **Offline Nodes & Route Self-Healing** panel lists down or forced-down relays, the nodes that depended on them, and each node's old and new route.
   - The **Historical Telemetry AVL Tree** panel queries the selected sensor's history. Choose a From and To time or use the 1h, 2h, 24h, 7d and All quick buttons, tick **Compare with full scan baseline**, and click **Query Tree**. The result shows the readings matched, the nodes visited by the tree against the nodes a full scan visits, the tree height and the elapsed time.

## Part 2 Data Structures

| Feature | Structure | File |
|---|---|---|
| Standard telemetry queue (FIFO) | `ConcurrentQueue<T>` | `Services/Streaming/TelemetryIngestionQueue.cs` |
| Critical alert queue | `PriorityQueue<TElement, TPriority>` (Microsoft, 2026b) | `Services/Streaming/CriticalAlertPriorityQueue.cs` |
| Command history and undo | `Stack<T>` | `Services/Streaming/CommandHistoryStack.cs` |
| Live device lookup by MAC or sensor ID | `ConcurrentDictionary<string, DeviceState>` | `Services/DeviceRegistry.cs` |
| Sensor timeline in time order | `SortedDictionary<DateTime, TelemetryReading>` | `Services/TelemetryTimeline.cs` |
| Unique active faults | `HashSet<string>` (Microsoft, 2026a) | `Services/ActiveFaultRegistry.cs` |
| Suggested actions | `Dictionary`, `Queue<T>` and `PriorityQueue<T, double>` (Microsoft, 2026b) | `Services/SuggestionEngineService.cs` |

The queue processor (`Services/Streaming/QueueProcessorService.cs`) is a hosted background service that always empties the priority queue before it takes the next normal packet. Collections that are not thread-safe are guarded with a lock.

The suggestion engine counts how often one event is followed by another (an alert, a search or a command). If an alert is usually followed by the same command, that command is suggested with a confidence percentage. Devices that have gone quiet or are close to their limits are also flagged. This approach is a first-order Markov model, which predicts the next event from the current one (Veritasium, 2025).

## Part 3 Data Structures

| Feature | Structure | File |
|---|---|---|
| Weighted undirected mesh graph | Adjacency list: `HashSet<string>` of nodes (Microsoft, 2026a) and `Dictionary<string, List<MeshEdge>>` | `Services/Mesh/MeshGraph.cs` |
| Breadth-first search (hop levels, unreachable detection) | `Queue<string>` and a `HashSet<string>` visited set (Microsoft, 2026a) | `Services/Mesh/MeshAlgorithms.cs` |
| Depth-first search (connected subnet listing) | `Stack<string>` and a `HashSet<string>` visited set (Microsoft, 2026a) | `Services/Mesh/MeshAlgorithms.cs` |
| Minimum spanning tree (Prim's algorithm) | `PriorityQueue<MeshEdge, double>` (Jacobson, 2017; Microsoft, 2026b) | `Services/Mesh/MeshAlgorithms.cs` |
| Historical telemetry index | `ConcurrentDictionary<string, SensorHistory>`, one entry per sensor, each holding an `AvlTree<long, TelemetryReading>` | `Services/History/TelemetryHistoryIndex.cs` |
| Self-balancing binary search tree | Generic hand-written `AvlTree<TKey, TValue>` with four rotation cases and an O(log n + k) range query (Solomon and Evans, 2023; Teresco, 2024) | `Services/History/AvlTree.cs` |
| Forced-down node tracking | `ConcurrentDictionary<string, bool>` | `Services/Mesh/MeshTopologyService.cs` |

## Part 3 Data Structure Explanations

**Mesh graph.** Sensors and gateways are the vertices of the graph, and the wireless links between them are its edges, each carrying a relative power cost. The vertices are held in a hash set, which rejects duplicate node identifiers (Microsoft, 2026a). The graph is stored as an adjacency list because the network is sparse: 29 edges join 17 nodes, so each node has two to four neighbours, and a traversal reads only those edges instead of a full matrix row. Algorithms run on an isolated snapshot of the graph taken under a lock, so concurrent requests never see it half-modified. Node identifiers are compared without regard to case, so a MAC address typed in any format finds the same node.

**Breadth-first and depth-first search.** A graph traversal visits every reachable vertex and edge in a systematic order (Barsky, 2022). Breadth-first search assigns each device its hop level from the gateway and records its parent, which gives the shortest-hop route. Any node it never reaches has no active path to the gateway, which is how unreachable devices are found. Depth-first search uses an explicit stack in place of recursion and lists every device connected to a gateway. Both receive an "isNodeUp" function, so a relay marked as down is skipped and the same code serves the healthy and the failed network.

**Minimum spanning tree (Prim's algorithm).** A minimum spanning tree connects every node using the lowest possible total edge weight (Jacobson, 2017). Prim's algorithm starts at the gateway and repeatedly adds the cheapest edge that reaches a node not yet in the tree, with the candidate edges held in a priority queue (Jacobson, 2017; Microsoft, 2026b). The seeded network costs 38 for the hydroponics facility and 16 for the nursery, a total of 54 against 176 for the full mesh, a reduction of 69.3 per cent. Because the tree is recomputed on the current live state, a failed relay produces a new tree without any special repair code. The tree minimises the cost of the whole network, not of each route: for ESP32-DOSE-01 the MST route costs 6 over two hops, while the direct link costs 16 over one hop.

**AVL tree for historical queries.** Telemetry arrives in increasing timestamp order, and inserting increasing keys into a plain binary search tree produces a chain whose height grows with the number of readings (Teresco, 2024). An AVL tree keeps the heights of the two subtrees of every node within one of each other, using four rotation cases that preserve the search order (Solomon and Evans, 2023; Teresco, 2024). The range query skips whole subtrees that fall outside the requested window, so its cost is O(log n + k) for k matching readings. For about 7,000 readings the tree height is 13, and a two-hour query visits 86 nodes against 7,315 for a full scan. A range that matches almost the whole history leaves little to skip, so the advantage appears on narrow windows.

## References

Barsky, M. 2022. Graph traversals (Lecture 27). Oberlin College. [Online]. Available at: <https://cs.oberlin.edu/~mbarsky/classes/cs-151/f2022/lectures/27.GraphTraversals.pdf> [Accessed 12 November 2026].

Jacobson, M. 2017. Computation of minimum-cost spanning trees: Prim's algorithm (CPSC 331, Lecture 35). University of Calgary. [Online]. Available at: <https://cspages.ucalgary.ca/~jacobs/Courses/cpsc331/W17/notes/lecture35.pdf> [Accessed 12 November 2026].

Microsoft. 2026a. HashSet\<T\> Class. [Online]. Available at: <https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1> [Accessed 19 October 2026].

Microsoft. 2026b. PriorityQueue\<TElement,TPriority\> Class. [Online]. Available at: <https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2> [Accessed 19 October 2026].

Solomon, B. and Evans, G.C. 2023. AVL trees (CS 225 lecture slides). University of Illinois Urbana-Champaign. [Online]. Available at: <https://courses.grainger.illinois.edu/cs225/fa2023/assets/lectures/slides/cs225fa23-15-avl2-slides.pdf> [Accessed 11 November 2026].

Teresco, J.D. 2024. Topic notes: AVL trees (CSIS 385). Siena College. [Online]. Available at: <https://courses.teresco.org/cs385_s24/notes/avl.pdf> [Accessed 11 November 2026].

Veritasium. 2025. The strange math that predicts (almost) anything. [YouTube video]. Available at: <https://www.youtube.com/watch?v=KZeIEiBrT_w> [Accessed 19 October 2026].
