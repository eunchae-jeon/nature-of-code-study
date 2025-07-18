function createP5ExampleEmbed({ exampleId, width = 600, height = 400, base = "../examples" }) {
  // 예제 id: "vectors/example1" 또는 "forces/example1" 등
  const container = document.createElement('div');
  container.style.marginBottom = "32px";

  // 버튼 영역
  const btnBox = document.createElement('div');
  btnBox.style.marginBottom = "12px";
  btnBox.classList.add('button-box');
  const resetBtn = document.createElement('button');
  resetBtn.textContent = "Reset";
  resetBtn.id = "reset-iframe";
  const pauseBtn = document.createElement('button');
  pauseBtn.textContent = "Pause";
  pauseBtn.id = "pause-iframe";
  btnBox.appendChild(resetBtn);
  btnBox.appendChild(pauseBtn);

  // iframe
  const iframe = document.createElement('iframe');
  iframe.width = width;
  iframe.height = height;
  iframe.id = "p5-iframe";
  iframe.src = `${base}/${exampleId}`;
  iframe.style.display = "block";

  container.appendChild(iframe);
  container.appendChild(btnBox);

  // 버튼 동작
  let paused = false;
  resetBtn.onclick = () => {
    iframe.src = iframe.src;
    paused = false;
    pauseBtn.textContent = "Pause";
  };
  pauseBtn.onclick = () => {
    try {
      const win = iframe.contentWindow;
      if (!paused) {
        win.noLoop && win.noLoop();
        pauseBtn.textContent = "Resume";
      } else {
        win.loop && win.loop();
        pauseBtn.textContent = "Pause";
      }
      paused = !paused;
    } catch (e) {
      alert("Pause/resume 기능은 같은 도메인에서만 동작합니다.");
    }
  };

  return container;
}