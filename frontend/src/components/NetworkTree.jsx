import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const NetworkTree = ({ data, onClose }) => {
  const mountRef = useRef(null);
  
  // Refs to store objects for cleanup
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // --- 1. CLEANUP PREVIOUS SCENE ---
    if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
    }

    // --- CONFIGURATION ---
    const config = {
      cardWidth: 20, cardHeight: 28, cardDepth: 1.5,
      verticalGap: 40, horizontalGap: 25,
      bgColor: 0x2a0a3a, fogColor: 0x4a1a5a
    };

    // --- BRIGHT COLOR PALETTE ---
    const brightColors = [
        '#3498db', // Blue
        '#e74c3c', // Red
        '#9b59b6', // Purple
        '#2ecc71', // Emerald
        '#f39c12', // Orange
        '#1abc9c', // Teal
        '#e67e22', // Carrot
        '#34495e'  // Wet Asphalt
    ];

    // --- DATA PREPARATION ---
    const treeData = JSON.parse(JSON.stringify(data));

    // --- LAYOUT ALGORITHM ---
    function calculateSubtreeWidth(node) {
      if (!node.children || node.children.length === 0) {
        node.width = config.cardWidth;
        return node.width;
      }
      let totalWidth = 0;
      node.children.forEach(child => { totalWidth += calculateSubtreeWidth(child); });
      totalWidth += (node.children.length - 1) * config.horizontalGap;
      node.width = Math.max(config.cardWidth, totalWidth);
      return node.width;
    }

    function assignPositions(node, x, y) {
      node.x = x; node.y = y;
      if (node.children && node.children.length > 0) {
        let startX = x - node.width / 2;
        node.children.forEach(child => {
          const childX = startX + child.width / 2;
          assignPositions(child, childX, y - config.verticalGap);
          startX += child.width + config.horizontalGap;
        });
      }
    }

    let totalSceneWidth = 0;
    const roots = Array.isArray(treeData) ? treeData : [treeData];
    roots.forEach(root => {
      calculateSubtreeWidth(root);
      assignPositions(root, totalSceneWidth, 0); 
      totalSceneWidth += root.width + (config.horizontalGap * 2);
    });
    const xOffset = totalSceneWidth / 2 - (config.horizontalGap);

    // --- SCENE SETUP ---
    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene; 
    scene.background = new THREE.Color(config.bgColor);
    scene.fog = new THREE.Fog(config.fogColor, 100, 1500);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    camera.position.set(0, 50, 400);

    const renderer = new THREE.WebGLRenderer({ antialias: true }); // Antialias is key for sharp edges
    renderer.setPixelRatio(window.devicePixelRatio); // Handle retina displays
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Brighter ambient
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    dirLight.position.set(100, 200, 200);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x00ffff, 1.5);
    rimLight.position.set(-100, 50, -200);
    scene.add(rimLight);

    // --- TEXTURES (HIGH RESOLUTION) ---
    function createCardTexture(name, role, color, profilePic) {
      const canvas = document.createElement('canvas');
      // DOUBLED RESOLUTION for sharpness (512x716)
      canvas.width = 512; 
      canvas.height = 716;
      const ctx = canvas.getContext('2d');

      // 1. Draw Base Card
      ctx.fillStyle = '#ffffff'; 
      ctx.fillRect(0,0,512,716);
      
      // Top Color Bar
      ctx.fillStyle = color; 
      ctx.fillRect(0,0,512,30);

      // 2. Avatar Dimensions (Scaled up)
      const cx = 256; const cy = 220; const r = 120;

      // 3. Draw Placeholder Circle
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.fillStyle = '#f0f0f0'; ctx.fill();
      
      // 4. Initials
      ctx.fillStyle = color; 
      ctx.font = 'bold 100px Arial'; // Larger font
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const initial = name ? name.charAt(0).toUpperCase() : "?";
      ctx.fillText(initial, cx, cy);

      // 5. Border
      ctx.lineWidth = 12; ctx.strokeStyle = color; ctx.stroke();
      
      // 6. Name (Black, Bold, Large)
      ctx.fillStyle = '#000000'; 
      ctx.font = 'bold 52px Arial'; // High contrast font
      ctx.textAlign = 'center'; 
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(name || "User", cx, 440);

      // 7. Role (Gray, Italic)
      ctx.fillStyle = '#555555'; 
      ctx.font = 'italic 36px Arial';
      ctx.fillText(role || "Member", cx, 500);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      // ANISOTROPY prevents blurring at angles
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy(); 

      // 8. ASYNC IMAGE LOADING
      if (profilePic) {
          const img = new Image();
          img.src = `${__BACKEND_URL__}/uploads/${profilePic}`;
          img.crossOrigin = "Anonymous";

          img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI*2);
              ctx.closePath();
              ctx.clip(); 

              // Draw image (scaled coordinates)
              ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
              ctx.restore();

              ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
              ctx.lineWidth = 12; ctx.strokeStyle = color; ctx.stroke();

              texture.needsUpdate = true;
          };
      }

      return texture;
    }

    // --- PARTICLES ---
    function createParticles() {
        const count = 1500;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const palette = [[1,0.2,0.2], [0.2,1,0.2], [0.2,0.5,1], [1,1,0.2], [1,0.2,1]];
        
        for(let i=0; i<count; i++) {
            pos[i*3] = (Math.random()-0.5) * 1200;
            pos[i*3+1] = (Math.random()-0.5) * 800;
            pos[i*3+2] = (Math.random()-0.5) * 800;
            const c = palette[Math.floor(Math.random()*palette.length)];
            col[i*3] = c[0]; col[i*3+1] = c[1]; col[i*3+2] = c[2];
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 32; canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(16,16,0, 16,16,16);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0,0,32,32);
        const particleTexture = new THREE.CanvasTexture(canvas);

        const mat = new THREE.PointsMaterial({ 
            size: 10, map: particleTexture, vertexColors: true, 
            transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false 
        });
        return new THREE.Points(geo, mat);
    }
    const particles = createParticles();
    scene.add(particles);

    // --- BUILDER ---
    const geometry = new THREE.BoxGeometry(config.cardWidth, config.cardHeight, config.cardDepth);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffaa00, linewidth: 2, transparent: true, opacity: 0.6 });
    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 });
    
    const treeGroup = new THREE.Group();
    scene.add(treeGroup);
    const cards = [];

    function buildVisuals(node) {
        // Pick a color from our curated list based on name length
        const colorIndex = node.name.length % brightColors.length;
        const color = brightColors[colorIndex];
        
        const texture = createCardTexture(node.name, node.role, color, node.profilePic);
        
        const faceMat = new THREE.MeshStandardMaterial({ 
            map: texture, 
            roughness: 0.2, 
            metalness: 0.05 // Reduced metalness for clearer white background
        });
        const materials = [sideMaterial, sideMaterial, sideMaterial, sideMaterial, faceMat, sideMaterial];
        
        const mesh = new THREE.Mesh(geometry, materials);
        mesh.position.set(node.x - xOffset, node.y, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        mesh.userData = { id: node._id, originalY: node.y }; 
        
        treeGroup.add(mesh);
        cards.push(mesh);

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                const start = new THREE.Vector3(node.x - xOffset, node.y - (config.cardHeight/2), -config.cardDepth/2);
                const end = new THREE.Vector3(child.x - xOffset, child.y + (config.cardHeight/2), -config.cardDepth/2);
                const points = [start, end];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeo, lineMaterial);
                treeGroup.add(line);
                buildVisuals(child);
            });
        }
    }
    roots.forEach(root => buildVisuals(root));

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 1000;

    // --- INTERACTION ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered = null;

    const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    // --- ANIMATION LOOP ---
    function animate() {
        frameIdRef.current = requestAnimationFrame(animate);
        controls.update();
        if(particles) {
            particles.rotation.y += 0.0005;
            particles.rotation.x += 0.0002;
        }

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(cards);

        if(intersects.length > 0) {
            const obj = intersects[0].object;
            if(hovered !== obj) {
                if(hovered) hovered.position.z = 0;
                hovered = obj;
            }
            obj.position.z = THREE.MathUtils.lerp(obj.position.z, 15, 0.1);
        } else {
            if(hovered) {
                hovered.position.z = THREE.MathUtils.lerp(hovered.position.z, 0, 0.1);
                if(hovered.position.z < 0.1) {
                    hovered.position.z = 0;
                    hovered = null;
                }
            }
        }
        renderer.render(scene, camera);
    }
    animate();

    // --- RESIZE ---
    const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', onMouseMove);
        cancelAnimationFrame(frameIdRef.current);
        if (mountRef.current && rendererRef.current) {
            mountRef.current.removeChild(rendererRef.current.domElement);
        }
        if (rendererRef.current) rendererRef.current.dispose();
        geometry.dispose();
        scene.clear();
    };

  }, [data]);

  return (
    <div style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        zIndex: 9999, background: '#000', overflow: 'hidden' 
    }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        
        {/* CLOSE BUTTON (FIXED CENTERING) */}
        <button 
            onClick={onClose}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(255, 0, 0, 1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255, 0, 0, 0.8)';
            }}
            style={{
                position: 'absolute', 
                top: '25px', 
                right: '30px',
                width: '50px',  // Size
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(255, 0, 0, 0.8)', 
                color: 'white', 
                border: '2px solid white', 
                fontSize: '22px', 
                fontWeight: 'bold',
                cursor: 'pointer', 
                zIndex: 10000,
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                display: 'flex',          // Flexbox for perfect centering
                justifyContent: 'center', // Horizontal center
                alignItems: 'center',     // Vertical center
                transition: 'all 0.2s ease',
                outline: 'none'
            }}
        >
            ✕
        </button>

        <div style={{
            position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)',
            padding: '10px 25px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', display: 'flex', gap: '20px', fontSize: '14px', pointerEvents: 'none', userSelect: 'none'
        }}>
            <span>🖱️ Pan: Right Click</span>
            <span>🔍 Zoom: Scroll</span>
            <span>👆 Rotate: Left Click</span>
        </div>
    </div>
  );
};

export default NetworkTree;