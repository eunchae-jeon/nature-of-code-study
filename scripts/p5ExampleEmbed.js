function createP5ExampleEmbed({ exampleId, width = 600, height = 400, base = "examples" }) {
  // 예제 id: "vectors/example1" 또는 "forces/example1" 등
  const container = document.createElement('div');
  container.style.marginBottom = "32px";

  // iframe
  const iframe = document.createElement('iframe');
  iframe.width = width;
  iframe.height = height;
  iframe.id = "p5-iframe";
  iframe.src = `${base}/${exampleId}`;
  iframe.style.display = "block";

  container.appendChild(iframe);

  return container;
}