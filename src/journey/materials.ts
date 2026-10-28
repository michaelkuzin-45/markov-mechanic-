import * as THREE from 'three'

/** Restrained palette shared by every room: near-black architecture, red as the only accent. */
export const mat = {
  wall: new THREE.MeshStandardMaterial({ color: '#17181d', roughness: 0.78, metalness: 0.5, emissive: '#10121a' }),
  panel: new THREE.MeshStandardMaterial({ color: '#23252c', roughness: 0.28, metalness: 0.85, emissive: '#0e0f14' }),
  panelEdge: new THREE.MeshStandardMaterial({ color: '#101115', roughness: 0.4, metalness: 0.9 }),
  floorStd: new THREE.MeshStandardMaterial({ color: '#0d0d10', roughness: 0.28, metalness: 0.8 }),
  concrete: new THREE.MeshStandardMaterial({ color: '#1b1b1d', roughness: 0.88, metalness: 0.05 }),
  wood: new THREE.MeshStandardMaterial({ color: '#5a3a20', roughness: 0.92, metalness: 0 }),
  woodDark: new THREE.MeshStandardMaterial({ color: '#2c1c10', roughness: 0.95, metalness: 0 }),
  steel: new THREE.MeshStandardMaterial({ color: '#8a8d94', roughness: 0.28, metalness: 1 }),
  steelDark: new THREE.MeshStandardMaterial({ color: '#4b4e57', roughness: 0.34, metalness: 1 }),
  bronze: new THREE.MeshStandardMaterial({ color: '#a8683a', roughness: 0.32, metalness: 1 }),
  red: new THREE.MeshStandardMaterial({ color: '#c40a05', roughness: 0.32, metalness: 0.7 }),
  whiteWall: new THREE.MeshStandardMaterial({ color: '#efe9df', roughness: 0.85, metalness: 0, emissive: '#5e5a52' }),
  whitePanel: new THREE.MeshStandardMaterial({ color: '#f3eee6', roughness: 0.7, metalness: 0, emissive: '#6a665e' }),
  whiteEdge: new THREE.MeshStandardMaterial({ color: '#c9cad0', roughness: 0.4, metalness: 0.3, emissive: '#4a4b50' }),
  lineDark: new THREE.MeshBasicMaterial({ color: '#8b8d96', toneMapped: false, transparent: true, opacity: 0.7 }),
  daylight: new THREE.MeshBasicMaterial({ color: '#fff6e6', toneMapped: false }),
  lightWhite: new THREE.MeshBasicMaterial({ color: '#f4f6ff', toneMapped: false }),
  lightWarm: new THREE.MeshBasicMaterial({ color: '#ffc58a', toneMapped: false }),
  lightRed: new THREE.MeshBasicMaterial({ color: '#ff2a1f', toneMapped: false }),
  lightCool: new THREE.MeshBasicMaterial({ color: '#9fc4ff', toneMapped: false }),
  lineWhite: new THREE.MeshBasicMaterial({ color: '#cfd6e6', toneMapped: false, transparent: true, opacity: 0.8 }),
}
