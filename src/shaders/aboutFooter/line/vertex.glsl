void main() {
    gl_Position = modelMatrix * vec4(position, 1.);
}