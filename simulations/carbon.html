<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>3D 碳同素異形體模擬</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Import Three.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.7/dat.gui.min.js"></script>
    <!-- Import OrbitControls -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
    <style>
        body { margin: 0; overflow: hidden; background-color: #0f172a; font-family: 'Noto Sans TC', sans-serif; }
        #info {
            position: absolute;
            top: 10px;
            width: 100%;
            text-align: center;
            color: white;
            pointer-events: none;
            z-index: 10;
        }
        .label-tag {
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 5px 10px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            pointer-events: none;
        }
        #controls {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 20;
            display: flex;
            flex-col: column;
            gap: 10px;
        }
    </style>
</head>
<body>

    <div id="info">
        <h1 class="text-2xl font-bold mt-4 text-shadow-lg">碳的 3D 結構之旅</h1>
        <p class="text-sm text-gray-300">請用滑鼠 <span class="text-yellow-400">拖曳旋轉</span> • 滾輪 <span class="text-yellow-400">縮放</span></p>
    </div>

    <div id="controls" class="flex flex-col items-end gap-3">
        <button id="powerBtn" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition transform hover:scale-105 border-2 border-red-400">
            OFF (電源關閉)
        </button>
        <div class="bg-slate-800/80 p-4 rounded-lg text-white text-sm backdrop-blur-sm border border-slate-600 max-w-xs">
            <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full bg-gray-400"></span> 碳原子
            </div>
            <div class="flex items-center gap-2 mb-2">
                <span class="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_5px_gold]"></span> 自由電子
            </div>
            <hr class="border-gray-600 my-2">
            <div class="mb-2"><strong class="text-blue-400">左側：石墨</strong><br>層狀結構，電子在層間高速移動。</div>
            <div><strong class="text-green-400">右側：鑽石</strong><br>立體網狀，結構緊密，電子無法移動。</div>
        </div>
    </div>

    <script>
        // --- SCENE SETUP ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a); // Dark slate blue
        scene.fog = new THREE.Fog(0x0f172a, 20, 100);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 20, 40);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        document.body.appendChild(renderer.domElement);

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 10);
        dirLight.castShadow = true;
        scene.add(dirLight);
        
        const dirLight2 = new THREE.DirectionalLight(0xccccff, 0.3);
        dirLight2.position.set(-10, 10, -10);
        scene.add(dirLight2);

        // --- MATERIALS & GEOMETRY ---
        const atomGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const bondGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
        const electronGeometry = new THREE.SphereGeometry(0.25, 16, 16);

        const graphiteAtomMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.3 });
        const diamondAtomMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.9 });
        const bondMat = new THREE.MeshStandardMaterial({ color: 0x64748b });
        const electronMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

        // --- GROUPS ---
        const graphiteGroup = new THREE.Group();
        const diamondGroup = new THREE.Group();
        const electronGroup = new THREE.Group();
        
        scene.add(graphiteGroup);
        scene.add(diamondGroup);
        graphiteGroup.add(electronGroup); // Electrons belong to graphite system

        // Shift positions to separate them
        graphiteGroup.position.set(-12, 0, 0);
        diamondGroup.position.set(12, 0, 0);

        // --- BUILD GRAPHITE (Layered Hexagonal) ---
        function createGraphite() {
            const layers = 3;
            const bondLen = 2.5;
            const layerDist = 5.0; // Large gap!
            
            // Hexagon logic
            // To create a grid of hexagons, we can place atoms at specific offsets
            const rows = 3;
            const cols = 3;

            for (let l = 0; l < layers; l++) {
                const y = (l - 1) * layerDist;
                
                // Build a hexagonal patch
                // We use a simplified grid and shift every other row
                for (let r = -rows; r <= rows; r++) {
                    for (let c = -cols; c <= cols; c++) {
                        // Hex grid math
                        let xOffset = r * bondLen * 1.5; // 1.5 because of shared sides
                        let zOffset = c * bondLen * Math.sqrt(3);
                        
                        if (r % 2 !== 0) {
                            zOffset += bondLen * Math.sqrt(3) / 2;
                        }

                        // Create Atom
                        const atom = new THREE.Mesh(atomGeometry, graphiteAtomMat);
                        atom.position.set(xOffset, y, zOffset);
                        graphiteGroup.add(atom);

                        // Create Bonds (Connect to neighbors)
                        // In 3D generation, easier to just connect if distance is correct
                        // This prevents duplicating logic. We will do a second pass for bonds.
                    }
                }
            }

            // Bonds Pass
            graphiteGroup.updateMatrixWorld();
            const atoms = graphiteGroup.children.filter(c => c.geometry === atomGeometry);
            
            // Use a Set to avoid double bonds
            const bondSet = new Set();

            for (let i = 0; i < atoms.length; i++) {
                for (let j = i + 1; j < atoms.length; j++) {
                    const a1 = atoms[i];
                    const a2 = atoms[j];
                    const dist = a1.position.distanceTo(a2.position);

                    // Connect if distance is approx bondLen (within small error)
                    if (dist > bondLen - 0.1 && dist < bondLen + 0.1) {
                        createBond(a1.position, a2.position, graphiteGroup);
                    }
                }
            }

            // --- ELECTRONS (Free moving between layers) ---
            // Create a pool of electrons
            for(let i=0; i<80; i++) {
                const e = new THREE.Mesh(electronGeometry, electronMat);
                
                // Random position between layers
                // Layer Ys are: -5, 0, 5
                // We want them around Y = -2.5 and Y = 2.5
                const layerChoice = Math.random() > 0.5 ? 2.5 : -2.5;
                
                e.position.set(
                    (Math.random() - 0.5) * 15,
                    layerChoice + (Math.random() - 0.5) * 1.5, // Slight cloud thickness
                    (Math.random() - 0.5) * 15
                );
                
                // Store velocity userData
                e.userData = {
                    velocity: new THREE.Vector3(0, 0, 0),
                    baseSpeed: 0.1 + Math.random() * 0.2
                };
                
                electronGroup.add(e);
            }
        }

        // --- BUILD DIAMOND (Zinc Blende / Tetrahedral) ---
        function createDiamond() {
            const bondLen = 2.5; // Keep visual scale similar
            // Diamond Cubic Structure
            // Basis: (0,0,0) and (0.25, 0.25, 0.25) in a cubic cell
            // We'll generate points and filter.
            
            const gridSize = 1; // 2x2x2 unit cells
            const a = 4.5; // Unit cell size
            
            const atomsPos = [];

            // Face Centered Cubic positions
            const fcc = [
                [0,0,0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5],
                [1,0,0], [0,1,0], [0,0,1], // corners
                [1,1,0], [1,0,1], [0,1,1],
                [1,1,1], [0.5, 0.5, 1], [0.5, 1, 0.5], [1, 0.5, 0.5]
            ];
            
            // To make a nice cluster, let's just use the recursive tetrahedral approach
            // It looks more "organic" like the chemical diagrams usually show.
            
            // Standard approach: Generate nodes.
            const nodes = [];
            
            // Generate Unit Cells
            for(let x=-1; x<=1; x++) {
                for(let y=-1; y<=1; y++) {
                    for(let z=-1; z<=1; z++) {
                        let ox = x * a;
                        let oy = y * a;
                        let oz = z * a;
                        
                        // FCC 1
                        nodes.push(new THREE.Vector3(ox, oy, oz));
                        nodes.push(new THREE.Vector3(ox+0, oy+a/2, oz+a/2));
                        nodes.push(new THREE.Vector3(ox+a/2, oy+0, oz+a/2));
                        nodes.push(new THREE.Vector3(ox+a/2, oy+a/2, oz+0));
                        
                        // FCC 2 (Offset by 0.25)
                        let off = a/4;
                        nodes.push(new THREE.Vector3(ox+off, oy+off, oz+off));
                        nodes.push(new THREE.Vector3(ox+off, oy+a/2+off, oz+a/2+off));
                        nodes.push(new THREE.Vector3(ox+a/2+off, oy+off, oz+a/2+off));
                        nodes.push(new THREE.Vector3(ox+a/2+off, oy+a/2+off, oz+off));
                    }
                }
            }
            
            // Filter to make a sphere-ish shape to look nice
            const radius = 6.5;
            const validNodes = nodes.filter(v => v.length() < radius);

            validNodes.forEach(pos => {
                const atom = new THREE.Mesh(atomGeometry, diamondAtomMat);
                atom.position.copy(pos);
                diamondGroup.add(atom);
            });

            // Bonds
            // Diamond bond length is sqrt(3)/4 * a ~= 0.433 * a
            const d_bond = (Math.sqrt(3)/4) * a;
            
            for(let i=0; i<diamondGroup.children.length; i++) {
                for(let j=i+1; j<diamondGroup.children.length; j++) {
                    const a1 = diamondGroup.children[i];
                    const a2 = diamondGroup.children[j];
                    const dist = a1.position.distanceTo(a2.position);
                    
                    if (dist > d_bond - 0.1 && dist < d_bond + 0.1) {
                         createBond(a1.position, a2.position, diamondGroup);
                    }
                }
            }
        }

        function createBond(p1, p2, group) {
            const distance = p1.distanceTo(p2);
            const cylinder = new THREE.Mesh(bondGeometry, bondMat);
            
            // Position: Midpoint
            cylinder.position.copy(p1).add(p2).multiplyScalar(0.5);
            
            // Scale height to distance
            cylinder.scale.y = distance;
            
            // Rotate to align
            cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
            
            group.add(cylinder);
        }

        // --- LABELS (Text Sprite) ---
        function createLabel(text, position) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256; 
            canvas.height = 128;
            context.fillStyle = "rgba(0,0,0,0)";
            context.fillRect(0,0,256,128);
            
            context.font = "Bold 40px 'Noto Sans TC'";
            context.fillStyle = "white";
            context.textAlign = "center";
            context.fillText(text, 128, 64);
            
            context.font = "24px 'Noto Sans TC'";
            context.fillStyle = "#cbd5e1";
            context.fillText(text === "石墨 (Graphite)" ? "導電 Conductor" : "絕緣 Insulator", 128, 96);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.copy(position);
            sprite.scale.set(10, 5, 1);
            scene.add(sprite);
        }

        // --- ANIMATION & INTERACTION ---
        let isPowerOn = false;
        const powerBtn = document.getElementById('powerBtn');

        powerBtn.addEventListener('click', () => {
            isPowerOn = !isPowerOn;
            if(isPowerOn) {
                powerBtn.textContent = "ON (通電中)";
                powerBtn.classList.remove('bg-red-600', 'hover:bg-red-700', 'border-red-400');
                powerBtn.classList.add('bg-green-600', 'hover:bg-green-700', 'border-green-400');
                controls.autoRotate = false; // Stop rotating so user can watch flow
            } else {
                powerBtn.textContent = "OFF (電源關閉)";
                powerBtn.classList.remove('bg-green-600', 'hover:bg-green-700', 'border-green-400');
                powerBtn.classList.add('bg-red-600', 'hover:bg-red-700', 'border-red-400');
                controls.autoRotate = true;
            }
        });

        // Initialize
        createGraphite();
        createDiamond();
        createLabel("石墨 (Graphite)", new THREE.Vector3(-12, 10, 0));
        createLabel("鑽石 (Diamond)", new THREE.Vector3(12, 10, 0));

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();

            // Electron Logic
            electronGroup.children.forEach(e => {
                if(isPowerOn) {
                    // Flow direction (let's say X axis)
                    e.position.x += e.userData.baseSpeed * 4;
                    
                    // Add some jitter for quantum cloud effect
                    e.position.y += (Math.random() - 0.5) * 0.05;
                    e.position.z += (Math.random() - 0.5) * 0.05;

                    // Reset if out of bounds
                    if(e.position.x > 10) e.position.x = -10;
                } else {
                    // Brownian motion (Random wiggle)
                    e.position.x += (Math.random() - 0.5) * 0.1;
                    e.position.z += (Math.random() - 0.5) * 0.1;
                    // Keep roughly in place
                    if(e.position.x > 8) e.position.x -= 0.5;
                    if(e.position.x < -8) e.position.x += 0.5;
                }
            });

            // Subtle floating animation for the whole groups
            const time = Date.now() * 0.001;
            graphiteGroup.position.y = Math.sin(time) * 0.5;
            diamondGroup.position.y = Math.cos(time) * 0.5;

            renderer.render(scene, camera);
        }

        animate();

        // Handle Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

    </script>
</body>
</html>
