const adv = require("./axiosConfig");

let graph = {};
let traversalPath = [];
let backwardsPath = [];
const nameChanged = false;

function oppositeDir(dir) {
  let result = "";

  if (dir == "n") {
    result = "s";
  } else if (dir == "s") {
    result = "n";
  } else if (dir == "w") {
    result = "e";
  } else if (dir == "e") {
    result = "w";
  }

  return result;
}

let roomCD = 17;

adv
  .get("init")
  .then((res) => {
    console.log("Init: ", res.data);

    currentRoom = res.data;

    console.log("ID: ", currentRoom.room_id);
    console.log("Exits: ", currentRoom.exits);

    roomCD = currentRoom.cooldown;
  })
  .catch((err) => console.error(err));

function loop() {
  console.log(" Beginning Loop...");

  let roomID = currentRoom.room_id;

    const takePath = (currentId, targetId) => {
        const directions = travel(currentId, targetId);
        directions.forEach(direction => {
            setTimeout(() => {
                adv.post('move', { direction }).then(res => {
                    roomCD = res.data.cooldown;
                    currentRoom = res.data;
                });
            }, roomCD * 1000);
        });
    };

    const selling = inv => {
      if (!inv.length) {
        if (!nameChanged) {
          takePath(1, 467);
        }
        return;
      }
      setTimeout(() => {
        adv
          .post('sell', { name: 'treasure', confirm: 'yes' })
          .then(res => {
            res.data.messages.forEach(msg => console.log(msg));
            roomCD = res.data.cooldown;
            inv.pop(0);
            selling(inv);
          })
          .catch(err => console.log('Selling error', err));
      }, roomCD * 1000);
    };

  if (!graph[roomID]) {
    graph[roomID] = {};
  }

  currentRoom.exits.forEach((exit) => {
    if (graph[roomID][exit] == undefined) {
      graph[roomID][exit] = "?";
    }
  });

  let moveOptions = [];

  for (let key in graph[roomID]) {
    if (graph[roomID][key] == "?") {
      moveOptions.push(key);
    }
  }

  console.log("Move options: ", moveOptions);

  if (moveOptions.length == 0 && backwardsPath.length) {
    console.log("Oops! At dead end. Moving backwards.");

    const movedBack = backwardsPath.pop();

    traversalPath.push(movedBack);

    const backRoomID = graph[roomID][movedBack].toString();
    console.log("Back room ID: ", backRoomID);

    setTimeout(() => {
      console.log("In Set Timeout Fx for Dead End");

      adv
        .post("move", {direction: movedBack, next_room_id: backRoomID})
        .then((res) => {
          currentRoom = res.data;
          roomCD = res.data.cooldown;
          console.log(
            "Reversed! I'm now in room",
            currentRoom.room_id,
            "cd: ",
            roomCD,
          );

          // Recursion
          if (Object.keys(graph).length !== 500) {
            console.log("Moved from dead end, repeating loop.");
            setTimeout(() => {
              loop();
            }, roomCD * 1000);
          }
        })
        .catch((err) => console.log("Dead End POST ERR:", err.message));
    }, roomCD * 1000);
  } else if (moveOptions.length == 0 && backwardsPath.length == 0) {
    console.log("Dead end and can't go back... Graph complete?");
    console.log("Graph length @ Dead End: ", Object.keys(graph).length);
  } else if (moveOptions.length > 0) {
    let nextMove = moveOptions[0];
    moveOptions = [];

    let backwardsMove = oppositeDir(nextMove);
    backwardsPath.push(backwardsMove);

    traversalPath.push(nextMove);
    console.log("PUSHED MOVE");

    setTimeout(() => {
      adv
        .post("move", {direction: nextMove})
        .then((res) => {
          console.log("New Room: ", res.data);

          let prevRoomID = roomID;
          currentRoom = res.data;

          graph[prevRoomID][nextMove] = currentRoom.room_id;

          let newRoomID = currentRoom.room_id;

          graph[newRoomID][backwardsMove] = prevRoomID;

          if (!graph[newRoomID]) {
            graph[newRoomID] = {};
          }

          // Add newroom exit values
          currentRoom.exits.forEach(exit => {
          if (!graph[newRoomID][exit]) {
            graph[newRoomID][exit] = '?';
            }
          });

          // Update graph values of new current room with prevRoom ID
          graph[newRoomID][backwardsMove] = prevRoomID;

          console.log("Replaced ?s: ", graph);

          if (Object.keys(graph).length !== 500) {
            console.log("Graph not 500 yet");
            setTimeout(() => {
              loop();
            }, roomCD * 1000);
          }
        })
        .catch((err) => console.log("POST ERR:", err.message));
    }, roomCD * 1000);
  }
}

setTimeout(() => {
  loop();
}, roomCD * 1000);
