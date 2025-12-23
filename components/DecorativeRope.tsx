
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PhotoItem: React.FC<{ position: THREE.Vector3, url: string, index: number }> = ({ position, url, index }) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const groupRef = useRef<THREE.Group>(null);
    const timeRef = useRef(Math.random() * 10);

    useEffect(() => {
        new THREE.TextureLoader().load(url, setTexture);
    }, [url]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        timeRef.current += delta;
        // 随风摆动逻辑
        groupRef.current.rotation.z = Math.sin(timeRef.current) * 0.1;
        groupRef.current.rotation.y = Math.cos(timeRef.current * 0.8) * 0.05;
    });

    if (!texture) return null;

    return (
        <group ref={groupRef} position={position}>
            {/* 拍立得相框 */}
            <mesh>
                <boxGeometry args={[1.2, 1.5, 0.05]} />
                <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
            </mesh>
            {/* 照片 */}
            <mesh position={[0, 0.15, 0.03]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial map={texture} />
            </mesh>
            {/* 模拟木夹子 */}
            <mesh position={[0, 0.75, 0.04]}>
                <boxGeometry args={[0.1, 0.3, 0.08]} />
                <meshStandardMaterial color="#8B4513" roughness={0.8} />
            </mesh>
        </group>
    );
};

const ChristmasHat: React.FC<{ position: THREE.Vector3 }> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const timeRef = useRef(Math.random() * 10);
    
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        timeRef.current += delta;
        groupRef.current.rotation.z = Math.sin(timeRef.current * 1.2) * 0.15;
    });

    return (
        <group ref={groupRef} position={position} scale={0.6}>
            <mesh position={[0, 0, 0]}>
                <coneGeometry args={[0.5, 1.2, 16]} />
                <meshStandardMaterial color="#B22222" roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
                <torusGeometry args={[0.5, 0.12, 16, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
            <mesh position={[0, 0.65, 0]}>
                <sphereGeometry args={[0.15]} />
                <meshStandardMaterial color="#ffffff" />
            </mesh>
            {/* 模拟木夹子 */}
            <mesh position={[0, 0.6, 0.1]}>
                <boxGeometry args={[0.1, 0.2, 0.08]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
        </group>
    );
};

const ChristmasSock: React.FC<{ position: THREE.Vector3 }> = ({ position }) => {
    const groupRef = useRef<THREE.Group>(null);
    const timeRef = useRef(Math.random() * 10);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        timeRef.current += delta;
        groupRef.current.rotation.z = Math.cos(timeRef.current) * 0.12;
    });

    return (
        <group ref={groupRef} position={position} scale={0.5}>
            {/* 袜筒 */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.6, 1.2, 0.3]} />
                <meshStandardMaterial color="#228B22" roughness={0.9} />
            </mesh>
            {/* 袜底 */}
            <mesh position={[0.4, -0.5, 0]}>
                <boxGeometry args={[1.0, 0.4, 0.3]} />
                <meshStandardMaterial color="#B22222" roughness={0.9} />
            </mesh>
            {/* 袜口白边 */}
            <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.7, 0.2, 0.35]} />
                <meshStandardMaterial color="#ffffff" roughness={1} />
            </mesh>
            {/* 模拟木夹子 */}
            <mesh position={[0, 0.6, 0.1]}>
                <boxGeometry args={[0.1, 0.2, 0.08]} />
                <meshStandardMaterial color="#8B4513" />
            </mesh>
        </group>
    );
};

const DecorativeRope: React.FC<{ userImages: string[] }> = ({ userImages }) => {
    // 定义挂绳路径：从左上到右下
    // 采用 CatmullRomCurve3 实现自然下垂感
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(-25, 18, -10),
            new THREE.Vector3(-10, 5, -8),
            new THREE.Vector3(5, -5, -8),
            new THREE.Vector3(25, -18, -10),
        ]);
    }, []);

    const linePoints = useMemo(() => curve.getPoints(100), [curve]);
    const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(linePoints), [linePoints]);
    
    // Create the Three.js Line object explicitly to avoid name collision with SVG line in JSX
    const lineObject = useMemo(() => new THREE.Line(lineGeometry), [lineGeometry]);

    const items = useMemo(() => {
        const result = [];
        const count = 12;
        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) / count;
            const pos = curve.getPoint(t);
            // 稍微偏离绳子，向下挂
            const hangPos = pos.clone().add(new THREE.Vector3(0, -0.8, 0.1));
            
            const rand = Math.random();
            if (rand > 0.6 && userImages.length > 0) {
                result.push(<PhotoItem key={i} position={hangPos} url={userImages[i % userImages.length]} index={i} />);
            } else if (rand > 0.3) {
                result.push(<ChristmasHat key={i} position={hangPos} />);
            } else {
                result.push(<ChristmasSock key={i} position={hangPos} />);
            }
        }
        return result;
    }, [curve, userImages]);

    return (
        <group>
            {/* 挂绳本身 - FIX: Use primitive instead of <line> to resolve TS error with SVG types */}
            <primitive object={lineObject}>
                <lineBasicMaterial attach="material" color="#3d2b1f" linewidth={2} transparent opacity={0.6} />
            </primitive>
            {/* 挂在绳子上的物件 */}
            {items}
        </group>
    );
};

export default DecorativeRope;
