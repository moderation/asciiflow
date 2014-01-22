/**
 * Handles view operations, state and management of the screen.
 *
 * @constructor
 * @param {ascii.State} state
 */
ascii.View = function(state) {
  /** @type {ascii.State} */ this.state = state;

  /** @type {Element} */ this.canvas = document.getElementById('ascii-canvas');
  /** @type {Object} */ this.context = this.canvas.getContext('2d');

  /** @type {number} */ this.zoom = 1;
  /** @type {ascii.Vector} */ this.offset = new ascii.Vector(7500, 7500);
  /** @type {boolean} */ this.dirty = true;

  this.resizeCanvas();
};

/**
 * Resizes the canvas, should be called if the viewport size changes.
 */
ascii.View.prototype.resizeCanvas = function() {
  this.canvas.width = document.documentElement.clientWidth;
  this.canvas.height = document.documentElement.clientHeight;
  this.dirty = true;
};

/**
 * Starts the animation loop for the canvas. Should only be called once.
 */
ascii.View.prototype.animate = function() {
  if (this.dirty) {
    this.dirty = false;
    this.render();
  }
  var view = this;
  window.requestAnimationFrame(function() { view.animate(); });
};

/**
 * Renders the given state to the canvas.
 * TODO: Room for efficiency here still. Drawing should be incremental,
 *       however performance is currently very acceptable on test devices.
 */
ascii.View.prototype.render = function() {
  var context = this.context;

  context.setTransform(1, 0, 0, 1, 0, 0);
  // Clear the visible area.
  context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  context.scale(this.zoom, this.zoom);
  context.translate(
      this.canvas.width / 2 / this.zoom,
      this.canvas.height / 2 / this.zoom);

  // Only render grid lines and cells that are visible.
  var startOffset = this.screenToCell(new ascii.Vector(
      -RENDER_PADDING,
      -RENDER_PADDING));
  var endOffset = this.screenToCell(new ascii.Vector(
      this.canvas.width + RENDER_PADDING,
      this.canvas.height + RENDER_PADDING));

  // Render the grid.
  context.lineWidth = '1';
  context.strokeStyle = '#EEEEEE';
  context.beginPath();
  for (var i = startOffset.x; i < endOffset.x; i++) {
    context.moveTo(
        i * CHAR_PIXELS_H - this.offset.x,
        0 - this.offset.y);
    context.lineTo(
        i * CHAR_PIXELS_H - this.offset.x,
        this.state.cells.length * CHAR_PIXELS_V - this.offset.y);
  }
  for (var j = startOffset.y; j < endOffset.y; j++) {
    context.moveTo(
        0 - this.offset.x,
        j * CHAR_PIXELS_V - this.offset.y);
    context.lineTo(
        this.state.cells.length * CHAR_PIXELS_H - this.offset.x,
        j * CHAR_PIXELS_V - this.offset.y);
  }
  this.context.stroke();

  // Render cells.
  this.context.font = '15px Courier New';
  for (var i = startOffset.x; i < endOffset.x; i++) {
    for (var j = startOffset.y; j < endOffset.y; j++) {
      var cell = this.state.getCell(new ascii.Vector(i, j));
      if (cell.hasScratch() || cell.isSpecial()) {
        this.context.fillStyle = cell.hasScratch() ? '#DEF' : '#F5F5F5';
        context.fillRect(
            i * CHAR_PIXELS_H - this.offset.x,
            (j - 1) * CHAR_PIXELS_V - this.offset.y,
            CHAR_PIXELS_H, CHAR_PIXELS_V);
      }
      var cellValue = this.state.getDrawValue(new ascii.Vector(i, j));
      if (cellValue != null) {
        this.context.fillStyle = '#000000';
        context.fillText(cellValue,
            i * CHAR_PIXELS_H - this.offset.x + 1,
            j * CHAR_PIXELS_V - this.offset.y - 3);
      }
    }
  }
};

/**
 * @param {number} zoom
 */
ascii.View.prototype.setZoom = function(zoom) {
  this.zoom = zoom;
  this.dirty = true;
};

/**
 * @param {ascii.Vector} offset
 */
ascii.View.prototype.setOffset = function(offset) {
  this.offset = offset;
  this.dirty = true;
};

/**
 * Given a screen coordinate, find the frame coordinates.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.screenToFrame = function(vector) {
  return new ascii.Vector(
      (vector.x - this.canvas.width / 2) / this.zoom + this.offset.x,
      (vector.y - this.canvas.height / 2) / this.zoom + this.offset.y);
};

/**
 * Given a frame coordinate, find the screen coordinates.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.frameToScreen = function(vector) {
  return new ascii.Vector(
      (vector.x - this.offset.x) * this.zoom + this.canvas.width / 2,
      (vector.y - this.offset.y) * this.zoom + this.canvas.height / 2);
};

/**
 * Given a frame coordinate, return the indices for the nearest cell.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.frameToCell = function(vector) {
  return new ascii.Vector(
    Math.round((vector.x - CHAR_PIXELS_H / 2) / CHAR_PIXELS_H),
    Math.round((vector.y + CHAR_PIXELS_V / 2) / CHAR_PIXELS_V));
};

/**
 * Given a screen coordinate, return the indices for the nearest cell.
 * @param {ascii.Vector} vector
 * @return {ascii.Vector}
 */
ascii.View.prototype.screenToCell = function(vector) {
  return this.frameToCell(this.screenToFrame(vector));
};



