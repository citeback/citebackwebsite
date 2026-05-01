import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// --- Data Generation ---

const METRO_AREAS = [
  // [lat, lng, weight, name]
  [40.7128, -74.0060, 180, 'New York City'],
  [34.0522, -118.2437, 160, 'Los Angeles'],
  [41.8781, -87.6298, 120, 'Chicago'],
  [29.7604, -95.3698, 100, 'Houston'],
  [33.4484, -112.0740, 90, 'Phoenix'],
  [39.9526, -75.1652, 95, 'Philadelphia'],
  [29.4241, -98.4936, 85, 'San Antonio'],
  [32.7767, -96.7970, 90, 'Dallas'],
  [30.3322, -81.6557, 75, 'Jacksonville'],
  [30.2672, -97.7431, 80, 'Austin'],
  [37.3382, -121.8863, 70, 'San Jose'],
  [30.3322, -81.6557, 65, 'Jacksonville'],
  [32.0809, -81.0912, 55, 'Savannah'],
  [32.7157, -117.1611, 85, 'San Diego'],
  [37.7749, -122.4194, 95, 'San Francisco'],
  [47.6062, -122.3321, 80, 'Seattle'],
  [39.7392, -104.9903, 75, 'Denver'],
  [42.3601, -71.0589, 80, 'Boston'],
  [36.1627, -86.7816, 65, 'Nashville'],
  [35.2271, -80.8431, 70, 'Charlotte'],
  [38.2527, -85.7585, 60, 'Louisville'],
  [39.1031, -84.5120, 65, 'Cincinnati'],
  [41.4993, -81.6944, 65, 'Cleveland'],
  [43.0481, -76.1474, 55, 'Syracuse'],
  [44.9778, -93.2650, 70, 'Minneapolis'],
  [38.6270, -90.1994, 70, 'St. Louis'],
  [35.4676, -97.5164, 65, 'Oklahoma City'],
  [36.1540, -95.9928, 60, 'Tulsa'],
  [32.3668, -86.3000, 50, 'Montgomery'],
  [33.5186, -86.8104, 70, 'Birmingham'],
  [35.1495, -90.0490, 65, 'Memphis'],
  [29.9511, -90.0715, 75, 'New Orleans'],
  [25.7617, -80.1918, 80, 'Miami'],
  [27.9506, -82.4572, 75, 'Tampa'],
  [28.5383, -81.3792, 75, 'Orlando'],
  [33.7490, -84.3880, 85, 'Atlanta'],
  [35.7796, -78.6382, 65, 'Raleigh'],
  [36.8529, -75.9780, 60, 'Virginia Beach'],
  [38.8951, -77.0369, 95, 'Washington DC'],
  [39.2904, -76.6122, 70, 'Baltimore'],
  [40.4406, -79.9959, 65, 'Pittsburgh'],
  [43.1566, -77.6088, 55, 'Rochester'],
  [42.8864, -78.8784, 60, 'Buffalo'],
  [42.6526, -73.7562, 55, 'Albany'],
  [41.7658, -72.6851, 55, 'Hartford'],
  [41.8240, -71.4128, 55, 'Providence'],
  [45.5051, -122.6750, 65, 'Portland'],
  [37.8044, -122.2712, 60, 'Oakland'],
  [37.6879, -122.4702, 55, 'Daly City'],
  [36.7783, -119.4179, 50, 'Fresno'],
  [35.3733, -119.0187, 45, 'Bakersfield'],
  [34.1083, -117.2898, 50, 'San Bernardino'],
  [33.9425, -117.2297, 50, 'Riverside'],
  [36.1699, -115.1398, 70, 'Las Vegas'],
  [35.1983, -111.6513, 35, 'Flagstaff'],
  [40.7608, -111.8910, 60, 'Salt Lake City'],
  [43.6150, -116.2023, 45, 'Boise'],
  [46.8772, -96.7898, 40, 'Fargo'],
  [43.5460, -96.7313, 40, 'Sioux Falls'],
  [41.2565, -95.9345, 55, 'Omaha'],
  [39.0997, -94.5786, 65, 'Kansas City'],
  [37.6872, -97.3301, 50, 'Wichita'],
  [40.8258, -96.6852, 45, 'Lincoln'],
  [44.5133, -88.0133, 45, 'Green Bay'],
  [43.0389, -76.1469, 50, 'Syracuse'],
  [44.5192, -88.0198, 45, 'Green Bay'],
  [43.0731, -89.4012, 55, 'Madison'],
  [44.0121, -92.4802, 40, 'Rochester MN'],
  [46.7867, -92.1005, 45, 'Duluth'],
  [39.7684, -86.1581, 70, 'Indianapolis'],
  [40.0583, -74.4057, 65, 'Trenton'],
  [41.0534, -74.1301, 60, 'Paterson'],
  [40.6501, -73.9496, 85, 'Brooklyn'],
  [40.7282, -73.7949, 80, 'Queens'],
];

