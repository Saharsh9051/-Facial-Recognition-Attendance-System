// Uses the modern fast-loading fork of face-api
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

let isLoaded = false;
let isLoading = false;

export async function loadFaceAPIModels() {
  if (isLoaded) return true;
  if (isLoading) {
    // Wait for it to finish loading
    while(isLoading) {
      await new Promise(r => setTimeout(r, 100));
    }
    return isLoaded;
  }

  isLoading = true;
  try {
    // We use the tiny face detector for web-based real-time scanning
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    isLoaded = true;
  } catch (error) {
    console.error("Error loading Face API models:", error);
    isLoaded = false;
  } finally {
    isLoading = false;
  }
  return isLoaded;
}

export function createFaceMatcher(registeredFaces: { id: string; name: string; descriptor: Float32Array }[]) {
  if (registeredFaces.length === 0) return null;

  const labeledDescriptors = registeredFaces.map(
    (face) => new faceapi.LabeledFaceDescriptors(face.id, [new Float32Array(face.descriptor)])
  );

  // 0.6 is standard distance threshold (lower is stricter)
  return new faceapi.FaceMatcher(labeledDescriptors, 0.55);
}
