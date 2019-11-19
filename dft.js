const axios = require("axios");

let exits = null;
let current_room = null;

class Graph {
  constructor() {
    this.vertices = {};
  }

  add_vertex(vertex) {
    if (!(vertex in this.vertices)) {
      this.vertices[vertex] = {};
    }
  }

  add_edges(vertex, direction, value) {
    this.vertices[vertex][direction] = value;
  }
}

g = new Graph();

g.add_vertex(0);

const dft_until_dead_end = async (move_direction) => {
  setTimeout(() => {
    move(move_direction);
  }, 16000);

  console.log("move made");
  for (let direction in g.vertices[current_room]) {
    if (g.vertices[current_room][direction] === "?") {
      dft_until_dead_end(direction);
      return;
    }
  }
};

// const move = async (direction) => {
//   let previous_room = current_room;

//   try {
//     const response = await axios.post(
//       "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/",
//       {
//         direction: direction,
//       },
//       {
//         headers: {
//           Authorization: "Token e9697a598203554fa1e1e59f590f4b2e87a662be",
//         },
//       },
//     );

//     current_room = response.data.room_id;
//     current_room_exits = response.data.exits;

//     g.add_edges(previous_room, direction, current_room);
//     g.add_vertex(current_room);

//     opposite_direction = null;

//     if (direction === "w") {
//       opposite_direction = "e";
//     } else if (direction === "e") {
//       opposite_direction = "w";
//     } else if (direction === "s") {
//       opposite_direction = "n";
//     } else {
//       opposite_direction = "s";
//     }

//     g.add_edges(current_room, opposite_direction, previous_room);

//     for (let direction of current_room_exits) {
//       if (!(direction in g.vertices[current_room])) {
//         g.add_edges(current_room, direction, "?");
//       }
//     }
//   } catch (error) {
//     console.log("ERROR MOVING");
//   }
// };

// const bft_shortest_path_to_unexplored_room = (starting_room) => {
//   queue = [];
//   visited = new Set();

//   queue.push([current_room]);

//   while (queue.length > 0) {
//     let get_path = queue.shift();

//     let last_id_from_path = get_path[get_path.length - 1];

//     if (!(last_id_from_path in visited)) {
//       for (key in g.vertices[last_id_from_path]) {
//         if (g.vertices[last_id_from_path][key] === "?") {
//           return get_path;
//         }
//       }

//       visited.add(last_id_from_path);

//       for (let direction in g.vertices[last_id_from_path]) {
//         queue.push([...get_path, g.vertices[last_id_from_path][direction]]);
//       }
//     }
//   }

//   return null;
// };

// const move_reverse_back = async (direction) => {
//   setTimeout(async () => {
//     try {
//       const response = await axios.post(
//         "https://lambda-treasure-hunt.herokuapp.com/api/adv/move/",
//         {
//           direction: direction,
//         },
//         {
//           headers: {
//             Authorization: "Token e9697a598203554fa1e1e59f590f4b2e87a662be",
//           },
//         },
//       );

//       current_room = response.data.room_id;
//     } catch (error) {
//       console.log("ERROR move Reverse BACK");
//     }
//   }, 16000);
// };

// const move_back = (shortest_path_array) => {
//   while (shortest_path_array.length > 1) {
//     get_id = shortest_path_array.shift();

//     for (let direction in g.vertices[get_id]) {
//       if (g.vertices[get_id][direction] === shortest_path_array[0]) {
//         move_reverse_back(direction);
//       }
//     }
//   }
// };

const startDFT = async () => {
  try {
    const response = await axios.get(
      "https://lambda-treasure-hunt.herokuapp.com/api/adv/init/",
      {
        headers: {
          Authorization: "Token e9697a598203554fa1e1e59f590f4b2e87a662be",
        },
      },
    );

    exits = response.data.exits;
    current_room = response.data.room_id;

    for (let direction of exits) {
      g.add_edges(0, direction, "?");
    }

    console.log(g.vertices);
  } catch (error) {
    console.log("ERROR GETTING INIT");
  }

  const queue = [];

  for (let direction in g.vertices[current_room]) {
    if (g.vertices[current_room][direction] === "?") {
      queue.push(direction);
    }
  }

  console.log("QUEUE", queue);

  while (queue.length > 0) {
    let get_unexplored_direction = queue.shift();
    console.log("CURRENT ROOM", current_room);
    dft_until_dead_end(get_unexplored_direction);

  //   let shorest_path_to_unexplored_room = bft_shortest_path_to_unexplored_room(
  //     current_room,
  //   );

  //   if (shorest_path_to_unexplored_room === null) {
  //     return;
  //   }

  //   move_back(shorest_path_to_unexplored_room);

  //   print("CURRENT ROOM AFTER", current_room);

  //   queue = [];

  //   for (let direction in g.vertices[current_room]) {
  //     if (g.vertices[current_room][direction] === "?") {
  //       queue.push(direction);
  //     }
  //   }
  }
};

startDFT();
