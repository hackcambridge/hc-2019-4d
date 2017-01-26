"use strict";

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; -- i) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const iterations = 80;
const threshold = 100;
function getFractalValue(f, [zr, zi]) {
  let [znr, zni] = [zr, zi], i, d2;
  for (i = 0; i < iterations; ++ i) {
    d2 = Math.pow(znr, 2) + Math.pow(zni, 2);
    if (d2 >= Math.pow(threshold, 2)) {
      break;
    }
    [znr, zni] = f([znr, zni]);
  }
  return [i + 1 / d2, i / iterations];
}

function quadratic([cr, ci]) {
  return ([r, i]) => [Math.pow(r, 2) - Math.pow(i, 2) + cr, 2 * r * i + ci];
}

module.exports = () => {
  // Fractal constant
  const [cr, ci] = [-0.7269, 0.1889];
  // Viewpoint origin
  const [or, oi] = [-(cr + 0.6), -(ci - 1.1)];
  // Scale factor
  const scale = 2;
  // Fractal function
  const f = quadratic([cr, ci]);
  // Maximum pixel opacity
  const alpha = 0.6;

  for (const canvas of document.querySelectorAll(".fractal-canvas")) {
    canvas.classList.add("fractal-canvas");
    const size = Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio;
    const [width, height] = [size, size];
    const [wlimit, hlimit] = [window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio];
    [canvas.width, canvas.height] = [width, height];
    canvas.style.width = "100%";
    canvas.style.imageRendering = "pixelated";
    const context = canvas.getContext("2d");
    context.fillStyle = "white";

    let regions = [[0, 0, width, height, NaN, 0]], next = [];
    function pushNextRegions(newRegions, cs, u) {
      for (const [x, y, w, h] of newRegions) {
        if (w >= 1 && h >= 1 && x < wlimit && y < hlimit) {
          next.push([x, y, w, h, cs, u]);
        }
      }
    }

    let interval = setInterval(() => {
      if (regions.length === 0) {
        regions = shuffleArray(next);
        next = [];
      }
      const [x, y, w, h, cs, u] = regions.shift();
      const [checksum, value] = getFractalValue(f, [((x + w / 2) / width - 0.5) * 2 * scale + or, ((y + h / 2) / height - 0.5) * 2 * scale + oi]);
      context.globalAlpha = value * alpha;
      context.clearRect(x, y, w, h);
      context.fillRect(x, y, w, h);
      const unchanged = Math.round(checksum * 1000) === Math.round(cs * 1000) ? u + 1 : 0;
      if (unchanged <= 1 && (w > 1 || h > 1)) {
        const [nw, nh] = [w / 2, h / 2];
        const [[_nw, nw_], [_nh, nh_]]  = [[Math.floor(nw), Math.ceil(nw)], [Math.floor(nh), Math.ceil(nh)]];
        pushNextRegions([
          [x, y, nw_, nh_],
          [x + nw_, y, _nw, nh_],
          [x, y + nh_, nw_, _nh],
          [x + nw_, y + nh_, _nw, _nh]
        ], checksum, unchanged);
      }
    }, 0);
  }
};