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

function complexrandom(radiusOuter, radiusInner = 0) {
  const angle = Math.random() * 2 * Math.PI;
  const distance = radiusInner + Math.random() * (radiusOuter - radiusInner);
  return [Math.cos(angle) * distance, Math.sin(angle) * distance];
}

function round3(x) {
  return Math.round(x * 1000) / 1000;
}

function randomFractal() {
  const [cr, ci] = complexrandom(1, 0.5);
  return [quadratic, [round3(cr), round3(ci)], [0, -0.5], round3(0.8 + Math.random() * 0.4), 1];
}

const fractalLibrary = [
  [quadratic, [-0.7269, 0.1889], [0.6, -1.1], 0.5, 1],
  [quadratic, [0.285, 0.01], [-0.3, -0.4], 1.2, 1],
  [quadratic, [-0.8, 0.156], [0.5, -0.6], 1, 2],
  [quadratic,[-0.609, 0.456],[0.6, -0.3], 1.897, 1],
  [quadratic, [-0.825, -0.139], [0.118, 0.113], 1.376, 1],
  [quadratic, [-0.132, -0.803], [-0.048, 0.0193],1.93, 3],
  [quadratic, [-0.91, -0.26], [0.509, 0.091], 1.949, 1],
  [quadratic, [-0.518, -0.466], [-0.48, -0.709], 0.5, 2],
  [quadratic, [-0.15, -0.707], [0, 0], 0.5, 3],
  [quadratic, [-0.69, -0.312], [0, 0], 0.5, 1],
  [quadratic, [-0.299, -0.653], [0, 0], 0.5, 1],
  [quadratic, [-0.266, -0.802], [0, 0], 1.5, 1],
  [quadratic, [-0.19, 0.64], [0.2, -0.1], 1.5, 1],
  [quadratic, [0.311, -0.137], [0.8, 0], 1.5, 3],
  [quadratic, [-0.771, -0.212], [0,0], 2, 1],
  [quadratic, [-0.77, -0.166], [0, -0.5], 1, 1],
  [quadratic, [-0.235, 0.648], [0, -1], 0.926, 1],
  [quadratic, [-0.192, -0.832], [0, -0.5], 1.002, 1],
  [quadratic, [-0.756, -0.082], [0, -0.5], 1.145, 1],
  [quadratic, [-0.971, -0.017], [-0.3, -0.5], 1.104, 4],
  [quadratic, [-0.427, -0.56], [0, -0.5], 1.089, 2],
  [quadratic, [0.096, -0.657], [0, -0.5], 0.839, 1],
  [quadratic, [-0.536, 0.519], [0, -0.5], 1.011, 1],
  [quadratic, [-0.274, -0.655], [0, -0.5], 0.972, 1],
  [quadratic, [0.119, 0.606], [0, -0.5], 0.962, 1],
  [quadratic, [-0.105, -0.704], [-0.8, -0.5], 0.818, 4],
  [quadratic, [-0.883, -0.211], [0, -0.5], 0.866, 1],
  [quadratic, [-0.109, -0.576], [0, -0.5], 1.167, 1],
  [quadratic, [-0.676, -0.322], [0, -0.5], 1.195, 1],
];
{
  const randomProportion = 0.5;
  const additions = fractalLibrary.length > 0 ? Math.round((randomProportion * fractalLibrary.length) / (1 - randomProportion)) : 1;
  for (let i = 0; i < additions; ++ i) {
    fractalLibrary.push(randomFractal);
  }
}

