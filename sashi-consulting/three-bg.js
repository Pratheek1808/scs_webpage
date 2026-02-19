// Interactive Globe Animation
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2.2; // Move camera closer for the globe

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Globe Group
    const globe = new THREE.Group();
    scene.add(globe);

    // 1. Particle Sphere
    const geometry = new THREE.BufferGeometry();
    const count = 1500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count);
        const theta = Math.sqrt(count * Math.PI) * phi;

        const r = 1.5;

        positions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xF97316, // Orange
        transparent: true,
        opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    globe.add(particles);

    // 2. Wireframe Sphere (Subtle)
    const wireframeGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xF97316,
        wireframe: true,
        transparent: true,
        opacity: 0.05,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    globe.add(wireframe);

    // Mouse Interaction
    const mouse = new THREE.Vector2();
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX - windowHalfX) * 0.001;
        mouse.y = (event.clientY - windowHalfY) * 0.001;
    });

    // Animation Loop
    const tick = () => {
        // Constant Rotation
        globe.rotation.y += 0.002;

        // Mouse Interaction
        globe.rotation.x += (mouse.y * 0.5 - globe.rotation.x) * 0.05;
        globe.rotation.y += (mouse.x * 0.5 - (globe.rotation.y % (Math.PI * 2))) * 0.05;

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});
