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
  return ([a, b]) => [Math.pow(a, 2) - Math.pow(b, 2) + cr, 2 * a * b + ci];
}

function complexpow([a, b], n) {
  let [A, B] = [1, 0];
  for (let i = 0; i < n; ++ i) {
    [A, B] = [A * a - B * b, a * B + A * b];
  }
  return [A, B];
}

function complexp([a, b]) {
  return [Math.exp(a) * Math.cos(b), Math.exp(a) * Math.sin(b)];
}

function complexadd([a, b], [c, d]) {
  return [a + c, b + d];
}

const fractalLibrary = [
  [quadratic, [-0.7269, 0.1889], [0.6, -1.1], 0.5, 1],
  [quadratic, [0.285, 0.01], [-0.3, -0.4], 1.2, 1],
  [quadratic, [-0.8, 0.156], [0.5, -0.6], 1, 2],
];

// How often to refresh the fractal (in seconds)
const refresh = 2.5 * 60;
// How long the fade out takes (in seconds)
const fade = 8;
// Maximum pixel opacity
const alpha = 0.6;
// How many steps to run in each frame (to get around the 4 ms setInterval timeout)
const speedup = 1;

module.exports = () => {
  for (const canvas of document.querySelectorAll(".fractal-canvas")) {
    let cr, ci, or, oi, scale, vr, vi, l, fractal;
    let index = fractalLibrary.length;
    function pickNextFractal() {
      if (index === fractalLibrary.length) {
        const previous = fractalLibrary[fractalLibrary.length - 1];
        shuffleArray(fractalLibrary);
        if (fractalLibrary[0] === previous) {
          // Make sure we never pick the same fractal twice in a row (unless there's only one fractal in our library).
          fractalLibrary.reverse();
        }
        index = 0;
      }
      let f;
      [f, [cr, ci], [or, oi], scale, l] = fractalLibrary[index ++];
      // Viewpoint origin
      [vr, vi] = [-(cr + or), -(ci + oi)];
      // Fractal function
      fractal = f([cr, ci]);
    }

    canvas.classList.add("fractal-canvas");
    const size = Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio;
    const [width, height] = [size, size];
    const [wlimit, hlimit] = [window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio];
    [canvas.width, canvas.height] = [width, height];
    canvas.style.width = "100%";
    canvas.style.imageRendering = "pixelated";
    const context = canvas.getContext("2d");
    context.fillStyle = "white";

    let regions, next;
    function begin() {
      pickNextFractal();
      regions = [[0, 0, width, height, NaN, 0]], next = [];

      setTimeout(() => {
        canvas.classList.add("fade");
        setTimeout(() => {
          context.clearRect(0, 0, width, height);
          canvas.classList.remove("fade");
          begin();
        }, fade * 1000);
      }, refresh * 1000);
    }
    function pushNextRegions(newRegions, cs, u) {
      for (const [x, y, w, h] of newRegions) {
        if (w >= 1 && h >= 1 && x < wlimit && y < hlimit) {
          next.push([x, y, w, h, cs, u]);
        }
      }
    }

    begin();

    let interval = setInterval(() => {
      for (let t = 0; t < speedup; ++ t) {
        if (regions.length === 0) {
          regions = shuffleArray(next);
          next = [];
        }
        const [x, y, w, h, cs, u] = regions.shift();
        const [checksum, value] = getFractalValue(fractal, [((x + w / 2) / width - 0.5) * 2 / scale + vr, ((y + h / 2) / height - 0.5) * 2 / scale + vi]);
        if (w < width / 2 && h < height / 2) {
          // Avoid drawing when the regions are too large, where it can lead to an unpleasant flicker.
          context.globalAlpha = value * alpha;
          context.clearRect(x, y, w, h);
          context.fillRect(x, y, w, h);
        }
        const unchanged = Math.round(checksum * 1000) === Math.round(cs * 1000) ? u + 1 : 0;
        if (unchanged <= l && (w > 1 || h > 1)) {
          const [nw, nh] = [w / 2, h / 2];
          const [[_nw, nw_], [_nh, nh_]]  = [[Math.floor(nw), Math.ceil(nw)], [Math.floor(nh), Math.ceil(nh)]];
          pushNextRegions([
            [x, y, nw_, nh_],
            [x + nw_, y, _nw, nh_],
            [x, y + nh_, nw_, _nh],
            [x + nw_, y + nh_, _nw, _nh]
          ], checksum, unchanged);
        }
      }
    }, 0);
  }
};