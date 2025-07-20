setTimeout(() => {
  // 버튼 박스 생성 및 추가
  const btnBox = document.createElement('div');
  btnBox.style.margin = "16px 0";

  const resetBtn = document.createElement('button');
  resetBtn.id = "reset-btn";
  resetBtn.textContent = "Reset";

  const pauseBtn = document.createElement('button');
  pauseBtn.id = "pause-btn";
  pauseBtn.textContent = "Pause";

  btnBox.appendChild(resetBtn);
  btnBox.appendChild(pauseBtn);

  // p5js 캔버스 아래에 붙이기 (캔버스가 body에 바로 붙는 구조라면)
  const canvas = document.querySelector('canvas');
  if (canvas && canvas.parentNode) {
    canvas.parentNode.insertBefore(btnBox, canvas.nextSibling);
  } else {
    // fallback: body 맨 뒤에 추가
    document.body.appendChild(btnBox);
  }

  // 버튼 동작
  let paused = false;
  resetBtn.onclick = () => {
    window.location.reload();
  };
  pauseBtn.onclick = function () {
    if (!paused) {
      noLoop();
      this.textContent = "Resume";
    } else {
      loop();
      this.textContent = "Pause";
    }
    paused = !paused;
  };
}, 1000);