const adv = require('./axiosConfig');
const travel = require('./dfs');

let graph = {};

var traversalPath = [];

var backwardsPath = [];

const nameChanged = false;

function oppositeDir(dir) {
    var result = '';

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

var currentRoom = null;
var roomCD = 16;

adv
    .get('init')
    .then(res => {
        console.log('Init: ', res.data);

        currentRoom = res.data;

        roomCD = currentRoom.cooldown;
    })
    .catch(err => console.error(err));


function loop() {
    console.log(' >> Looping ...');

    let roomID = currentRoom.room_id;

    let inv = [];
    let treasures = [];
    const takeUber = (currentId, targetId) => {
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

    console.log('Start loop at room #: ', currentRoom.room_id);


    if (!graph[roomID]) {
        graph[roomID] = {}; // []
    }

    currentRoom.exits.forEach(exit => {

        if (graph[roomID][exit] == undefined) {
            graph[roomID][exit] = '?';
        }
    });

    var moveOptions = [];

    for (var key in graph[roomID]) {
        if (graph[roomID][key] == '?') {
            moveOptions.push(key);
        }
    }


    if (moveOptions.length == 0 && backwardsPath.length) {

        const movedBack = backwardsPath.pop();

        traversalPath.push(movedBack);

        const backRoomID = graph[roomID][movedBack].toString();

        setTimeout(() => {

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

                    if (Object.keys(graph).length !== 500) {
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
        return graph;
    }


    else if (moveOptions.length > 0) {


        var nextMove = moveOptions[0];
        moveOptions = [];

        var backwardsMove = oppositeDir(nextMove);
        backwardsPath.push(backwardsMove);

        traversalPath.push(nextMove);

        setTimeout(() => {
            adv
                .post('move', { direction: nextMove })
                .then(res => {
                    console.log('New Room: ', res.data);

                    var prevRoomID = roomID;
                    currentRoom = res.data;

                    graph[prevRoomID][nextMove] = currentRoom.room_id;

                    var newRoomID = currentRoom.room_id;

                    if (currentRoom.room_id === 1) {
                        setTimeout(() => {
                            adv.post('status').then(res => {
                                inv = [...res.data.inventory];
                                selling(inv);
                            });
                        }, 1000);
                    }

                    if (currentRoom.items.length) {
                        setTimeout(() => {
                            adv
                                .post('status')
                                .then(res => {
                                    roomCD = res.data.cooldown;
                                    if (res.data.inventory.length < 10) {
                                        treasures = [...currentRoom.items];
                                        pickingItems(treasures);
                                    }
                                })
                                .catch(err => console.log('I got youuuuu', err));
                        }, roomCD * 1000);
                    }

                    if (currentRoom.title.toLowerCase().includes('shrine')) {
                        adv.post('pray').then(res => (roomCD = res.data.cooldown));
                    }

                    if (currentRoom.room_id === 467 && !nameChanged) {
                        adv
                            .post('change_name', { name: 'Scavenger Hunter', confirm: 'aye' })
                            .then(res => {
                                roomCD = res.data.cooldown;
                                nameChanged = true;
                                takeUber(467, 250);
                            });
                    }

                    if (currentRoom.room_id === 250) {
                        getLastProof();
                    }

                    if (!graph[newRoomID]) {
                        graph[newRoomID] = {};
                    }

                    currentRoom.exits.forEach(exit => {
                        if (!graph[newRoomID][exit]) {
                            graph[newRoomID][exit] = '?';
                        }
                    });

                    graph[newRoomID][backwardsMove] = prevRoomID;

                    console.log('Replaced ?s: ', graph);

                    roomCD = res.data.cooldown;

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