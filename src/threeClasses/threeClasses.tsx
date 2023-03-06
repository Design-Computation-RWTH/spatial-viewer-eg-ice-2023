import * as THREE from "three";

export class SpatialRepresentation extends THREE.Mesh {
  private uri: string;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    uri: string
  ) {
    super(geometry, material);
    this.uri = uri;
  }
}

export class Model extends SpatialRepresentation {}

export class BIM extends Model {}

export class Plan extends SpatialRepresentation {}

export class Image extends SpatialRepresentation {}
