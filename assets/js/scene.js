/* =========================================================
   AXEL — Portfolio
   scene.js — Three.js (laptop de glace)
   Expose window.SCENE = { laptop, camera } pour animations.js
   ========================================================= */

(function(){
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x04070b, 0.06);

  const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 100);
  camera.position.z = 7;

  /* ---------- Shader "glace" (fresnel) ---------- */
  const iceUniforms = { uTime:{value:0} };
  const iceMat = new THREE.ShaderMaterial({
    uniforms: iceUniforms, transparent: true,
    vertexShader:`
      varying vec3 vN, vV;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader:`
      uniform float uTime;
      varying vec3 vN, vV;
      void main(){
        float f = pow(1.0 - abs(dot(vN, vV)), 2.2);
        vec3 col = mix(vec3(0.04,0.12,0.20), vec3(0.62,0.85,1.0), f);
        col += vec3(0.62,0.85,1.0) * (0.5 + 0.5*sin(uTime*0.8 + vN.y*6.0)) * 0.08;
        gl_FragColor = vec4(col, 0.28 + f*0.72);
      }`
  });

  function roundedBox(w, h, d, radius, seg){
    const geo = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
    const posAttr = geo.attributes.position;
    const hx = w/2 - radius, hy = h/2 - radius, hz = d/2 - radius;
    const v = new THREE.Vector3(), c = new THREE.Vector3();
    for(let i=0;i<posAttr.count;i++){
      v.fromBufferAttribute(posAttr, i);
      c.set(
        THREE.MathUtils.clamp(v.x, -hx, hx),
        THREE.MathUtils.clamp(v.y, -hy, hy),
        THREE.MathUtils.clamp(v.z, -hz, hz)
      );
      v.sub(c).normalize().multiplyScalar(radius).add(c);
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }

  const glowMat = new THREE.ShaderMaterial({
    transparent:true, side:THREE.BackSide, blending:THREE.AdditiveBlending, depthWrite:false,
    vertexShader:`
      varying vec3 vN, vV;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position,1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader:`
      varying vec3 vN, vV;
      void main(){
        float f = pow(1.0 - abs(dot(vN, vV)), 3.0);
        gl_FragColor = vec4(vec3(0.62,0.85,1.0), f*0.35);
      }`
  });

  /* ---------- Laptop ---------- */
  const laptop = new THREE.Group();

  const baseGeo = roundedBox(3.2, 0.16, 2.2, 0.06, 6);
  laptop.add(new THREE.Mesh(baseGeo, iceMat));
  const baseGlow = new THREE.Mesh(baseGeo, glowMat);
  baseGlow.scale.setScalar(1.05);
  laptop.add(baseGlow);

  const hinge = new THREE.Group();
  hinge.position.set(0, 0.08, -1.06);
  hinge.rotation.x = -0.28;
  laptop.add(hinge);

  const lidGeo = roundedBox(3.2, 2.05, 0.09, 0.045, 6);
  const lid = new THREE.Mesh(lidGeo, iceMat);
  lid.position.y = 1.02;
  hinge.add(lid);
  const lidGlow = new THREE.Mesh(lidGeo, glowMat);
  lidGlow.scale.setScalar(1.05);
  lidGlow.position.y = 1.02;
  hinge.add(lidGlow);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.95, 1.82),
    new THREE.ShaderMaterial({
      vertexShader:`
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader:`
        varying vec2 vUv;
        void main(){
          vec3 col = mix(vec3(0.02,0.05,0.09), vec3(0.25,0.45,0.62), vUv.y);
          col += vec3(0.62,0.85,1.0) * smoothstep(0.9, 1.0, vUv.y) * 0.3;
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  screen.position.set(0, 1.02, 0.048);
  hinge.add(screen);

  const keys = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.16, 0.02, 0.16),
    new THREE.MeshBasicMaterial({color:0x123047, transparent:true, opacity:0.9}),
    14*5
  );
  const m = new THREE.Matrix4();
  let k = 0;
  for(let row=0; row<5; row++){
    for(let col=0; col<14; col++){
      m.setPosition(-1.3 + col*0.2, 0.085, -0.85 + row*0.2);
      keys.setMatrixAt(k++, m);
    }
  }
  laptop.add(keys);

  const trackpad = new THREE.Mesh(
    new THREE.PlaneGeometry(1.0, 0.62),
    new THREE.MeshBasicMaterial({color:0x0d2334, transparent:true, opacity:0.9})
  );
  trackpad.rotation.x = -Math.PI/2;
  trackpad.position.set(0, 0.082, 0.62);
  laptop.add(trackpad);

  laptop.position.y = -0.35;
  scene.add(laptop);

  /* ---------- Neige ---------- */
  const N = 500;
  const pos = new Float32Array(N*3);
  for(let i=0;i<N;i++){
    pos.set([(Math.random()-0.5)*24, (Math.random()-0.5)*16, (Math.random()-0.5)*14], i*3);
  }
  const snowGeo = new THREE.BufferGeometry();
  snowGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(snowGeo, new THREE.PointsMaterial({
    color:0xcfe9ff, size:0.03, transparent:true, opacity:0.55, depthWrite:false
  })));

  /* ---------- Interactions ---------- */
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mx=0, my=0;

  addEventListener('mousemove', e=>{
    mx = e.clientX/innerWidth - 0.5;
    my = e.clientY/innerHeight - 0.5;
  });
  addEventListener('resize', ()=>{
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  /* ---------- Exposition pour animations.js ----------
     rotationBoost + zBoost sont pilotés par ScrollTrigger. */
  const SCENE = {
    laptop, camera,
    rotationBoost: 0,   // rotation Y additionnelle (pilotée au scroll)
    xTiltBoost: 0,      // rotation X additionnelle
    zBoost: 0           // dolly caméra additionnel
  };
  window.SCENE = SCENE;

  /* ---------- Boucle de rendu ---------- */
  const clock = new THREE.Clock();
  (function tick(){
    const t = clock.getElapsedTime();
    iceUniforms.uTime.value = t;

    if(!reduced){
      laptop.rotation.y = t*0.15 + SCENE.rotationBoost;
      laptop.rotation.x = 0.28 + Math.sin(t*0.2)*0.06 + SCENE.xTiltBoost;
      laptop.position.y = -0.35 + Math.sin(t*0.5)*0.08;

      const p = snowGeo.attributes.position;
      for(let i=0;i<N;i++){
        const y = p.getY(i) - 0.008;
        p.setY(i, y < -8 ? 8 : y);
      }
      p.needsUpdate = true;

      camera.position.x += (mx*1.4 - camera.position.x)*0.04;
      camera.position.y += (-my*1.0 - camera.position.y)*0.04;
      camera.position.z = 7 - SCENE.zBoost;
      camera.lookAt(0,0,0);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  })();
})();
