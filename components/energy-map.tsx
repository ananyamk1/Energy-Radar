"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Project } from "@/lib/types";

const WORLD = { minLat: 27.1, maxLat: 33.2, minLng: -100.7, maxLng: -93.4 };

function projectToWorld(project: Project) {
  const x = ((project.lng - WORLD.minLng) / (WORLD.maxLng - WORLD.minLng) - 0.5) * 19;
  const z = -((project.lat - WORLD.minLat) / (WORLD.maxLat - WORLD.minLat) - 0.5) * 12;
  return new THREE.Vector3(x, 0, z);
}

function statusColor(project: Project) {
  if (project.momentum === "Accelerating") return new THREE.Color("#d9b86c");
  if (project.momentum === "Stalled") return new THREE.Color("#b97870");
  return new THREE.Color("#8ca49c");
}

function capacityHeight(project: Project) {
  return Math.max(0.65, Math.min(4.2, 0.55 + project.capacityMw / 170));
}

function addGround(scene: THREE.Scene) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 17),
    new THREE.MeshStandardMaterial({ color: "#ecece7", roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.08;
  ground.receiveShadow = true;
  scene.add(ground);

  const riverShape = new THREE.Shape();
  riverShape.moveTo(-13, -2.5);
  riverShape.bezierCurveTo(-8, -0.2, -4, 2.4, 0, 1.25);
  riverShape.bezierCurveTo(4, 0.1, 7, -2.1, 13, -1.15);
  riverShape.lineTo(13, -2.35);
  riverShape.bezierCurveTo(7, -3.3, 4.2, -1.1, 0, 0.1);
  riverShape.bezierCurveTo(-4, 1.1, -7.6, -1.5, -13, -3.55);
  riverShape.closePath();
  const river = new THREE.Mesh(new THREE.ShapeGeometry(riverShape), new THREE.MeshStandardMaterial({ color: "#143f53", roughness: .32, metalness: .05 }));
  river.rotation.x = -Math.PI / 2;
  river.position.y = 0.01;
  scene.add(river);

  const roadMaterial = new THREE.LineBasicMaterial({ color: "#aeb1ab", transparent: true, opacity: .65 });
  const roads = [
    [[-12,-4.5],[-7,-2.1],[-2,.2],[3,2.0],[12,4.1]],
    [[-11,4.1],[-5,2.6],[0,.4],[5,-1.7],[12,-3.8]],
    [[-9,-5.5],[-3,-2.7],[3,-.6],[10,.6]],
    [[-2,-7],[-1,-3],[.2,0],[1.4,3],[2.4,7]],
    [[-8,6],[-3,4.2],[3,4.5],[9,6.1]],
  ];
  roads.forEach(points => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([x,z]) => new THREE.Vector3(x,.035,z)));
    scene.add(new THREE.Line(geometry, roadMaterial));
  });
}

function addBuildings(scene: THREE.Scene) {
  const base = new THREE.MeshStandardMaterial({ color: "#f3f3ee", roughness: .94 });
  const edge = new THREE.MeshStandardMaterial({ color: "#d7d9d3", roughness: .88 });
  const blocks: [number,number,number,number,number][] = [
    [-8,-3,.9,1,.7],[-6.9,-2.2,1.2,.8,1.1],[-5.5,-3.1,.7,1.1,.8],[-4.2,-2.2,1.4,.9,.65],[-2.6,-1.4,.8,.7,1.55],[-1.3,-2.1,.8,1.1,.75],
    [2.8,2.2,.9,.8,1.1],[4.1,1.7,1.2,.9,1.65],[5.5,2.5,.75,1,.8],[6.8,1.4,1.1,.8,1.3],[8.2,.5,.9,.9,.8],
    [-7.8,2.9,.8,.8,1.15],[-6.2,3.5,1.3,.75,.75],[-4.8,3,.8,.8,1.2],[3.3,-3.4,.8,.8,.8],[4.7,-3,1.3,.8,1.2],[6.1,-3.8,.75,1,.75],
  ];
  blocks.forEach(([x,z,w,d,h],i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), i % 5 === 0 ? edge : base);
    m.position.set(x,h/2,z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  });

  const towers: [number,number,number,number,number][] = [[-.7,1.1,.72,.72,2.8],[.25,1.0,.92,.76,3.7],[1.35,1.45,.62,.64,2.4],[.75,2.15,.48,.52,1.9]];
  towers.forEach(([x,z,w,d,h]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), edge);
    m.position.set(x,h/2,z);
    m.castShadow = true;
    scene.add(m);
  });
}

