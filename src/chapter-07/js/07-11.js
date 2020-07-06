function init() {
  // use the defaults
  const stats = initStats();
  const webGLRenderer = initRenderer();
  const scene = new THREE.Scene();
  const camera = initCamera(new THREE.Vector3(-30, 40, 50));

  let knot;

  // setup the control gui
  const controls = new (function () {
    // we need the first child, since it's a multimaterial
    this.radius = 13;
    this.tube = 1.7;
    this.radialSegments = 156;
    this.tubularSegments = 12;
    this.p = 5;
    this.q = 4;
    this.asParticles = false;
    this.rotate = false;

    this.redraw = function () {
      // remove the old plane
      if (knot) scene.remove(knot);
      // create a new one
      const geom = new THREE.TorusKnotGeometry(
        controls.radius,
        controls.tube,
        Math.round(controls.radialSegments),
        Math.round(controls.tubularSegments),
        Math.round(controls.p),
        Math.round(controls.q)
      );

      if (controls.asParticles) {
        knot = createPoints(geom);
      } else {
        knot = new THREE.Mesh(geom, new THREE.MeshNormalMaterial());
      }

      // add it to the scene.
      scene.add(knot);
    };
  })();

  const gui = new dat.GUI();
  gui.add(controls, "radius", 0, 40).onChange(controls.redraw);
  gui.add(controls, "tube", 0, 40).onChange(controls.redraw);
  gui.add(controls, "radialSegments", 0, 400).step(1).onChange(controls.redraw);
  gui.add(controls, "tubularSegments", 1, 20).step(1).onChange(controls.redraw);
  gui.add(controls, "p", 1, 10).step(1).onChange(controls.redraw);
  gui.add(controls, "q", 1, 15).step(1).onChange(controls.redraw);
  gui.add(controls, "asParticles").onChange(controls.redraw);
  gui.add(controls, "rotate").onChange(controls.redraw);

  controls.redraw();

  // call the render function
  let step = 0;

  render();

  // from THREE.js examples
  function generateSprite() {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;

    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(0,255,255,1)");
    gradient.addColorStop(0.4, "rgba(0,0,64,1)");
    gradient.addColorStop(1, "rgba(0,0,0,1)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createPoints(geom) {
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      transparent: true,
      blending: THREE.AdditiveBlending,
      map: generateSprite(),
      depthWrite: false, // instead of sortParticles
    });

    const cloud = new THREE.Points(geom, material);
    return cloud;
  }

  function render() {
    stats.update();

    if (controls.rotate) {
      step += 0.01;
      knot.rotation.y = step;
    }

    // render using requestAnimationFrame
    requestAnimationFrame(render);
    webGLRenderer.render(scene, camera);
  }
}
