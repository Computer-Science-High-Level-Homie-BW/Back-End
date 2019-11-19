const adv = require('./axiosConfig');

let graph = {};
let traversalPath = [];
let backwardsPath = [];
const nameChanged = false;


function oppositeDir(dir) {
    let result = '';

    if (dir == 'n') {
        result = 's';
    } else if (dir == 's') {
        result = 'n';
    } else if (dir == 'w') {
        result = 'e';
    } else if (dir == 'e') {
        result = 'w';
    }

    return result;
}

let roomCD = 16; // to cover bases... if loop() starts too soon, currentRoom is still null and fx breaks

adv
    .get('init')
    .then(res => {
        console.log('Init: ', res.data);

        currentRoom = res.data;

        console.log('ID: ', currentRoom.room_id);
        console.log('Exits: ', currentRoom.exits);

        roomCD = currentRoom.cooldown;
    })
    .catch(err => console.error(err));


function loop() {
    console.log(' >> Looping ...');

    let roomID = currentRoom.room_id;

    if (!graph[roomID]) {
        graph[roomID] = {};
    }

    currentRoom.exits.forEach(exit => {
        if (graph[roomID][exit] == undefined) {
            graph[roomID][exit] = '?';
        }
    });

    let moveOptions = [];

    for (var key in graph[roomID]) {
        if (graph[roomID][key] == '?') {
            moveOptions.push(key);
        }
    }

    console.log('Move options: ', moveOptions);

    if (moveOptions.length == 0 && backwardsPath.length) {
        console.log('Oops! At dead end. Moving backwards.');

        const movedBack = backwardsPath.pop();

        traversalPath.push(movedBack);

        const backRoomID = graph[roomID][movedBack].toString();
        console.log('Back room ID: ', backRoomID);

        setTimeout(() => {
            console.log('In Set Timeout Fx for Dead End');

            adv
                .post('move', { direction: movedBack, next_room_id: backRoomID })
                .then(res => {
                    currentRoom = res.data;
                    roomCD = res.data.cooldown;
                    console.log(
                        "Reversed! I'm now in room",
                        currentRoom.room_id,
                        'cd: ',
                        roomCD
                    );

                    // Recursion
                    if (Object.keys(graph).length !== 500) {
                        console.log('Moved from dead end, repeating loop.');
                        setTimeout(() => {
                            loop();
                        }, roomCD * 1000);
                    }
                })
                .catch(err => console.log('Dead End POST ERR:', err.message));
        }, roomCD * 1000);
    }

    else if (moveOptions.length == 0 && backwardsPath.length == 0) {
        console.log("Dead end and can't go back... Graph complete?");
        console.log('Graph length @ Dead End: ', Object.keys(graph).length);
    }


    else if (moveOptions.length > 0) {

        let nextMove = moveOptions[0];
        moveOptions = [];

        let backwardsMove = oppositeDir(nextMove);
        backwardsPath.push(backwardsMove);

        traversalPath.push(nextMove);
        console.log('PUSHED MOVE');

        setTimeout(() => {
            adv
                .post('move', { direction: nextMove })
                .then(res => {
                    console.log('New Room: ', res.data);

                    let prevRoomID = roomID;
                    currentRoom = res.data;

                    graph[prevRoomID][nextMove] = currentRoom.room_id;

                    let newRoomID = currentRoom.room_id;

                    graph[newRoomID][backwardsMove] = prevRoomID;

                    console.log('Replaced ?s: ', graph);


                    if (Object.keys(graph).length !== 500) {
                        console.log('Graph not 500 yet');
                        setTimeout(() => {
                            loop();
                        }, roomCD * 1000);
                    }
                })
                .catch(err => console.log('POST ERR:', err.message));
        }, roomCD * 1000);
    }
}

setTimeout(() => {
    loop();
}, roomCD * 1000);