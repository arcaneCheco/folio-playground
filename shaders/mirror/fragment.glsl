uniform sampler2D uMirrorImage;

varying vec4 vMirrorCoord;

void main() {
    gl_FragColor = texture2DProj(uMirrorImage, vMirrorCoord);
}