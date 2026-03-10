import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

const avatarStyle = {
  shirtColor: "#ff1f1f",
  pantColor: "#df0f0f",
  capColor: "#08f427",
  capVisible: false,
  hairColor: "#111111",
  glassesColor: "#080909",
  glassesVisible: true,
  glassesOpacity: 0.28,
  // Keep external accessories off for shirt-only baseline.
  loadExternalGlasses: false,
  externalGlassesPath: "/models/glasses.glb",
  // Enable only after adding a GLB hair model under /public/models.
  loadExternalHair: false,
  externalHairPath: "/models/hair01.glb",
  useProceduralFallbackHair: false,
  hairVisible: true,
};

const characterModelSource = {
  // Switch to false if you want to use encrypted /models/character.enc again.
  usePublicMaleModel: false,
  maleModelPath: "/models/male.glb",
};

// Accessory placement specs (tune these instead of editing inline values).
const accessorySpecs = {
  glasses: {
    targetWidth: 2.05, // Overall size: bigger value = larger glasses, smaller value = smaller glasses
    xOffset: 0, // Left/right position: positive value moves right, negative value moves left
    yOffset: 1.2, // Up/down position: bigger value means higher, smaller value means lower
    zOffset: 0.1, // Forward/back position: positive value moves toward face/camera, negative value moves backward
    rotationX: 0.03, // Vertical tilt: positive tilts back/up, negative tilts forward/down
    rotationY: 0, // Horizontal turn: positive rotates right, negative rotates left
    rotationZ: 0, // Side roll: positive rotates clockwise, negative rotates counter-clockwise
  },
  hair: {
    targetWidth: 2.2, // Overall hair size: bigger value = larger hair, smaller value = smaller hair
    xOffset: 0.02, // Left/right position: positive value moves right, negative value moves left
    yOffset: 1.26, // Up/down position: bigger value means higher, smaller value means lower
    zOffset: -0.36, // Forward/back position: positive value moves toward face/camera, negative value moves backward
    rotationX: 0.12, // Vertical tilt: positive tilts back/up, negative tilts forward/down
    rotationY: 0, // Horizontal turn: positive rotates right, negative rotates left
    rotationZ: 0, // Side roll: positive rotates clockwise, negative rotates counter-clockwise
  },
};

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
) => {
  // Based on runtime mesh dump for this avatar rig.
  const shirtMeshTokens = ["ground", "plane010", "cube006"];
  const shirtMaterialTokens = [
    "ground material",
    "material.018",
    "material.020",
    "material.021",
    "stand",
    "material.008",
  ];
  const shirtExcludeTokens = [
    "face",
    "ear",
    "neck",
    "eye",
    "eyebrow",
    "hand",
    "teeth",
    "hair",
    "cap",
    "shoe",
    "sole",
    "screenlight",
    "keyboard",
    "keys",
  ];

  const matchesAnyToken = (value: string, tokens: string[]) =>
    tokens.some((token) => value.includes(token));

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);
  const accessoryLoader = new GLTFLoader();

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        let modelUrl = "";
        if (characterModelSource.usePublicMaleModel) {
          modelUrl = characterModelSource.maleModelPath;
        } else {
          const encryptedBlob = await decryptFile(
            "/models/character.enc?v=2",
            "MyCharacter12",
          );
          modelUrl = URL.createObjectURL(new Blob([encryptedBlob]));
        }

        let character: THREE.Object3D;
        loader.load(
          modelUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            let shirtMatchCount = 0;
            let hairMatchCount = 0;
            let glassesMatchCount = 0;
            const shirtMatchedMeshes: string[] = [];
            const meshMaterialPairs: Array<{ mesh: string; material: string }> =
              [];

            const applyColorMaterial = (
              material: THREE.Material,
              color: string,
            ) => {
              const newMat = material.clone() as THREE.MeshStandardMaterial;
              newMat.color = new THREE.Color(color);
              newMat.map = null;
              newMat.lightMap = null;
              newMat.aoMap = null;
              newMat.metalnessMap = null;
              newMat.roughnessMap = null;
              newMat.normalMap = null;
              newMat.vertexColors = false;
              newMat.needsUpdate = true;
              return newMat;
            };

            const applyMaterial = (
              material: THREE.Material | THREE.Material[],
              cb: (mat: THREE.Material) => THREE.Material,
            ) => {
              if (Array.isArray(material)) {
                return material.map((mat) => cb(mat));
              }
              return cb(material);
            };

            const attachAccessoryToHead = (
              accessoryRoot: THREE.Object3D,
              options: {
                // Uniform scale target (in model-space width units)
                targetWidth: number;
                // Left/right offset: +right, -left
                xOffset?: number;
                // Up/down offset: +up, -down
                yOffset: number;
                // Forward/back offset: +towards camera, -towards back of head
                zOffset: number;
                // Rotation in radians around each axis
                rotationX?: number;
                rotationY?: number;
                rotationZ?: number;
                // Optional tint/opacity override for accessory materials
                tint?: string;
                opacity?: number;
              },
            ) => {
              const headBone =
                character.getObjectByName("spine006") || character;
              const box = new THREE.Box3().setFromObject(accessoryRoot);
              const size = new THREE.Vector3();
              const center = new THREE.Vector3();
              box.getSize(size);
              box.getCenter(center);

              const width = Math.max(size.x, 0.0001);
              const scale = options.targetWidth / width;
              accessoryRoot.scale.setScalar(scale);

              // Center model first, then move in front of face.
              accessoryRoot.position.set(
                -center.x * scale,
                -center.y * scale,
                -center.z * scale,
              );
              accessoryRoot.position.x += options.xOffset ?? 0;
              accessoryRoot.position.y += options.yOffset;
              accessoryRoot.position.z += options.zOffset;
              accessoryRoot.rotation.set(
                options.rotationX ?? 0,
                options.rotationY ?? 0,
                options.rotationZ ?? 0,
              );

              if (options.tint) {
                accessoryRoot.traverse((node: any) => {
                  if (node.isMesh && node.material) {
                    const paint = (mat: THREE.Material) => {
                      const newMat = mat.clone() as THREE.MeshStandardMaterial;
                      newMat.color = new THREE.Color(options.tint!);
                      if (typeof options.opacity === "number") {
                        newMat.transparent = true;
                        newMat.opacity = options.opacity;
                      }
                      newMat.needsUpdate = true;
                      return newMat;
                    };

                    node.material = Array.isArray(node.material)
                      ? node.material.map((m: THREE.Material) => paint(m))
                      : paint(node.material as THREE.Material);
                  }
                });
              }

              headBone.add(accessoryRoot);
            };

            const addProceduralFallbackHair = () => {
              const headBone =
                character.getObjectByName("spine006") || character;
              const hairGroup = new THREE.Group();
              hairGroup.name = "procedural_hair";

              const hairMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(avatarStyle.hairColor),
                roughness: 0.9,
                metalness: 0.02,
              });

              // Base scalp cap.
              const scalpGeo = new THREE.SphereGeometry(
                1,
                36,
                24,
                0,
                Math.PI * 2,
                0,
                Math.PI * 0.72,
              );
              const scalp = new THREE.Mesh(scalpGeo, hairMat);
              scalp.scale.set(1.04, 0.63, 1.02);
              scalp.position.set(0, 1.14, -0.03);

              // Volume on top so the hairstyle does not look flat.
              const crownGeo = new THREE.SphereGeometry(0.62, 24, 16);
              const crown = new THREE.Mesh(crownGeo, hairMat);
              crown.scale.set(1.1, 0.65, 0.95);
              crown.position.set(0, 1.48, -0.08);

              // Front layered fringe.
              const fringeMain = new THREE.Mesh(
                new THREE.BoxGeometry(1.36, 0.2, 0.24),
                hairMat,
              );
              fringeMain.position.set(0, 0.89, 0.49);
              fringeMain.rotation.x = -0.13;

              const fringeMid = new THREE.Mesh(
                new THREE.BoxGeometry(0.92, 0.16, 0.2),
                hairMat,
              );
              fringeMid.position.set(0, 0.82, 0.56);
              fringeMid.rotation.x = -0.2;

              // Side fades.
              const sideLeft = new THREE.Mesh(
                new THREE.BoxGeometry(0.2, 0.7, 0.72),
                hairMat,
              );
              sideLeft.position.set(-0.63, 0.93, -0.02);
              sideLeft.rotation.z = -0.07;

              const sideRight = sideLeft.clone();
              sideRight.position.x = 0.63;
              sideRight.rotation.z = 0.07;

              // Back coverage to avoid a chopped look from side angles.
              const back = new THREE.Mesh(
                new THREE.BoxGeometry(1.08, 0.62, 0.24),
                hairMat,
              );
              back.position.set(0, 0.98, -0.56);
              back.rotation.x = 0.08;

              [
                scalp,
                crown,
                fringeMain,
                fringeMid,
                sideLeft,
                sideRight,
                back,
              ].forEach((part) => {
                part.castShadow = true;
                part.receiveShadow = true;
                hairGroup.add(part);
              });

              headBone.add(hairGroup);
              console.info("Procedural fallback hair attached.");
            };

            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                const meshName = mesh.name.toLowerCase();

                const materialName = Array.isArray(mesh.material)
                  ? mesh.material
                      .map((mat) => mat.name?.toLowerCase() ?? "")
                      .join(" ")
                  : (mesh.material?.name?.toLowerCase() ?? "");

                meshMaterialPairs.push({
                  mesh: mesh.name,
                  material: materialName,
                });

                const excludedShirtMesh =
                  matchesAnyToken(meshName, shirtExcludeTokens) ||
                  matchesAnyToken(materialName, shirtExcludeTokens);

                const isShirtMesh =
                  !excludedShirtMesh &&
                  (matchesAnyToken(meshName, shirtMeshTokens) ||
                    matchesAnyToken(materialName, shirtMaterialTokens) ||
                    meshName.includes("shirt") ||
                    meshName.includes("tshirt") ||
                    meshName.includes("top") ||
                    meshName === "body.shirt" ||
                    materialName.includes("shirt") ||
                    materialName.includes("tshirt") ||
                    materialName.includes("top"));

                // Change clothing colors to match site theme
                if (mesh.material) {
                  if (isShirtMesh) {
                    shirtMatchCount++;
                    shirtMatchedMeshes.push(mesh.name);
                    const applyShirtStyle = (material: THREE.Material) => {
                      const newMat = applyColorMaterial(
                        material,
                        avatarStyle.shirtColor,
                      ) as THREE.MeshStandardMaterial;
                      // Ignore dark albedo textures so the red color is visible.
                      newMat.emissive = new THREE.Color("#2a0000");
                      newMat.emissiveIntensity = 0.35;
                      newMat.roughness = 0.75;
                      newMat.metalness = 0.05;
                      return newMat;
                    };

                    mesh.material = applyMaterial(
                      mesh.material,
                      applyShirtStyle,
                    );
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            if (shirtMatchCount === 0) {
              console.warn(
                "No shirt mesh matched. Available mesh/material pairs:",
                meshMaterialPairs,
              );
            } else {
              console.info(
                "Shirt style applied to meshes:",
                shirtMatchedMeshes,
              );
            }

            // Auto-fit any character source and nudge left to avoid content overlap.
            const fitCharacterToView = (
              model: THREE.Object3D,
              options: {
                targetHeight: number;
                xOffset: number;
                yOffset: number;
              },
            ) => {
              const preBox = new THREE.Box3().setFromObject(model);
              const preSize = new THREE.Vector3();
              preBox.getSize(preSize);
              if (preSize.y <= 0.0001) return;

              const uniformScale = options.targetHeight / preSize.y;
              model.scale.setScalar(uniformScale);

              const box = new THREE.Box3().setFromObject(model);
              const center = new THREE.Vector3();
              box.getCenter(center);

              model.position.x += -center.x + options.xOffset;
              model.position.y += -box.min.y + options.yOffset;
              model.position.z += -center.z;
            };

            if (characterModelSource.usePublicMaleModel) {
              fitCharacterToView(character, {
                targetHeight: 18,
                xOffset: -5.4,
                yOffset: 0,
              });
            }

            if (glassesMatchCount === 0 && avatarStyle.loadExternalGlasses) {
              accessoryLoader.load(
                avatarStyle.externalGlassesPath,
                (glassGltf) => {
                  const glassesModel = glassGltf.scene;
                  attachAccessoryToHead(glassesModel, {
                    ...accessorySpecs.glasses,
                    tint: avatarStyle.glassesColor,
                    opacity: avatarStyle.glassesOpacity,
                  });
                  console.info(
                    "External glasses attached from:",
                    avatarStyle.externalGlassesPath,
                  );
                },
                undefined,
                (error) => {
                  console.warn(
                    "External glasses model could not be loaded:",
                    error,
                  );
                },
              );
            }

            if (avatarStyle.loadExternalHair) {
              accessoryLoader.load(
                avatarStyle.externalHairPath,
                (hairGltf) => {
                  const hairModel = hairGltf.scene;
                  attachAccessoryToHead(hairModel, {
                    ...accessorySpecs.hair,
                    tint: avatarStyle.hairColor,
                  });
                  console.info(
                    "External hair attached from:",
                    avatarStyle.externalHairPath,
                  );
                },
                undefined,
                (error) => {
                  console.warn(
                    "External hair model could not be loaded:",
                    error,
                  );
                  if (avatarStyle.useProceduralFallbackHair) {
                    addProceduralFallbackHair();
                  }
                },
              );
            } else if (
              hairMatchCount === 0 &&
              avatarStyle.hairVisible &&
              avatarStyle.useProceduralFallbackHair
            ) {
              addProceduralFallbackHair();
            }

            resolve(gltf);
            // For the default encrypted avatar, always initialize scroll timelines.
            if (!characterModelSource.usePublicMaleModel) {
              setCharTimeline(character, camera);
              setAllTimeline();
            }

            const footR = character.getObjectByName("footR");
            const footL = character.getObjectByName("footL");
            if (footR) footR.position.y = 3.36;
            if (footL) footL.position.y = 3.36;

            // Monitor scale is handled by GsapScroll.ts animations

            dracoLoader.dispose();

            if (!characterModelSource.usePublicMaleModel) {
              URL.revokeObjectURL(modelUrl);
            }
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          },
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
