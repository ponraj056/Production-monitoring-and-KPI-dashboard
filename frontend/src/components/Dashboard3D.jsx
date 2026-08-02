import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Dashboard3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const width = 200;
    const height = 200;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Geometry: a gear-like torus knot, fits an "industrial machine" theme
    const geometry = new THREE.TorusKnotGeometry(1, 0.35, 120, 16);
  const material = new THREE.MeshStandardMaterial({
  color: 0xffb020,
  metalness: 0.6,
  roughness: 0.3,
  emissive: 0x4a2e0a,
});
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7c3aed, 2, 100);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00d9ff, 1.5, 100);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Animation loop
    let animationId;
    const animate = () => {
      knot.rotation.x += 0.004;
      knot.rotation.y += 0.006;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount (prevents memory leaks / duplicate canvases)
    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '200px',
        height: '200px',
        position: 'absolute',
        top: '10px',
        right: '20px',
        pointerEvents: 'none',
      }}
    />
  );
}

export default Dashboard3D;