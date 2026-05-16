'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

const WHATSAPP_NUMBER = '5598984809302';

const COLORS = [
  { id: 'rosa',    name: 'Rosa Bebê',    hex: '#F8C8D0', three: 0xF8C8D0 },
  { id: 'azul',   name: 'Azul Bebê',    hex: '#B8D8F0', three: 0xB8D8F0 },
  { id: 'branco', name: 'Branco',        hex: '#F5F5F5', three: 0xF5F5F5 },
  { id: 'lilas',  name: 'Lilás',         hex: '#D8C8F0', three: 0xD8C8F0 },
  { id: 'verde',  name: 'Verde Menta',   hex: '#B8E8D0', three: 0xB8E8D0 },
  { id: 'amarelo',name: 'Amarelo',       hex: '#F8E8A0', three: 0xF8E8A0 },
];

const CATEGORIES = {
  Feminino: ['Princesa', 'Floral', 'Nuvem Rosa', 'Ursinha', 'Lua Estrelada', 'Borboletas', 'Bailarina', 'Arco-íris'],
  Masculino: ['Safari', 'Astronauta', 'Leãozinho', 'Nuvem Azul', 'Carrinhos', 'Avião'],
};

export default function PlacasPersonalizadas() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const plateRef = useRef(null);
  const textMeshRef = useRef(null);
  const frameRef = useRef(null);
  const fontRef = useRef(null);

  const [babyName, setBabyName] = useState('Maria Laura');
  const [category, setCategory] = useState('Feminino');
  const [selectedModel, setSelectedModel] = useState('Princesa');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Init Three.js
  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 24);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(10, 20, 15);
    dir.castShadow = true;
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x8888ff, 0.4);
    fill.position.set(-10, 5, -5);
    scene.add(fill);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 40;

    // Build plate
    buildPlate(scene, COLORS[0].three);

    // Load font
    new FontLoader().load(
      'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
      (font) => { fontRef.current = font; setFontLoaded(true); }
    );

    // Animate
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  const buildPlate = (scene, colorHex) => {
    if (plateRef.current) {
      scene.remove(plateRef.current);
      plateRef.current.geometry.dispose();
      plateRef.current.material.dispose();
    }
    const geo = new THREE.BoxGeometry(22, 9, 3);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.55, metalness: 0.1 });
    const plate = new THREE.Mesh(geo, mat);
    plate.castShadow = true;
    plate.receiveShadow = true;
    scene.add(plate);
    plateRef.current = plate;

    // Holes
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x888899 });
    const holeGeo = new THREE.CylinderGeometry(0.4, 0.4, 3.2, 16);
    [-8, 8].forEach(x => {
      const h = new THREE.Mesh(holeGeo, holeMat);
      h.rotation.x = Math.PI / 2;
      h.position.set(x, 3.2, 0);
      plate.add(h);
    });
  };

  // Update color
  useEffect(() => {
    if (plateRef.current) {
      plateRef.current.material.color.set(selectedColor.three);
    }
  }, [selectedColor]);

  // Update text
  useEffect(() => {
    if (!fontLoaded || !sceneRef.current) return;
    const scene = sceneRef.current;

    if (textMeshRef.current) {
      scene.remove(textMeshRef.current);
      textMeshRef.current.geometry.dispose();
      textMeshRef.current = null;
    }

    const name = babyName.trim() || 'Nome';
    const size = name.length > 10 ? 1.1 : name.length > 7 ? 1.4 : 1.8;

    const geo = new TextGeometry(name, {
      font: fontRef.current,
      size,
      depth: 0.8,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    });
    geo.computeBoundingBox();
    const w = geo.boundingBox.max.x - geo.boundingBox.min.x;

    const mat = new THREE.MeshStandardMaterial({ color: 0x222233, roughness: 0.4, metalness: 0.15 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(-w / 2, -0.6, 1.5);
    mesh.castShadow = true;
    scene.add(mesh);
    textMeshRef.current = mesh;
  }, [babyName, fontLoaded]);

  // Download STL
  const downloadSTL = () => {
    if (!sceneRef.current || !plateRef.current) return;
    setIsDownloading(true);
    try {
      const group = new THREE.Group();
      group.add(plateRef.current.clone());
      if (textMeshRef.current) group.add(textMeshRef.current.clone());
      const stl = new STLExporter().parse(group, { binary: false });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([stl], { type: 'text/plain' })),
        download: `LJVision-${(babyName || 'placa').replace(/\s+/g, '-').toLowerCase()}.stl`,
      });
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOrder = () => {
    const msg = `Olá! Quero encomendar uma placa decorativa personalizada:\n- Nome: *${babyName}*\n- Categoria: ${category}\n- Tema: ${selectedModel}\n- Cor: ${selectedColor.name}\n\nPor favor, me informe prazo e pagamento!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="text-rose-500 font-semibold uppercase tracking-widest text-sm mb-2">Personalização Exclusiva</p>
        <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          Criar Placa <span className="text-rose-500">Personalizada</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize em 3D antes de encomendar. Gire e explore sua placa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 3D Viewer */}
        <div className="space-y-4">
          <div
            ref={mountRef}
            className="w-full rounded-3xl overflow-hidden border"
            style={{ height: '22rem', borderColor: 'var(--border-color)' }}
          />
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            🖱️ Arraste para girar · Scroll para zoom
          </p>
          <div className="flex gap-3">
            <button
              onClick={downloadSTL}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all border"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {isDownloading ? 'Gerando...' : 'Baixar STL'}
            </button>
            <button
              onClick={handleOrder}
              className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-1"
            >
              Encomendar via WhatsApp
            </button>
          </div>
        </div>

        {/* Controls */}
        <div
          className="rounded-3xl border p-6 space-y-6"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>1. Categoria</label>
            <div className="flex gap-3">
              {Object.keys(CATEGORIES).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setSelectedModel(CATEGORIES[cat][0]); }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={category === cat
                    ? { backgroundColor: '#e11d48', color: '#fff', boxShadow: '0 4px 12px rgba(225,29,72,0.3)' }
                    : { backgroundColor: 'var(--bg-page)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
              2. Tema ({CATEGORIES[category].length} opções)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES[category].map(model => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className="py-2 px-3 text-sm rounded-xl border text-left font-medium transition-all"
                  style={selectedModel === model
                    ? { borderColor: '#e11d48', backgroundColor: 'rgba(225,29,72,0.06)', color: '#e11d48' }
                    : { borderColor: 'var(--border-color)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }
                  }
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>3. Nome</label>
            <input
              type="text"
              value={babyName}
              onChange={e => setBabyName(e.target.value)}
              maxLength={15}
              placeholder="Digite o nome..."
              className="w-full rounded-xl px-4 py-3 text-lg outline-none transition-all border focus:ring-2 focus:ring-rose-500"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
            <p className="text-right text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{babyName.length}/15</p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>4. Cor da Placa</label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                  className="w-11 h-11 rounded-full transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.hex,
                    border: selectedColor.id === color.id ? '3px solid #e11d48' : '2px solid var(--border-color)',
                    transform: selectedColor.id === color.id ? 'scale(1.15)' : '',
                    boxShadow: selectedColor.id === color.id ? '0 4px 12px rgba(0,0,0,0.2)' : '',
                  }}
                />
              ))}
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{selectedColor.name}</p>
          </div>

          {/* CTA */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--cart-bg)', color: 'var(--cart-text)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm opacity-60 mb-0.5">Valor estimado</p>
                <p className="text-3xl font-black">R$ 89,90</p>
              </div>
              <span className="text-xs text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full">Frete Grátis</span>
            </div>
            <button
              onClick={handleOrder}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-rose-500/30"
            >
              Encomendar via WhatsApp ✨
            </button>
            <p className="text-center text-xs mt-3 opacity-40">
              Enviamos fotos do progresso antes de finalizar.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
