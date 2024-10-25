function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;

  this.startTiles     = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

GameManager.prototype.moveLeft = function () {
  // TODO
};


GameManager.prototype.moveRight = function () {
  // TODO
};

GameManager.prototype.moveDown = function () {
  // TODO
};

GameManager.prototype.moveUp = function () {
  // TODO
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (from, to) {
  if (!this.grid.withinBounds(from)) {
    console.error(`moveTile([${from.x},${from.y}], [${to.x},${to.y}]): [${from.x},${from.y}] is not within bounds`);
    return;
  }
  if (!this.grid.withinBounds(to)) {
    console.error(`moveTile([${from.x},${from.y}], [${to.x},${to.y}]): [${to.x},${to.y}] is not within bounds`);
    return;
  }

  var fromTile = this.grid.cellContent(from);
  if (!fromTile) {
    console.error(`moveTile([${from.x},${from.y}], [${to.x},${to.y}]): [${to.x},${to.y}] is empty`);
    return;
  }

  var toTile = this.grid.cellContent(to);
  if (toTile && fromTile.value != toTile.value) {
    console.error(`moveTile([${from.x},${from.y}], [${to.x},${to.y}]): ${fromTile.value} is not equal to ${toTile.value}, cannot merge`);
    return;
  }
  if (toTile && toTile.mergedFrom) {
    console.error(`moveTile([${from.x},${from.y}], [${to.x},${to.y}]): [${to.x},${to.y}] has already been merged`);
    return;
  }

  if (toTile) {
    var merged = new Tile(toTile, toTile.value * 2);
    merged.mergedFrom = [fromTile, toTile];

    this.grid.insertTile(merged);
    this.grid.removeTile(fromTile);

    // Converge the two tiles' positions
    fromTile.updatePosition(toTile);

    // Update the score
    this.score += merged.value;

    // The mighty 2048 tile
    if (merged.value === 2048) this.won = true;
  } else {
    this.grid.cells[from.x][from.y] = null;
    this.grid.cells[to.x][to.y] = fromTile;
    fromTile.updatePosition(to);
  }

  if (!this.positionsEqual(from, to)) {
    this.moved = true; // The tile moved from its original cell!
  }
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  // Save the current tile positions and remove merger information
  this.moved = false;
  this.prepareTiles();
  if (direction == 1) {
    this.moveRight();
  } else if (direction == 2) {
    this.moveDown();
  } else if (direction == 3) {
    this.moveLeft();
  } else if (direction == 0) {
    this.moveUp();
  }

  if (this.moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid        = new Grid(previousState.grid.size,
                                previousState.grid.cells); // Reload grid
    this.score       = previousState.score;
    this.over        = previousState.over;
    this.won         = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
  } else {
    this.grid        = new Grid(this.size);
    this.score       = 0;
    this.over        = false;
    this.won         = false;
    this.keepPlaying = false;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // Up
    1: { x: 1,  y: 0 },  // Right
    2: { x: 0,  y: 1 },  // Down
    3: { x: -1, y: 0 }   // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = this.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = this.grid.cellContent(cell, false);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};