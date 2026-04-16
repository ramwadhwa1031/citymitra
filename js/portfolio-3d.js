document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Vibrant Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x00F0FF, 3);
    cyanLight.position.set(5, 5, 5);
    scene.add(cyanLight);

    const magentaLight = new THREE.DirectionalLight(0xFF0055, 3);
    magentaLight.position.set(-5, -5, 5);
    scene.add(magentaLight);

    const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    
    if(canvas.parentElement) {
        renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    } else {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    // Glowing organic shape (TorusKnot)
    const geometry = new THREE.TorusKnotGeometry(3, 0.8, 128, 32);
    
    const material = new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX - window.innerWidth / 2) * 0.002;
        targetY = (event.clientY - window.innerHeight / 2) * 0.002;
    });

    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        group.rotation.x += 0.05 * (targetY - group.rotation.x) + 0.002;
        group.rotation.y += 0.05 * (targetX - group.rotation.y) + 0.005;
        
        group.position.y = Math.sin(elapsedTime * 1.5) * 0.3;

        renderer.render(scene, camera);
    }
    animate();
});
