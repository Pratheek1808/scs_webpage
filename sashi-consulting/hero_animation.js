// Hero Animation - Futuristic Abstract Polygons (Neon/Tech)
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x0B1120); // Match CSS
    scene.fog = new THREE.FogExp2(0x0B1120, 0.035); // Deep fog for depth

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Floating Structures ────────────────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);

    const geometries = [
        new THREE.IcosahedronGeometry(1.0, 0),
        new THREE.OctahedronGeometry(1.0, 0),
        new THREE.DodecahedronGeometry(1.0, 0)
    ];

    const materialWire = new THREE.LineBasicMaterial({
        color: 0x38bdf8, // Sky Blue / Cyan Neon
        transparent: true,
        opacity: 0.25
    });

    const materialSolid = new THREE.MeshBasicMaterial({
        color: 0x0B1120, // Dark core to block things behind
        polygonOffset: true,
        polygonOffsetFactor: 1, // Draw behind lines
        polygonOffsetUnits: 1
    });

    // Create a field of floating shapes
    const shapes = [];
    for (let i = 0; i < 40; i++) {
        const geoIndex = Math.floor(Math.random() * geometries.length);
        const geometry = geometries[geoIndex];

        // Combine wireframe and solidity
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe, materialWire.clone());

        // Vary opacity/color slightly
        const isHighlight = Math.random() > 0.8;
        if (isHighlight) {
            line.material.color.setHex(0xA855F7); // Purple highlight
            line.material.opacity = 0.5;
        } else {
            line.material.opacity = 0.1 + Math.random() * 0.2;
        }

        // Inner black mesh to hide lines behind it (optional, adds solidity)
        const mesh = new THREE.Mesh(geometry, materialSolid);

        const shapeGroup = new THREE.Group();
        shapeGroup.add(mesh);
        shapeGroup.add(line);

        // Random Position
        shapeGroup.position.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20 - 5
        );

        // Random Scale
        const scale = 0.5 + Math.random() * 1.5;
        shapeGroup.scale.set(scale, scale, scale);

        // Random Rotation Speed
        shapeGroup.userData = {
            rotSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            floatSpeed: 0.2 + Math.random() * 0.3,
            floatOffset: Math.random() * Math.PI * 2,
            baseY: shapeGroup.position.y
        };

        group.add(shapeGroup);
        shapes.push(shapeGroup);
    }

    // ── Mouse Interaction ──────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth - 0.5);
        mouseY = (event.clientY / window.innerHeight - 0.5);
    });

    // ── Animation Loop ─────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Rotate entire group slowly
        group.rotation.y = t * 0.05;

        shapes.forEach((shape) => {
            const data = shape.userData;

            // Self-rotation
            shape.rotation.x += data.rotSpeed.x;
            shape.rotation.y += data.rotSpeed.y;
            shape.rotation.z += data.rotSpeed.z;

            // Gentle Float
            shape.position.y = data.baseY + Math.sin(t * data.floatSpeed + data.floatOffset) * 0.5;
        });

        // Smooth Camera Parallax
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
        camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    };

    animate();

    // ── Resize ─────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