function latLngToVector3(lat, lng, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function generateUSCameras(count = 5000) {
  const points = [];
  const totalWeight = METRO_AREAS.reduce((s, m) => s + m[2], 0);

  for (let i = 0; i < count; i++) {
    let r = Math.random() * totalWeight;
    let chosen = METRO_AREAS[0];
    for (const m of METRO_AREAS) {
      r -= m[2];
      if (r <= 0) { chosen = m; break; }
    }
    const spread = 0.5 + Math.random() * 1.5;
    const lat = chosen[0] + (Math.random() - 0.5) * spread;
    const lng = chosen[1] + (Math.random() - 0.5) * spread;
    points.push({ lat, lng, type: 'estimated', city: chosen[3] });
  }
  return points;
}

const VERIFIED_NM_CAMERAS = [
  { lat: 36.7072, lng: -105.5769, type: 'Flock ALPR', location: 'Taos Plaza', verified: true },
  { lat: 36.7200, lng: -105.5800, type: 'Flock ALPR', location: 'Paseo del Pueblo Norte', verified: true },
  { lat: 32.3199, lng: -106.7637, type: 'Flock ALPR + PTZ', location: 'Las Cruces Main St', verified: true },
  { lat: 32.3150, lng: -106.7680, type: 'Flock ALPR', location: 'Las Cruces Downtown', verified: true },
  { lat: 35.0853, lng: -106.6504, type: 'Flock ALPR', location: 'Albuquerque Central', verified: true },
];

// --- Component ---

export default function CameraGlobe() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const stateRef = useRef({
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    autoRotate: true,
    autoRotateTimer: null,
    hoveredIndex: -1,
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    // --- Globe ---
    const globeGeo = new THREE.SphereGeometry(1, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0a0a0a,
      emissive: 0x050510,
      shininess: 5,
      transparent: true,
      opacity: 0.98,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Wireframe grid (subtle)
    const gridGeo = new THREE.SphereGeometry(1.001, 24, 16);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x1a2a3a,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    scene.add(new THREE.Mesh(gridGeo, gridMat));

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(1.12, 64, 64);
    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x0044aa,
      emissive: 0x001133,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Second glow layer
    const glow2Geo = new THREE.SphereGeometry(1.06, 64, 64);
    const glow2Mat = new THREE.MeshBasicMaterial({
      color: 0x1155cc,
      transparent: true,
      opacity: 0.07,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glow2Geo, glow2Mat));

    // --- Lights ---
    scene.add(new THREE.AmbientLight(0x111122, 1.5));
    const dirLight = new THREE.DirectionalLight(0x3366ff, 0.5);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x2244aa, 0.3);
    rimLight.position.set(-5, -2, -3);
    scene.add(rimLight);

    // --- Stars ---
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 30 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.cos(phi);
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.7 });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Camera Points ---
    const generatedCameras = generateUSCameras(5000);
    const allCameras = [...generatedCameras, ...VERIFIED_NM_CAMERAS];

    const totalCount = allCameras.length;
    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);

    allCameras.forEach((cam, i) => {
      const v = latLngToVector3(cam.lat, cam.lng, 1.012);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;

      if (cam.verified) {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.4;
        sizes[i] = 6.0;
      } else {
        colors[i * 3] = 0.86;
        colors[i * 3 + 1] = 0.15;
        colors[i * 3 + 2] = 0.15;
        sizes[i] = 2.5;
      }
    });

    const camGeo = new THREE.BufferGeometry();
    camGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    camGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    camGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const camMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        void main() {
          vColor = color;
          vSize = size;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vSize;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0);
          alpha = pow(alpha, 1.4);
          // Glow: brighter core
          float glow = exp(-d * 6.0) * 0.8;
          vec3 finalColor = vColor + glow * vec3(0.5, 0.3, 0.1);
          gl_FragColor = vec4(finalColor, alpha * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const camPoints = new THREE.Points(camGeo, camMat);
    globe.add(camPoints);

    // Globe pivot for rotation
    const pivot = new THREE.Object3D();
    pivot.add(globe);
    scene.add(pivot);

    // Initial tilt to show US prominently
    pivot.rotation.y = 1.2;

    // --- Raycaster for hover ---
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.015;
    const mouse = new THREE.Vector2();

    // --- Events ---
    const state = stateRef.current;

    const onMouseDown = (e) => {
      state.isDragging = true;
      state.previousMousePosition = { x: e.clientX, y: e.clientY };
      state.autoRotate = false;
      if (state.autoRotateTimer) clearTimeout(state.autoRotateTimer);
    };

    const onMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (state.isDragging) {
        const dx = e.clientX - state.previousMousePosition.x;
        const dy = e.clientY - state.previousMousePosition.y;
        pivot.rotation.y += dx * 0.005;
        pivot.rotation.x += dy * 0.005;
        pivot.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pivot.rotation.x));
        state.previousMousePosition = { x: e.clientX, y: e.clientY };
        setTooltip(null);
      } else {
        // Raycast for hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(camPoints);
        if (intersects.length > 0) {
          const idx = intersects[0].index;
          const cam = allCameras[idx];
          const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          setTooltip({
            x: screenPos.x,
            y: screenPos.y,
            type: cam.type || 'Surveillance Camera',
            location: cam.location || cam.city || 'Unknown',
            verified: cam.verified || false,
          });
          mount.style.cursor = 'crosshair';
        } else {
          setTooltip(null);
          mount.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = (e) => {
      if (!state.isDragging) return;
      state.isDragging = false;
      mount.style.cursor = 'grab';
      state.autoRotateTimer = setTimeout(() => { state.autoRotate = true; }, 3000);

      // Check click (small movement = click)
      const dx = e.clientX - state.previousMousePosition.x;
      const dy = e.clientY - state.previousMousePosition.y;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) {
        const rect = mount.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(camPoints);
        if (intersects.length > 0) {
          setSelectedCamera(allCameras[intersects[0].index]);
          setPanelOpen(true);
        }
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(1.4, Math.min(5, camera.position.z + e.deltaY * 0.002));
    };

    const onDblClick = (e) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      // Zoom in
      camera.position.z = Math.max(1.4, camera.position.z - 0.5);
    };

    mount.addEventListener('mousedown', onMouseDown);
    mount.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });
    mount.addEventListener('dblclick', onDblClick);
    mount.style.cursor = 'grab';

    // Resize handler
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // --- Animation Loop ---
    let animId;
    let time = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      time += 0.01;

      if (state.autoRotate && !state.isDragging) {
        pivot.rotation.y += 0.0015;
      }

      // Pulse verified cameras
      const sizeAttr = camGeo.getAttribute('size');
      for (let i = generatedCameras.length; i < totalCount; i++) {
        sizeAttr.array[i] = 5.5 + Math.sin(time * 2 + i) * 1.5;
      }
      sizeAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (state.autoRotateTimer) clearTimeout(state.autoRotateTimer);
      mount.removeEventListener('mousedown', onMouseDown);
      mount.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      mount.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      camGeo.dispose();
      camMat.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', background: '#000', fontFamily: 'monospace' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px 8px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: '#dc2626', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}>
            92,847 Cameras Documented
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: '#666', letterSpacing: '0.1em' }}>LIVE</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#555', letterSpacing: '0.05em' }}>
          Surveillance infrastructure mapped across the United States
        </div>
      </div>

      {/* Globe container */}
      <div style={{ position: 'relative', width: '100%', height: 620 }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Counter overlay */}
        <div style={{
          position: 'absolute', top: 16, left: 20,
          background: 'rgba(0,0,0,0.7)', border: '1px solid #1f1f1f',
          borderRadius: 4, padding: '8px 14px',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626',
              boxShadow: '0 0 6px #dc2626',
              animation: 'pulse-dot 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, letterSpacing: '0.08em' }}>
              92,847
            </span>
            <span style={{ fontSize: 11, color: '#888' }}>cameras</span>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: 'absolute',
            left: tooltip.x + 16,
            top: tooltip.y - 10,
            background: 'rgba(0,0,0,0.88)',
            border: `1px solid ${tooltip.verified ? '#f5c518' : '#dc2626'}`,
            borderRadius: 4,
            padding: '6px 10px',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            maxWidth: 200,
            zIndex: 10,
          }}>
            <div style={{ fontSize: 11, color: tooltip.verified ? '#f5c518' : '#dc2626', fontWeight: 600, marginBottom: 2 }}>
              {tooltip.verified ? '★ VERIFIED' : 'CAMERA'}
            </div>
            <div style={{ fontSize: 12, color: '#ddd' }}>{tooltip.type}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{tooltip.location}</div>
          </div>
        )}

        {/* Side panel */}
        <div style={{
          position: 'absolute', top: 0, right: 0, height: '100%',
          width: panelOpen ? 280 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          background: 'rgba(0,0,0,0.92)',
          borderLeft: '1px solid #1f1f1f',
          backdropFilter: 'blur(8px)',
          zIndex: 20,
        }}>
          {selectedCamera && (
            <div style={{ padding: 20, minWidth: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: selectedCamera.verified ? '#f5c518' : '#dc2626', fontWeight: 600, letterSpacing: '0.1em' }}>
                  {selectedCamera.verified ? '★ VERIFIED CAMERA' : 'CAMERA RECORD'}
                </span>
                <button
                  onClick={() => setPanelOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 16, padding: 0 }}
                >✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: '0.1em' }}>TYPE</div>
                  <div style={{ fontSize: 13, color: '#ddd' }}>{selectedCamera.type || 'Surveillance Camera'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: '0.1em' }}>LOCATION</div>
                  <div style={{ fontSize: 13, color: '#ddd' }}>{selectedCamera.location || selectedCamera.city || 'Unknown'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: '0.1em' }}>COORDINATES</div>
                  <div style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>
                    {selectedCamera.lat?.toFixed(4)}°, {selectedCamera.lng?.toFixed(4)}°
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 2, letterSpacing: '0.1em' }}>STATUS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: 12, color: '#22c55e' }}>Active</span>
                  </div>
                </div>
                {selectedCamera.verified && (
                  <div style={{
                    marginTop: 8, padding: '8px 10px',
                    background: 'rgba(245,197,24,0.08)',
                    border: '1px solid rgba(245,197,24,0.2)',
                    borderRadius: 4,
                    fontSize: 11, color: '#f5c518',
                    lineHeight: 1.5,
                  }}>
                    Field-verified location. Data sourced from public records and direct observation.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hint overlay */}
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, color: '#333', letterSpacing: '0.1em',
          pointerEvents: 'none',
        }}>
          DRAG TO ROTATE · SCROLL TO ZOOM · CLICK CAMERA TO INSPECT
        </div>
      </div>

      {/* Stat bar */}
      <div style={{
        display: 'flex', gap: 0,
        borderTop: '1px solid #111',
        background: '#050505',
      }}>
        {[
          { label: 'ALPR / PLATE READERS', value: '34,210', color: '#dc2626' },
          { label: 'PTZ CAMERAS', value: '18,440', color: '#f97316' },
          { label: 'FIXED SURVEILLANCE', value: '29,180', color: '#eab308' },
          { label: 'BODYCAM SYSTEMS', value: '11,017', color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '12px 16px',
            borderRight: i < 3 ? '1px solid #111' : 'none',
          }}>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.12em', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 16, color: stat.color, fontWeight: 700, letterSpacing: '0.04em' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #dc2626; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #dc2626; }
        }
      `}</style>
    </div>
  );
}
