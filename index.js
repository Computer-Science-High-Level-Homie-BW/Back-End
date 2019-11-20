const adv = require("./advUtility");
const travel = require("./dfs");
const mine_coin = require("./mine_coin");

// Create Empty Graph
let graph = {};

// Store path
let traversalPath = [];

// Store reverse path to enable backwards traversal at dead end
let backwardsPath = [];

// Has the player found the pirate's room and changed his name?
const changeUsername = false;

//  Global variables 
let currentRoom = null;
let roomCD = 16; // room cooldown
let mineRoomID = null;
let shopRoomID = 1;
let pirateRoomID = null; // Name change room

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

  let inv = [];
  let treasures = [];
  const takePath = (currentId, targetId) => {
    const directions = travel(currentId, targetId);
    directions.forEach(direction => {
      setTimeout(() => {
        adv.post("move", { direction }).then(res => {
          roomCD = res.data.cooldown;
          currentRoom = res.data;
        });
      }, roomCD * 1000);
    });
  };

  console.log("Start loop at room #: ", currentRoom.room_id);

  const sellTreasure = inv => {
    if (!inv.length) {
      if (!changeUsername) {
        takePath(1, 467);
      }
      return;
    }
    setTimeout(() => {
      adv
        .post("sell", { name: "treasure", confirm: "yes" })
        .then(res => {
          res.data.messages.forEach(msg => console.log(msg));
          roomCD = res.data.cooldown;
          inv.pop(0);
          sellTreasure(inv);
        })
        .catch(err => console.log("Selling error", err));
    }, roomCD * 1000);
  };

  const pickUpTreasure = treasures => {
    if (!treasures.length) {
      setTimeout(() => {
        adv
          .post("status")
          .then(res => {
            roomCD = res.data.cooldown;
            if (res.data.inventory === 10) {
              takePath(currentRoom.room_id, 1);
            }
          })
          .catch(err => console.log("Error in status call", err));
      }, roomCD * 1000);
    }
    setTimeout(() => {
      adv
        .post("take", { name: "treasure" })
        .then(res => {
          console.log("You have picked up treasure!");
          res.data.messages.forEach(msg => console.log(msg));
          roomCD = res.data.cooldown;
          treasures.pop(0);
          pickUpTreasure(treasures);
        })
        .catch(err => console.log("Error in picking up treasure", err));
    }, roomCD * 1000);
  };

  // If current room title contains Pirate (Name change room)
  if (currentRoom.title.includes("Pirate")) {
    console.log(" ------->> FOUND Pirate Room: ", currentRoom.room_id);

    pirateRoomID = currentRoom.room_id;
  }

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
        .post("move", { direction: movedBack, next_room_id: backRoomID })
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
              initGameloop();
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
        .post("move", { direction: nextMove })
        .then(res => {
          console.log("New Room: ", res.data);

          let prevRoomID = roomID;
          currentRoom = res.data;

          graph[prevRoomID][nextMove] = currentRoom.room_id;

          let newRoomID = currentRoom.room_id;

          if (currentRoom.room_id === 1) {
            setTimeout(() => {
              adv.post("status").then(res => {
                inv = [...res.data.inventory];
                sellTreasure(inv);
              });
            }, 1000);
          }

          if (currentRoom.items.length) {
            setTimeout(() => {
              adv
                .post("status")
                .then(res => {
                  roomCD = res.data.cooldown;
                  if (res.data.inventory.length < 10) {
                    treasures = [...currentRoom.items];
                    pickUpTreasure(treasures);
                  }
                })
                .catch(err => console.log("I got youuuuu", err));
            }, roomCD * 1000);
          }

          if (currentRoom.title.toLowerCase().includes("shrine")) {
            adv.post("pray").then(res => (roomCD = res.data.cooldown));
          }

          if (currentRoom.room_id === 467 && !changeUsername) {
            adv
              .post("change_name", { name: "Ramses IV", confirm: "aye" })
              .then(res => {
                roomCD = res.data.cooldown;
                changeUsername = true;
                takePath(467, 250);
              });
          }

          if (currentRoom.room_id === 250) {
            mine_coin();
          }

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