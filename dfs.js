// const graph = require('./graph');

// const shortestPath = (currentId, targetId) => {
//   const stack = [];
//   let visited = {};
//   stack.push([currentId]);
//   while (stack.length) {
//     path = stack.pop();
//     node = path[path.length - 1];
//     if (!visited[node]) {
//       visited[node] = true;
//       if (node === targetId) {
//         return path;
//       }
//       Object.values(graph[node]).forEach(neighbor => {
//         pathCopy = [...path];
//         pathCopy.push(Number(neighbor));
//         stack.push(pathCopy);
//       });
//     }
//   }
// };

// const travel = (currentId, targetId) => {
//   const steps = shortestPath(currentId, targetId);
//   const directions = [];
//   for (let i = 0; i < steps.length; i++) {
//     Object.keys(graph[steps[i]]).forEach(key => {
//       if (steps[i + 1] === graph[steps[i]][key]) {
//         directions.push(key);
//       }
//     });
//   }
//   return directions;
// };

// console.log(travel(0, 42));

// module.exports = travel;