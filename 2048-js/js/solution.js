GameManager.prototype.findRightNonEmptyTile = function(xStart, y) {
  for (var i = xStart; i < this.size; ++i) {
    var tile = this.grid.tileValue({x: i, y: y});
    if (tile !== 0) {
      return i;
    }
  }
  return -1;
};

GameManager.prototype.moveLeft = function () {
  for (var y = 0; y < this.size; ++y) {
    for (var x = 0; x < this.size; ++x) {
      var nextTileIndex = this.findRightNonEmptyTile(x+1, y);
      if (nextTileIndex === -1) {
        break;
      }

      var tile = this.grid.tileValue({x: x, y: y});
      var nextTile = this.grid.tileValue({x: nextTileIndex, y: y});
      if (tile === 0) {
        this.moveTile({x: nextTileIndex, y: y}, {x: x, y: y});
        --x;
      } else if (nextTile == tile) {
        this.moveTile({x: nextTileIndex, y: y}, {x: x, y: y});
      }
    }
  }
};

GameManager.prototype.findLeftNonEmptyTile = function(xStart, y) {
  for (var i = xStart; i >= 0; --i) {
    var tile = this.grid.tileValue({x: i, y: y});
    if (tile !== 0) {
      return i;
    }
  }
  return -1;
};

GameManager.prototype.moveRight = function () {
  for (var y = 0; y < this.size; ++y) {
    for (var x = this.size-1; x >= 0; --x) {
      var nextTileIndex = this.findLeftNonEmptyTile(x-1, y);
      if (nextTileIndex === -1) {
        break;
      }

      var tile = this.grid.tileValue({x: x, y: y});
      var nextTile = this.grid.tileValue({x: nextTileIndex, y: y});
      if (tile === 0) {
        this.moveTile({x: nextTileIndex, y: y}, {x: x, y: y});
        ++x;
      } else if (nextTile == tile) {
        this.moveTile({x: nextTileIndex, y: y}, {x: x, y: y});
      }
    }
  }
};

GameManager.prototype.findUpNonEmptyTile = function(x, yStart) {
  for (var i = yStart; i >= 0; --i) {
    var tile = this.grid.tileValue({x: x, y: i});
    if (tile !== 0) {
      return i;
    }
  }
  return -1;
};

GameManager.prototype.moveDown = function () {
  for (var x = 0; x < this.size; ++x) {
    for (var y = this.size-1; y >= 0; --y) {
      var nextTileIndex = this.findUpNonEmptyTile(x, y-1);
      if (nextTileIndex === -1) {
        break;
      }

      var tile = this.grid.tileValue({x: x, y: y});
      var nextTile = this.grid.tileValue({x: x, y: nextTileIndex});
      if (tile === 0) {
        this.moveTile({x: x, y: nextTileIndex}, {x: x, y: y});
        ++y;
      } else if (nextTile == tile) {
        this.moveTile({x: x, y: nextTileIndex}, {x: x, y: y});
      }
    }
  }
};

GameManager.prototype.findDownNonEmptyTile = function(x, yStart) {
  for (var i = yStart; i < this.size; ++i) {
    var tile = this.grid.tileValue({x: x, y: i});
    if (tile !== 0) {
      return i;
    }
  }
  return -1;
};

GameManager.prototype.moveUp = function () {
  for (var x = 0; x < this.size; ++x) {
    for (var y = 0; y < this.size; ++y) {
      var nextTileIndex = this.findDownNonEmptyTile(x, y+1);
      if (nextTileIndex === -1) {
        break;
      }

      var tile = this.grid.tileValue({x: x, y: y});
      var nextTile = this.grid.tileValue({x: x, y: nextTileIndex});
      if (tile === 0) {
        this.moveTile({x: x, y: nextTileIndex}, {x: x, y: y});
        --y;
      } else if (nextTile == tile) {
        this.moveTile({x: x, y: nextTileIndex}, {x: x, y: y});
      }
    }
  }
};
