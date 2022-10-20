import TextGeometry from "@src/utils/TextGeometry";
import {
  BufferAttribute,
  Color,
  IUniform,
  Matrix4,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import vertexShader from "@shaders/projectTitle/vertex.glsl";
import fragmentShader from "@shaders/projectTitle/fragment.glsl";
import { Font, FontData, TextAlign, _TextGeometry, _TitleMesh } from "@types";

export class TitleMesh
  extends Mesh<_TextGeometry, ShaderMaterial>
  implements _TitleMesh
{
  uniforms: Record<string, IUniform> = {
    uColor: { value: new Vector3() },
    uProgress: { value: 0 },
    uMap: { value: null },
    uStroke: { value: 0.1 },
    uPadding: { value: 0.1 },
    uTime: { value: 0 },
  };
  constructor({
    title,
    category,
    index,
    font,
    baseWidth,
    color,
  }: {
    title: string;
    category: string;
    index: number;
    font: Font;
    baseWidth: number;
    color: Color;
  }) {
    super(
      new TextGeometry(),
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    );
    this.uniforms.uColor.value = color;
    this.uniforms.uMap.value = font.map;
    if (index === 0) this.uniforms.uProgress.value = 1;
    this.material.uniforms = this.uniforms;
    this.setGeometrySpecs({
      text: title,
      fontData: font.data,
      baseWidth,
    });
    this.setTextBoundingUv(baseWidth);
    this.userData.index = index;
    this.userData.category = category;

    // const m = new THREE.Mesh(
    //   new THREE.PlaneGeometry(this.baseWidth, geometry.userData.height),
    //   new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 })
    // );
    // mesh.add(m);
  }

  setTextBoundingUv(baseWidth: number) {
    const count = this.geometry.attributes.uv.count;
    const bUvArray = new Float32Array(count * 2);
    const positions = this.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const posX = positions[i * 3];
      bUvArray[i * 2] = posX / baseWidth + 0.5;
      const posY = positions[i * 3 + 1];
      bUvArray[i * 2 + 1] = posY / this.geometry.userData.height + 0.5;
    }
    this.geometry.setAttribute("boundingUv", new BufferAttribute(bUvArray, 2));
  }

  setGeometrySpecs({
    text,
    fontData,
    baseWidth,
  }: {
    text: string;
    fontData: FontData;
    baseWidth: number;
  }) {
    this.geometry.setText({
      fontData,
      text: text,
      align: TextAlign.Center,
      lineWidth: 5,
      lineHeight: 1,
    });

    this.geometry.computeBoundingBox();

    const width =
      this.geometry.boundingBox!.max.x - this.geometry.boundingBox!.min.x;
    const height =
      this.geometry.boundingBox!.max.y - this.geometry.boundingBox!.min.y;
    const aspect = height / width;

    // center text mesh on yAxis
    const offset = height * 0.5 - this.geometry.boundingBox!.max.y;
    const offsetMatrix = new Matrix4().makeTranslation(0, offset, 0);
    this.geometry.applyMatrix4(offsetMatrix);
    // make width uniform
    const scale = baseWidth / width;
    const scaleMatrix = new Matrix4().makeScale(scale, scale, 1);
    this.geometry.applyMatrix4(scaleMatrix);

    this.geometry.userData.height = baseWidth * aspect;
  }
}
