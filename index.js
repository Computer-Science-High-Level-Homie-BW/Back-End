const adv = require("./advUtility");
const mine_coin = require("./mine_coin");

// Create Empty Graph
let graph = {};

// Store path
let traversalPath = [];

// Store reverse path to enable backwards traversal at dead end
let backwardsPath = [];

//  Global variables
let currentRoom = null;
let roomCD = 16; // room cooldown

//Obtain reverse direction to record in backwardsPath array
function oppositeDirection(direction) {
  let result = "";

  if (direction == "n") {
    result = "s";
  } else if (direction == "s") {
    result = "n";
  } else if (direction == "w") {
    result = "e";
  } else if (direction == "e") {
    result = "w";
  }

  return result;
}

// Initialization
adv
  .get("init")
  .then(res => {
    console.log("Init: ", res.data);

    // Set Current Room as res.data
    currentRoom = res.data;

    // Check ID and Exit data for each room
    console.log("ID: ", currentRoom.room_id);
    console.log("Exits: ", currentRoom.exits);

    // get cooldown value for current room for setTimeout()
    roomCD = currentRoom.cooldown;
  })
  .catch(err => console.error(err));

//  --------> Populate Graph <----------
// Loops until graph includes all 500 rooms

function initGameLoop() {
    console.log("--> Start of Loop <--");

    let roomID = currentRoom.room_id;

    console.log("Start loop at room #: ", currentRoom.room_id);


        if (!graph[roomID]) {
            graph[roomID] = {};
        }

        currentRoom.exits.forEach(exit => {
            if (graph[roomID][exit] == undefined) {
                graph[roomID][exit] = "?";
            }
        });

        console.log("Updated graph with empty directions: ", graph);
        console.log("Graph length is: ", Object.keys(graph).length);

        let unexploredDirs = [];

        for (let key in graph[roomID]) {
            if (graph[roomID][key] == "?") {
                unexploredDirs.push(key);
            }
        }

        // Check unexploredDirs array:
        console.log("Move options: ", unexploredDirs);

        // ----->>> if/else Dead End Handler chain <<<------

        // There are no unexplored exits but backwardsPath has length which means you can travel backwards

        if (unexploredDirs.length == 0 && backwardsPath.length) {
            console.log("Oops! At dead end. Moving backwards.");
            // break;

            // save last move made
            const movedBack = backwardsPath.pop();

            // add that reverse move to end of traversePath arr
            traversalPath.push(movedBack);

            // save id of room we're moving to as a string for wise explorer
            const backRoomID = graph[roomID][movedBack].toString();
            console.log("Back room ID: ", backRoomID);

            // Post Request to Move api with movedBack variable as direction
            setTimeout(() => {
                console.log("In Set Timeout Fx for Dead End");

                adv
                    .post("move", {direction: movedBack, next_room_id: backRoomID})
                    .then(res => {
                        currentRoom = res.data;
                        roomCD = res.data.cooldown;
                        console.log(
                            "Reversed! I'm now in room",
                            currentRoom.room_id,
                            "cd: ",
                            roomCD
                        );

                        // Calling Function (recursion)
                        if (Object.keys(graph).length !== 500) {
                            console.log("Moved from dead end, repeating loop.");
                            setTimeout(() => {
                                initGameLoop();
                            }, roomCD * 1000);
                        }
                    })
                    .catch(err => console.log("Dead End POST ERR:", err.message));
            }, roomCD * 1000);
        }

        // ----->>> if/else Dead End Handler chain <<<------
        // No unexploredDirs and can't go backwards (back at start)
        else if (unexploredDirs.length == 0 && backwardsPath.length == 0) {
            console.log("Dead end and can't go back... Graph complete?");
            console.log("Graph length @ Dead End: ", Object.keys(graph).length);
        }

        // ---> No Dead End found yet <-----
        else if (unexploredDirs.length > 0) {
            let nextMove = unexploredDirs[0];
            unexploredDirs = [];

            // Record backwards version of move and push to backwardsPath array
            let backwardsMove = oppositeDirection(nextMove);
            backwardsPath.push(backwardsMove);

            traversalPath.push(nextMove);

            console.log("PUSHED MOVE");

            setTimeout(() => {
                adv
                    .post("move", {direction: nextMove})
                    .then(res => {
                        console.log("New Room: ", res.data);

                        let prevRoomID = roomID;
                        currentRoom = res.data;

                        graph[prevRoomID][nextMove] = currentRoom.room_id;

                        let newRoomID = currentRoom.room_id;


                        if (!graph[newRoomID]) {
                            graph[newRoomID] = {};
                        }

                        // Replace exit values for new rooms
                        currentRoom.exits.forEach(exit => {
                            if (!graph[newRoomID][exit]) {
                                graph[newRoomID][exit] = "?";
                            }
                        });

                        graph[newRoomID][backwardsMove] = prevRoomID;

                        console.log("Replaced ?s: ", graph);

                        // Room Cooldown Reset
                        roomCD = res.data.cooldown;

                        // Calling init if graph has not yet been to all the rooms
                        if (Object.keys(graph).length !== 500) {
                            console.log("Graph not 500 yet");
                            setTimeout(() => {
                                initGameLoop();
                            }, roomCD * 1000);
                        }
                    })
                    .catch(err => console.log("Post Error!!:", err.message));
            }, roomCD * 1000);
        }
}

setTimeout(() => {
  initGameLoop();
}, roomCD * 1000);