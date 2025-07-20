function createP5ExampleEmbed({ exampleId, width = 600, height = 400, base = "examples", target = null }) {
  // 예제 id: "vectors/example1" 또는 "forces/example1" 등
  const container = target ?? document.createElement('div');
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


function createYoutubeEmbed({ videoId, width = 600, height = 338, target = null, start = 0 }) {
  const container = target ?? document.createElement('div');
  container.style.marginTop = "32px";
  container.style.width = width + "px";

  const iframe = document.createElement('iframe');
  iframe.width = width;
  iframe.height = height;
  iframe.src = `https://www.youtube.com/embed/${videoId}?start=${start}&rel=0 `;
  iframe.title = "YouTube video player";
  iframe.frameBorder = "0";
  iframe.allow =
    "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;

  container.appendChild(iframe);

  return container;
}

function createImageEmbed({ imgUrl, alt = "", width = 600, target = null, marginTop = "32px" }) {
  const container = target ?? document.createElement('div');
  container.style.marginTop = marginTop;
  container.style.width = width + "px";
  container.style.textAlign = "center";

  const img = document.createElement('img');
  img.src = imgUrl;
  img.alt = alt;
  img.style.maxWidth = "100%";
  img.style.height = "200px";
  img.style.display = "block";
  img.style.margin = "0 auto";

  container.appendChild(img);

  return container;
}

createImageEmbed({
  imgUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWMxR0yIjV7awYjGgYKnc1En39uJQkjpzmKg&s",
  target: document.querySelector('.chapter-opening-quote'),

});
createImageEmbed({
  imgUrl: "https://mblogthumb-phinf.pstatic.net/MjAyMDA1MTVfNjkg/MDAxNTg5NTUxMjUxNDc1.NcyeQGqWmYsaKeDEQfgDw4-QrvpuvJOyH2CkRBCyHWog.5c2grQRGxA9yi79gazbM_6dv5QkKPCI0SDZfJJB7jAkg.PNG.ktojja/1.png?type=w800",
  target: document.querySelector('.chapter-opening-quote'),

});
createYoutubeEmbed({
  videoId: "L4EdtpCvF8I",
  width: 600,
  height: 338,
  target: document.querySelector('.chapter-opening-quote'),
  start: 0 // 시작 시간(초), 필요시 변경
});

// https://www.youtube.com/watch?v=eBddDhSsfzw
createYoutubeEmbed({
  videoId: "eBddDhSsfzw",
  width: 600,
  height: 338,
  target: document.querySelector('.chapter-opening-quote'),
  start: 90 // 시작 시간(초), 필요시 변경
});

createP5ExampleEmbed({
  exampleId: "vectors/example1",
  width: '100%',
  height: 680,
  base: "https://eunchae-jeon.github.io/nature-of-code-study/examples",
  target: document.querySelector('[data-translation-id="p_8"]')
});