export function EnergyMap({ projects, onSelect, selectedProjectId = null }: { projects: Project[]; onSelect: (p: Project) => void; selectedProjectId?: string | null }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const projectsRef = useRef(projects);
  const onSelectRef = useRef(onSelect);
  const selectedPropRef = useRef<string | null>(selectedProjectId);
  const cameraResetRef = useRef<(() => void) | null>(null);
  const [hovered, setHovered] = useState<Project | null>(null);

  useEffect(() => { projectsRef.current = projects; }, [projects]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { selectedPropRef.current = selectedProjectId; }, [selectedProjectId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e8e8e3");

    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / mount.clientHeight, .1, 1000);
    camera.position.set(11.5, 14.5, 15.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight("#ffffff", "#a3a59f", 2.35));
    const sun = new THREE.DirectionalLight("#ffffff", 3.5);
    sun.position.set(8,18,9); sun.castShadow = true; scene.add(sun);
    const fill = new THREE.DirectionalLight("#d9e8ff", 1.1); fill.position.set(-12,9,-10); scene.add(fill);

    addGround(scene); addBuildings(scene);

    const projectGroup = new THREE.Group(); scene.add(projectGroup);
    const hitTargets: THREE.Object3D[] = [];
    const objects = new Map<string, { root: THREE.Group; ring: THREE.Mesh; node: THREE.Mesh; tower: THREE.Mesh; baseY: number }>();

    const rebuild = () => {
      projectGroup.clear(); hitTargets.length = 0; objects.clear();
      projectsRef.current.forEach((project) => {
        const p = projectToWorld(project);
        const color = statusColor(project);
        const h = capacityHeight(project);
        const root = new THREE.Group(); root.position.copy(p);

        const tower = new THREE.Mesh(
          new THREE.CylinderGeometry(.075,.09,h,12),
          new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .22, roughness: .4 })
        );
        tower.position.y = h/2 + .06; tower.castShadow = true; root.add(tower);

        const size = .18 + project.score / 500;
        const node = new THREE.Mesh(
          new THREE.CylinderGeometry(size*.72,size, .28, 6),
          new THREE.MeshStandardMaterial({ color: "#fbfbf7", emissive: color, emissiveIntensity: .65, roughness: .22, metalness: .12 })
        );
        node.position.y = h + .22; node.userData.projectId = project.id; node.castShadow = true; root.add(node); hitTargets.push(node);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(size*1.35,size*1.55,64),
          new THREE.MeshBasicMaterial({ color, transparent:true, opacity: project.momentum === "Accelerating" ? .52 : .2, side: THREE.DoubleSide })
        );
        ring.rotation.x = -Math.PI/2; ring.position.y = .045; root.add(ring);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(size*1.7,size*1.9,.10,48), new THREE.MeshStandardMaterial({ color:"#d7d7d1", roughness:.65 }));
        base.position.y = .05; base.receiveShadow = true; root.add(base);

        projectGroup.add(root); objects.set(project.id,{root,ring,node,tower,baseY:h+.22});
      });
    };
    rebuild();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor=.065; controls.minDistance=6; controls.maxDistance=30; controls.maxPolarAngle=Math.PI/2.04; controls.target.set(0,0,0);
    camera.lookAt(controls.target);

    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    let frame=0; let resize: ResizeObserver | null=null;
    let cameraTween: {from:THREE.Vector3;to:THREE.Vector3;targetFrom:THREE.Vector3;targetTo:THREE.Vector3;start:number;duration:number}|null=null;
    const homeCamera = camera.position.clone(); const homeTarget = controls.target.clone();

    const tweenTo = (project: Project | null) => {
      const from = camera.position.clone(); const targetFrom=controls.target.clone();
      let to: THREE.Vector3; let targetTo: THREE.Vector3;
      if (project) {
        const p=projectToWorld(project);
        to=new THREE.Vector3(p.x+4.4,6.2,p.z+4.8); targetTo=new THREE.Vector3(p.x,1.0,p.z);
      } else { to=homeCamera.clone(); targetTo=homeTarget.clone(); }
      cameraTween={from,to,targetFrom,targetTo,start:performance.now(),duration:1250}; controls.enabled=false;
    };
    cameraResetRef.current=()=>tweenTo(null);

    const getHit=(e:PointerEvent)=>{
      const rect=renderer.domElement.getBoundingClientRect(); pointer.x=((e.clientX-rect.left)/rect.width)*2-1; pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects(hitTargets,false); if(!hits.length)return null;
      const id=hits[0].object.userData.projectId as string; return projectsRef.current.find(p=>p.id===id)??null;
    };
    const move=(e:PointerEvent)=>{ const hit=getHit(e); setHovered(hit); renderer.domElement.style.cursor=hit?"pointer":"grab"; };
    const down=(e:PointerEvent)=>{ const hit=getHit(e); if(!hit)return; tweenTo(hit); onSelectRef.current(hit); };
    renderer.domElement.addEventListener("pointermove",move); renderer.domElement.addEventListener("pointerdown",down);

    const onResize=()=>{ if(!mount)return; camera.aspect=mount.clientWidth/mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth,mount.clientHeight); };
    resize=new ResizeObserver(onResize); resize.observe(mount);

    const clock=new THREE.Clock();
    const tick=()=>{
      frame=requestAnimationFrame(tick); const t=clock.getElapsedTime();
      objects.forEach(({root,ring,node,tower,baseY},id)=>{
        const p=projectsRef.current.find(x=>x.id===id); if(!p)return;
        const selected=selectedPropRef.current===id;
        const pulse=1+Math.sin(t*2.2+id.length)*.055;
        ring.scale.setScalar(selected?1.22+pulse*.05:pulse);
        root.scale.setScalar(selected?1.12:1);
        node.position.y=baseY+(selected?Math.sin(t*2.8)*.09:0);
        tower.material.emissiveIntensity=selected?.65:.22;
      });
      if(cameraTween){ const tt=Math.min(1,(performance.now()-cameraTween.start)/cameraTween.duration); const e=tt<.5?4*tt*tt*tt:1-Math.pow(-2*tt+2,3)/2; camera.position.lerpVectors(cameraTween.from,cameraTween.to,e); controls.target.lerpVectors(cameraTween.targetFrom,cameraTween.targetTo,e); camera.lookAt(controls.target); if(tt>=1){cameraTween=null;controls.enabled=true;} } else controls.update();
      renderer.render(scene,camera);
    };
    tick();

    return ()=>{ cancelAnimationFrame(frame); renderer.domElement.removeEventListener("pointermove",move); renderer.domElement.removeEventListener("pointerdown",down); resize?.disconnect(); controls.dispose(); scene.traverse(o=>{ if(o instanceof THREE.Mesh){o.geometry.dispose(); const m=o.material; if(Array.isArray(m))m.forEach(x=>x.dispose()); else m.dispose();}}); renderer.dispose(); if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement); };
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) selectedPropRef.current = selectedProjectId;
    } else {
      selectedPropRef.current = null;
      cameraResetRef.current?.();
    }
  }, [selectedProjectId, projects]);

  return (
    <div className="energy-scene-shell">
      <div ref={mountRef} className="energy-scene" aria-label="Three dimensional energy infrastructure map" />
      <div className="energy-scene-overlay">
        <div>
          <div className="energy-scene-kicker">LIVE RADAR · TEXAS</div>
          <div className="energy-scene-title">Infrastructure landscape</div>
        </div>
        <div className="energy-scene-hint">Drag · Scroll · Select a project</div>
      </div>
      <div className="energy-map-legend">
        <span><i className="legend-dot accelerating" /> Accelerating</span>
        <span><i className="legend-dot watch" /> Watch</span>
        <span><i className="legend-dot stalled" /> Stalled</span>
      </div>
      {hovered && !selectedProjectId && (
        <div className="energy-hover-card">
          <div className="text-[9px] uppercase tracking-[.18em] text-black/45">{hovered.category}</div>
          <div className="mt-1 text-sm font-semibold text-[#111715]">{hovered.name}</div>
          <div className="mt-1 text-xs text-black/50">{hovered.city}, {hovered.state} · {hovered.capacityMw} MW</div>
          <div className="mt-3 flex items-end justify-between border-t border-black/10 pt-2">
            <span className="text-[10px] uppercase tracking-[.14em] text-[#8c6e29]">{hovered.momentum}</span>
            <span className="text-xl font-semibold text-[#111715]">{hovered.score}</span>
          </div>
        </div>
      )}
    </div>
  );
}
