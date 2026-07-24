'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (a, b, t) => a + (b - a) * t;

// Cria uma viga sólida (não uma linha de wireframe, que fica quase invisível em GPU real)
// ligando dois pontos, usada para montar a gaiola da impressora.
function createBeam(from, to, thickness, material, geometries) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const length = start.distanceTo(end);
  const geometry = new THREE.BoxGeometry(thickness, length, thickness);
  geometries.push(geometry);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start).normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  return mesh;
}

export default function Hero3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.warn('[Hero3D] WebGL indisponível, ocultando o objeto 3D.', err);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0.3, 6.2);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight('#FAF9F6', '#0B1D33', 1.0);
    scene.add(hemiLight);
    const keyLight = new THREE.DirectionalLight('#9C7A3C', 1.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight('#0F6E56', 0.8);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    // Impressora 3D genérica (sem replicar nenhuma marca): gaiola sólida em vigas,
    // mesa, gantry e cabeçote que se movem, e uma peça que "cresce" na mesa em loop.
    const cageWidth = 1.9;
    const cageHeight = 2.3;
    const cageDepth = 1.9;
    const hw = cageWidth / 2;
    const hh = cageHeight / 2;
    const hd = cageDepth / 2;

    const beamGeometries = [];
    const frameMaterial = new THREE.MeshStandardMaterial({ color: '#132A46', roughness: 0.4, metalness: 0.35 });

    const corners = {
      topFrontLeft: [-hw, hh, hd],
      topFrontRight: [hw, hh, hd],
      topBackLeft: [-hw, hh, -hd],
      topBackRight: [hw, hh, -hd],
      bottomFrontLeft: [-hw, -hh, hd],
      bottomFrontRight: [hw, -hh, hd],
      bottomBackLeft: [-hw, -hh, -hd],
      bottomBackRight: [hw, -hh, -hd],
    };

    const beamEdges = [
      // verticais (4 pilares)
      [corners.topFrontLeft, corners.bottomFrontLeft],
      [corners.topFrontRight, corners.bottomFrontRight],
      [corners.topBackLeft, corners.bottomBackLeft],
      [corners.topBackRight, corners.bottomBackRight],
      // topo (retângulo)
      [corners.topFrontLeft, corners.topFrontRight],
      [corners.topBackLeft, corners.topBackRight],
      [corners.topFrontLeft, corners.topBackLeft],
      [corners.topFrontRight, corners.topBackRight],
      // base (retângulo)
      [corners.bottomFrontLeft, corners.bottomFrontRight],
      [corners.bottomBackLeft, corners.bottomBackRight],
      [corners.bottomFrontLeft, corners.bottomBackLeft],
      [corners.bottomFrontRight, corners.bottomBackRight],
    ];

    const cage = new THREE.Group();
    beamEdges.forEach(([from, to]) => {
      cage.add(createBeam(from, to, 0.06, frameMaterial, beamGeometries));
    });

    const bedY = -hh + 0.1;
    const bedGeometry = new THREE.BoxGeometry(cageWidth * 0.82, 0.08, cageDepth * 0.82);
    const bedMaterial = new THREE.MeshStandardMaterial({ color: '#0F6E56', roughness: 0.5, metalness: 0.1 });
    const bed = new THREE.Mesh(bedGeometry, bedMaterial);
    bed.position.y = bedY;

    const gantryMinY = bedY + 0.4;
    const gantryMaxY = hh - 0.3;
    const gantryTravel = cageWidth * 0.7;

    const gantryGeometry = new THREE.BoxGeometry(cageWidth * 0.9, 0.08, 0.14);
    const gantryMaterial = new THREE.MeshStandardMaterial({ color: '#9C7A3C', roughness: 0.3, metalness: 0.65 });
    const gantry = new THREE.Mesh(gantryGeometry, gantryMaterial);
    gantry.position.y = gantryMinY;

    const headGeometry = new THREE.BoxGeometry(0.26, 0.24, 0.26);
    const headMaterial = new THREE.MeshStandardMaterial({ color: '#132A46', roughness: 0.35, metalness: 0.4 });
    const printHead = new THREE.Mesh(headGeometry, headMaterial);

    const ledGeometry = new THREE.SphereGeometry(0.05, 12, 12);
    const ledMaterial = new THREE.MeshStandardMaterial({
      color: '#9C7A3C',
      emissive: new THREE.Color('#9C7A3C'),
      emissiveIntensity: 1.6,
      roughness: 0.3,
    });
    const led = new THREE.Mesh(ledGeometry, ledMaterial);
    led.position.set(0, -0.02, 0.17);
    printHead.add(led);

    const printMaxHeight = gantryMaxY - bedY - 0.5;
    const printGeometry = new THREE.CylinderGeometry(0.28, 0.32, 1, 28);
    const printMaterial = new THREE.MeshStandardMaterial({
      color: '#0F6E56',
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 1,
    });
    const printPiece = new THREE.Mesh(printGeometry, printMaterial);

    const printerGroup = new THREE.Group();
    printerGroup.add(cage, bed, gantry, printHead, printPiece);
    scene.add(printerGroup);

    let targetTiltX = 0;
    let targetTiltZ = 0;
    let tiltX = 0;
    let tiltZ = 0;
    let hovering = false;

    function updateTargetFromEvent(event) {
      const rect = container.getBoundingClientRect();
      const nx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const ny = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      targetTiltX = ny * 0.2;
      targetTiltZ = -nx * 0.28;
    }

    function handlePointerMove(event) {
      hovering = true;
      updateTargetFromEvent(event);
    }

    function handlePointerLeave() {
      hovering = false;
      targetTiltX = 0;
      targetTiltZ = 0;
    }

    // O parallax que segue o cursor é a parte que reduced-motion deve cortar; a
    // animação ambiente (giro, gantry, peça crescendo) continua, senão o objeto
    // fica completamente parado pra quem tem essa preferência do sistema ligada.
    if (!prefersReducedMotion) {
      container.addEventListener('pointermove', handlePointerMove);
      container.addEventListener('pointerleave', handlePointerLeave);
    }

    function resize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const startTime = performance.now();
    let rafId = null;
    const printLoopSeconds = 4;

    function frameUpdate(elapsed) {
      if (!prefersReducedMotion) {
        const followSpeed = hovering ? 0.12 : 0.06;
        tiltX += (targetTiltX - tiltX) * followSpeed;
        tiltZ += (targetTiltZ - tiltZ) * followSpeed;
      }

      printerGroup.rotation.y = Math.sin(elapsed * 0.5) * 0.28;
      printerGroup.rotation.x = tiltX;
      printerGroup.rotation.z = tiltZ;

      const gantryT = Math.sin(elapsed * 0.7) * 0.5 + 0.5;
      gantry.position.y = lerp(gantryMinY, gantryMaxY, gantryT);

      printHead.position.y = gantry.position.y;
      printHead.position.x = Math.sin(elapsed * 2.4) * (gantryTravel / 2);
      printHead.position.z = 0.08;

      const printT = (elapsed % printLoopSeconds) / printLoopSeconds;
      const currentHeight = Math.max(0.02, printT * printMaxHeight);
      printPiece.scale.y = currentHeight;
      printPiece.position.y = bedY + 0.04 + currentHeight / 2;
      printMaterial.opacity = printT > 0.9 ? clamp(1 - (printT - 0.9) / 0.1, 0, 1) : 1;

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }

    function animate() {
      frameUpdate((performance.now() - startTime) / 1000);
      rafId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      beamGeometries.forEach((geometry) => geometry.dispose());
      frameMaterial.dispose();
      bedGeometry.dispose();
      bedMaterial.dispose();
      gantryGeometry.dispose();
      gantryMaterial.dispose();
      headGeometry.dispose();
      headMaterial.dispose();
      ledGeometry.dispose();
      ledMaterial.dispose();
      printGeometry.dispose();
      printMaterial.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full cursor-pointer" aria-hidden="true" />;
}
