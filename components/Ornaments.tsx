
import React, { useMemo, useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp, randomVector3 } from '../utils/math';

interface OrnamentData {
  chaosPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  rotation: THREE.Euler;
  color: THREE.Color;
  targetScale: THREE.Vector3;
  chaosScale: THREE.Vector3;
  chaosTilt: number;
  signature?: string;
}

interface OrnamentsProps {
  mixFactor: number;
  type: 'BALL' | 'BOX' | 'STAR' | 'CANDY' | 'CRYSTAL' | 'PHOTO';
  count: number;
  colors?: string[];
  scale?: number;
  userImages?: string[];
  signatureText?: string;
  allSignatures?: string[];
}

// --- 增强版艺术签名贴图生成器 ---
const generateSignatureTexture = (text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320; 
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!text) return new THREE.CanvasTexture(canvas);

    // 1. 动态缩放算法
    let fontSize = 140; 
    if (text.length > 4 && text.length <= 6) fontSize = 110;
    else if (text.length > 6 && text.length <= 12) fontSize = 90;
    else if (text.length > 12) fontSize = 70;

    // 2. 自动换行逻辑
    let lines: string[] = [];
    if (text.length > 7) {
        const mid = Math.ceil(text.length / 2);
        lines = [text.substring(0, mid), text.substring(mid)];
    } else {
        lines = [text];
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 使用深蓝色水墨感
    ctx.fillStyle = '#1a2a4a'; 
    ctx.font = `italic bold ${fontSize}px 'Zhi Mang Xing', 'Ma Shan Zheng', 'Monsieur La Doulaise', cursive`;
    
    // 阴影增加立体感
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const lineHeight = fontSize * 1.15;
    const startY = (canvas.height / 2) - ((lines.length - 1) * lineHeight / 2);

    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
    });
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.needsUpdate = true;
    return tex;
}

const PhotoFrameMesh: React.FC<{
    item: OrnamentData;
    mixFactor: number;
    texture: THREE.Texture;
    signature?: string;
}> = ({ item, mixFactor, texture, signature }) => {
    const groupRef = useRef<THREE.Group>(null);
    const innerRef = useRef<THREE.Group>(null); 
    const currentMixRef = useRef(1);
    
    const vecPos = useMemo(() => new THREE.Vector3(), []);
    const vecScale = useMemo(() => new THREE.Vector3(), []);
    const vecWorld = useMemo(() => new THREE.Vector3(), []);

    // 字体加载状态锁
    const [fontsReady, setFontsReady] = useState(false);
    useEffect(() => {
        document.fonts.ready.then(() => setFontsReady(true));
    }, []);

    const signatureTex = useMemo(() => {
        return (signature && fontsReady) ? generateSignatureTexture(signature) : null;
    }, [signature, fontsReady]); 

    const { frameArgs, photoArgs, photoPos, textPos, textArgs } = useMemo(() => {
        const img = texture.image as any;
        const aspect = (img?.width / img?.height) || 1;
        const maxSize = 0.85;
        let pw, ph;
        if (aspect >= 1) { pw = maxSize; ph = maxSize / aspect; }
        else { ph = maxSize; pw = maxSize * aspect; }

        const mSide = 0.08, mTop = 0.08, mBottom = 0.32; 
        const fw = pw + mSide * 2;
        const fh = ph + mTop + mBottom;
        const py = (fh / 2) - mTop - (ph / 2);
        const ty = -(fh / 2) + (mBottom / 2) + 0.01;

        return {
            frameArgs: [fw, fh, 0.05] as [number, number, number],
            photoArgs: [pw, ph] as [number, number],
            photoPos: [0, py, 0.03] as [number, number, number],
            textPos: [0, ty, 0.031] as [number, number, number],
            textArgs: [fw * 0.9, mBottom * 0.8] as [number, number]
        };
    }, [texture]);

    useFrame((state, delta) => {
        if (!groupRef.current || !innerRef.current) return;
        currentMixRef.current = lerp(currentMixRef.current, mixFactor, 2.0 * delta);
        const t = currentMixRef.current;
        
        vecPos.lerpVectors(item.chaosPos, item.targetPos, t);
        groupRef.current.position.copy(vecPos);
        vecScale.lerpVectors(item.chaosScale, item.targetScale, t);

        const isSmall = state.viewport.width < 22;
        const responsiveBase = isSmall ? 0.75 : 1.0;
        vecScale.multiplyScalar(responsiveBase);
        
        if (t < 0.98) {
             groupRef.current.getWorldPosition(vecWorld);
             const dist = vecWorld.distanceTo(state.camera.position);
             const zoom = THREE.MathUtils.mapLinear(dist, 10, 60, isSmall ? 1.2 : 1.6, 0.6);
             vecScale.multiplyScalar(lerp(1.0, zoom, (1.0 - t)));
        }
        groupRef.current.scale.copy(vecScale);

        if (t > 0.8) {
             groupRef.current.lookAt(0, groupRef.current.position.y, 0); 
             groupRef.current.rotateY(Math.PI); 
             innerRef.current.rotation.z = lerp(innerRef.current.rotation.z, 0, 2 * delta);
        } else {
             groupRef.current.lookAt(state.camera.position);
             innerRef.current.rotation.z = lerp(innerRef.current.rotation.z, item.chaosTilt, 2 * delta);
        }
    });

    return (
        <group ref={groupRef}>
            <group ref={innerRef}>
                <mesh>
                    <boxGeometry args={frameArgs} />
                    <meshStandardMaterial color="#fefefe" roughness={0.7} metalness={0.0} />
                </mesh>
                <mesh position={photoPos}>
                    <planeGeometry args={photoArgs} />
                    <meshStandardMaterial map={texture} roughness={0.5} />
                </mesh>
                {signatureTex && (
                    <mesh position={textPos}>
                        <planeGeometry args={textArgs} />
                        <meshBasicMaterial map={signatureTex} transparent={true} opacity={0.9} toneMapped={true} />
                    </mesh>
                )}
            </group>
        </group>
    );
};

