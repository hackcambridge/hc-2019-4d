"use strict";
module.exports = () => {
  const canvas = document.querySelector(".fractal-canvas");
  if (canvas !== null) {
    canvas.classList.add("fractal-canvas");
    const context = canvas.getContext("2d");
    document.body.querySelector(".live-container").appendChild(canvas);

    const width = Math.max(window.innerWidth, window.innerHeight) * window.devicePixelRatio, height = width;
    const hlimit = window.innerHeight * window.devicePixelRatio;
    canvas.width = width; canvas.height = height;
    canvas.style.width = "100%";
    canvas.style.imageRendering = "pixelated";
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; -- i) {
          var j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    const [cr, ci] = [-0.7269, 0.1889];
    const c = [cr, ci];
    const [or, oi] = [-(cr + 0.6), -(ci - 1.1)];
    const scale = 2;
    const f2 = quadratic(c);

    let zones = [[0, 0, width, height, NaN, 0]];
    let next = [];
    let interval = setInterval(() => {
      if (zones.length === 0) {
        zones = shuffleArray(next);
        next = [];
      }
      let [x, y, w, h, p, u] = zones.shift();
      const [continuous_index, scaled_index] = iterateOnPixel(f2, [((x + w / 2) / width - 0.5) * 2 * scale + or, ((y + h / 2) / height - 0.5) * 2 * scale + oi]);
      // context.globalAlpha = 0.1;
      // context.fillStyle = `rgb(${Math.floor(Math.sin(0.016 * continuous_index + 4) * 230 + 25)}, ${Math.floor(Math.sin(0.013 * continuous_index + 2) * 230 + 25)}, ${Math.floor(Math.sin(0.01 * continuous_index + 1) * 230 + 25)})`;
      // context.fillStyle = `hsl(0, 0%, ${Math.floor(Math.sin(0.016 * continuous_index + 4) * 100)}%)`;
      // context.fillStyle = `hsl(${Math.round(Math.random() * 360, 2)}, 50%, 40%)`;
      context.fillStyle = `hsla(0, 0%, 100%, ${Math.round((1 - scaled_index) * 0.6 * 100) / 100})`;
      context.clearRect(x, y, w, h);
      context.fillRect(x, y, w, h);
      let nu = Math.round(continuous_index * 1000) === Math.round(p * 1000) ? u + 1 : 0;
      if (nu < 2) {
        if (w <= 1 && h <= 1)
          return;
        const nwidth = w > 2 ? w / 2 : 1, nheight = h > 2 ? h / 2 : 1;
        const nwidthC = Math.ceil(nwidth), nwidthF = Math.floor(nwidth);
        const nheightC = Math.ceil(nheight), nheightF = Math.floor(nheight);
        if (nwidthC >= 1 && nheightC >= 1)
          next.push([x, y, nwidthC, nheightC, continuous_index, nu]);
        if (nwidthF >= 1 && nheightC >= 1)
          next.push([x + nwidthC, y, nwidthF, nheightC, continuous_index, nu]);
        if (nwidthC >= 1 && nheightF >= 1 && y + nheightC < hlimit)
          next.push([x, y + nheightC, nwidthC, nheightF, continuous_index, nu]);
        if (nwidthF >= 1 && nheightF >= 1 && y + nheightC < hlimit)
          next.push([x + nwidthC, y + nheightC, nwidthF, nheightF, continuous_index, nu]);
      }
    }, 0);

    function quadratic([cr, ci]) {
      return ([r, i]) => [Math.pow(r, 2) - Math.pow(i, 2) + cr, 2 * r * i + ci];
    }

    function iterateOnPixel(f, [zr, zi]) {
      let iterations = 80;
      let threshold = 100;
      let step = 1;
      let znr = zr;
      let zni = zi;
      let i;
      for (i = 0; i < iterations; ++ i) {
        if (Math.pow(znr, 2) + Math.pow(zni, 2) >= Math.pow(threshold, 2)) {
          break;
        }
        [znr, zni] = f([znr, zni]);
      }
      return [i + (1 - Math.log(2) / ((Math.pow(znr, 2) + Math.pow(zni, 2)))) / Math.log(2), 1 - (i / iterations)];
    }
  }
};