// How often to refresh the fractal (in seconds)
const refresh = 2.5 * 60;
// How long the fade out takes (in seconds)
const vanish = 0.8, fade = 8;
// Maximum pixel opacity
const alpha = 0.6;
// How many steps to run in each frame (to get around the 4 ms setInterval timeout)
const speedup = 1;
// What detail (in stages) is the minimum in order to not bail out early on a fractal
const bailout = 5;

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
      let next = fractalLibrary[index ++];
      if (typeof next === "function") {
        next = next();
      }
      let f;
      [f, [cr, ci], [or, oi], scale, l] = next;
      console.log(JSON.stringify([f, [cr, ci], [or, oi], scale, l]).replace(/,/g, ", ").replace("null", "quadratic"));
      // Viewpoint origin
      [vr, vi] = [-(cr + or), -(ci + oi)];
      // Fractal function
      fractal = f([cr, ci]);
    }

    let restart = null;
    function newFractal(clearQuickly = false) {
      if (restart !== null) {
        clearTimeout(restart);
      }
      restart = null;
      canvas.classList.add(clearQuickly ? "vanish" : "fade");
      setTimeout(() => {
        context.clearRect(0, 0, width, height);
        canvas.classList.remove(clearQuickly ? "vanish" : "fade");
        begin();
      }, (clearQuickly ? vanish : fade) * 1000);
    }

    canvas.classList.add("fractal-canvas");
    canvas.addEventListener("click", event => {
      if (event.button === 0) {
        newFractal(true);
      }
    });
    const size = Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio;
    const [width, height] = [size, size];
    const [wlimit, hlimit] = [window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio];
    [canvas.width, canvas.height] = [width, height];
    canvas.style.width = "100%";
    canvas.style.imageRendering = "pixelated";
    const context = canvas.getContext("2d");
    context.fillStyle = "white";

    let regions, next, depth, minValue, maxValue, bail;
    function begin() {
      pickNextFractal();
      regions = [[0, 0, width, height, NaN, 0]], next = [], depth = 0, minValue = 1, maxValue = 0, bail = 0;
      restart = setTimeout(newFractal, refresh * 1000);
    }
    function pushNextRegions(newRegions, cs, stg) {
      for (const [x, y, w, h] of newRegions) {
        if (w >= 1 && h >= 1 && x < wlimit && y < hlimit) {
          next.push([x, y, w, h, cs, stg]);
        }
      }
    }

    begin();

    const stages = 4;

    let interval = setInterval(() => {
      if (typeof fractal === "undefined") {
        return;
      }
      let another = 0;
      for (let t = 0; t < speedup + another; ++ t) {
        if (regions.length === 0) {
          ++ depth;
          if (next.length === 0 || (depth > 4 && (minValue > 0.95 || maxValue < 0.5))) {
            ++ bail;
          }
          if (bail > 8) {
            if (restart !== null) {
              const clearQuickly = depth < stages || minValue > 0.95 || maxValue < 0.5;
              newFractal(clearQuickly);
            }
            next = [];
          }
          if (next.length === 0) {
            return;
          }
          regions = shuffleArray(next);
          next = [];
        }
        const [x, y, w, h, cs, u] = regions.shift();
        const [checksum, value] = getFractalValue(fractal, [((x + w / 2) / width - 0.5) * 2 / scale + vr, ((y + h / 2) / height - 0.5) * 2 / scale + vi]);
        if (value > maxValue) maxValue = value;
        if (value < minValue) minValue = value;
        let stagnation = Math.round(checksum * 1000) === Math.round(cs * 1000) ? u + 1 : 0;
        if (u > 0) {
          ++ another;
        }
        if (w < width / 2 && h < height / 2) {
          // Avoid drawing when nothing has changed, or when the regions are too large, where it can lead to an unpleasant flicker.
          context.globalAlpha = value * alpha;
          context.clearRect(x, y, w, h);
          context.fillRect(x, y, w, h);
        }
        if (stagnation > l) {
          // We want to be able to simply cancel iterating any farther on this region, but this can occasionally lead to blocky artefacts, so we try an additional sanity test here.
          const prev = Math.round(checksum * 1000);
          const checks = [
            getFractalValue(fractal, [((x) / width - 0.5) * 2 / scale + vr, ((y) / height - 0.5) * 2 / scale + vi]),
            getFractalValue(fractal, [((x) / width - 0.5) * 2 / scale + vr, ((y + h) / height - 0.5) * 2 / scale + vi]),
            getFractalValue(fractal, [((x + w) / width - 0.5) * 2 / scale + vr, ((y) / height - 0.5) * 2 / scale + vi]),
            getFractalValue(fractal, [((x + w) / width - 0.5) * 2 / scale + vr, ((y + h) / height - 0.5) * 2 / scale + vi])
          ];
          for (let check of checks) {
            if (Math.round(check[0] * 1000) !== prev) {
              stagnation = l;
            }
          }
        }
        if (stagnation <= l && (w > 1 || h > 1)) {
          const [nw, nh] = [w / 2, h / 2];
          const [[_nw, nw_], [_nh, nh_]]  = [[Math.floor(nw), Math.ceil(nw)], [Math.floor(nh), Math.ceil(nh)]];
          pushNextRegions([
            [x, y, nw_, nh_],
            [x + nw_, y, _nw, nh_],
            [x, y + nh_, nw_, _nh],
            [x + nw_, y + nh_, _nw, _nh]
          ], checksum, stagnation);
        }
      }
    }, 0);
  }
};