const GiftBoxMesh: React.FC<{ item: OrnamentData; mixFactor: number }> = ({ item, mixFactor }) => {
    const groupRef = useRef<THREE.Group>(null);
    const currentMixRef = useRef(1);
    const vecPos = useMemo(() => new THREE.Vector3(), []);
    const vecScale = useMemo(() => new THREE.Vector3(), []);
    const ribbonMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#FFD700", roughness: 0.2, metalness: 0.8, emissive: "#FFD700", emissiveIntensity: 0.1 }), []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        currentMixRef.current = lerp(currentMixRef.current, mixFactor, 2.0 * delta);
        const t = currentMixRef.current;
        vecPos.lerpVectors(item.chaosPos, item.targetPos, t);
        groupRef.current.position.copy(vecPos);
        vecScale.lerpVectors(item.chaosScale, item.targetScale, t);
        groupRef.current.scale.copy(vecScale);
        groupRef.current.rotation.copy(item.rotation);
        if (t < 0.5) { groupRef.current.rotation.x += delta * 0.5; groupRef.current.rotation.y += delta * 0.5; }
    });

    return (
        <group ref={groupRef}>
            <mesh castShadow><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={item.color} roughness={0.4} /></mesh>
            <mesh scale={[0.2, 1.01, 1.01]} material={ribbonMat}><boxGeometry args={[1, 1, 1]} /></mesh>
            <mesh scale={[1.01, 1.01, 0.2]} material={ribbonMat}><boxGeometry args={[1, 1, 1]} /></mesh>
            <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI / 4, 0]} material={ribbonMat} scale={[0.35, 0.35, 0.35]}><torusKnotGeometry args={[0.6, 0.15, 64, 8, 2, 3]} /></mesh>
        </group>
    );
};

const PhotoOrnament: React.FC<{ item: OrnamentData; mixFactor: number; url: string }> = ({ item, mixFactor, url }) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const FALLBACK_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjW5znJAxObrFwoHzdYpALR8BAkbclERGBGA&s";

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load(url, (tex) => setTexture(tex), undefined, () => {
                loader.load(FALLBACK_URL, (fallbackTex) => setTexture(fallbackTex));
        });
    }, [url]);

    if (!texture) return null;
    return <PhotoFrameMesh item={item} mixFactor={mixFactor} texture={texture} signature={item.signature} />;
};

