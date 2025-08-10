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

function createCodeBlock({ code, language = "javascript", target = null, comment = "" }) {
  const container = target ?? document.createElement('div');
  container.classList.add('overflow-visible', 'pt-0', 'codesplit', 'callout', 'not-prose');

  // 코드 블럭
  const pre = document.createElement('pre');
  pre.className = `hljs code language-${language}`;
  const codeElem = document.createElement('code');
  codeElem.className = `hljs code language-${language}`;
  codeElem.textContent = code;
  pre.appendChild(codeElem);

  // 주석(설명)
  let commentDiv = null;
  if (comment) {
    commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `<p>${comment}</p>`;
  }

  // 구조 맞추기
  const pairDiv = document.createElement('div');
  pairDiv.className = 'pair';
  pairDiv.appendChild(pre);
  if (commentDiv) pairDiv.appendChild(commentDiv);

  // container.appendChild(pairDiv);
  target.insertAdjacentElement('afterend', container);

  return container;
}

createP5ExampleEmbed({
  exampleId: "oscillation/example1",
  width: '100%',
  height: 680,
  base: "https://eunchae-jeon.github.io/nature-of-code-study/examples",
  target: document.querySelectorAll('[data-type="exercise"]')[12]
});