const Ornaments: React.FC<OrnamentsProps> = ({ mixFactor, type, count, colors, scale = 1, userImages = [], allSignatures = [] }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const currentMixRef = useRef(1);

  const geometry = useMemo(() => {
      switch(type) {
          case 'CRYSTAL': return new THREE.IcosahedronGeometry(1, 0); 
          case 'STAR': {
            const shape = new THREE.Shape();
            const points = 5;
            for (let i = 0; i < points * 2; i++) {
                const r = i % 2 === 0 ? 1 : 0.5;
                const a = (i / points) * Math.PI;
                shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            }
            return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 });
          }
          case 'BALL': return new THREE.SphereGeometry(1, 16, 16);
          case 'CANDY': return new THREE.BoxGeometry(0.1, 1, 0.1); 
          default: return new THREE.BoxGeometry(1, 1, 1);
      }
  }, [type]);

  const data = useMemo(() => {
    const items: OrnamentData[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const treeHeight = 18, treeRadiusBase = 7.5, apexY = 9;
    const typeOffset = { BALL:0, BOX:1, STAR:2, CANDY:3, CRYSTAL:4, PHOTO:5 }[type] || 0;
    const angleOffset = typeOffset * (Math.PI * 2 / 6);

    for (let i = 0; i < count; i++) {
      const progress = Math.sqrt((i + 1) / count) * 0.92;
      const r = progress * treeRadiusBase;
      const y = apexY - progress * treeHeight;
      const theta = i * goldenAngle + angleOffset;

      const tPos = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
      tPos.multiplyScalar((type === 'STAR' || type === 'PHOTO') ? 1.15 : 1.08);

      let cPos: THREE.Vector3, chaosTilt = 0;
      if (type === 'PHOTO') {
          const cR = 18, cH = 14;
          cPos = new THREE.Vector3(cR * Math.cos(i * goldenAngle), ((i/count)-0.5)*cH, cR * Math.sin(i * goldenAngle));
          chaosTilt = ((i % 5) - 2) * 0.15; 
      } else { cPos = randomVector3(25); }

      const targetScale = new THREE.Vector3(1, 1, 1).multiplyScalar(scale * (Math.random() * 0.4 + 0.8));
      if (type === 'BOX') targetScale.set(targetScale.x * 1.1, targetScale.y * 0.8, targetScale.z * 1.1);
      
      let chaosScale = targetScale.clone();
      if (type === 'PHOTO') chaosScale.multiplyScalar(3.5);

      const sig = allSignatures.length > 0 ? allSignatures[i % allSignatures.length] : undefined;

      items.push({
        chaosPos: cPos, targetPos: tPos,
        rotation: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0),
        color: new THREE.Color(colors ? colors[Math.floor(Math.random()*colors.length)] : '#fff'),
        targetScale, chaosScale, chaosTilt, signature: sig
      });
    }
    return items;
  }, [count, type, colors, scale, allSignatures]);

  useLayoutEffect(() => {
     if (!meshRef.current || type === 'PHOTO' || type === 'BOX') return;
     data.forEach((item, i) => {
         meshRef.current!.setColorAt(i, item.color);
         dummy.position.copy(item.targetPos);
         dummy.scale.copy(item.targetScale);
         dummy.rotation.copy(item.rotation);
         dummy.updateMatrix();
         meshRef.current!.setMatrixAt(i, dummy.matrix);
     });
     if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
     meshRef.current.instanceMatrix.needsUpdate = true;
  }, [data, type, dummy]);

  useFrame((state, delta) => {
    if (!meshRef.current || type === 'PHOTO' || type === 'BOX') return;
    currentMixRef.current = lerp(currentMixRef.current, mixFactor, 2.0 * delta);
    const t = currentMixRef.current;
    const curPos = new THREE.Vector3(), curScale = new THREE.Vector3();
    data.forEach((item, i) => {
      curPos.lerpVectors(item.chaosPos, item.targetPos, t);
      dummy.position.copy(curPos);
      if ((type === 'STAR' || type === 'CRYSTAL') && t > 0.8) {
         dummy.lookAt(0, curPos.y, 0); 
         if (type === 'STAR') dummy.rotateZ(Math.PI / 2);
      } else {
         dummy.rotation.copy(item.rotation);
         if (t < 0.5) { dummy.rotation.x += delta * 0.5; dummy.rotation.y += delta * 0.5; }
      }
      curScale.lerpVectors(item.chaosScale, item.targetScale, t);
      dummy.scale.copy(curScale); 
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (type === 'PHOTO') {
      return (
          <group>
              {data.map((item, i) => {
                  const imgSrc = userImages.length > 0 ? userImages[i % userImages.length] : "";
                  return <PhotoOrnament key={i} item={item} mixFactor={mixFactor} url={imgSrc} />;
              })}
          </group>
      )
  }

  if (type === 'BOX') return <group>{data.map((item, i) => <GiftBoxMesh key={i} item={item} mixFactor={mixFactor} />)}</group>;

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow>
      <meshStandardMaterial roughness={0.2} metalness={0.6} emissive={type === 'CRYSTAL' ? "#112244" : "#000000"} emissiveIntensity={0.2} />
    </instancedMesh>
  );
};

export default Ornaments;
