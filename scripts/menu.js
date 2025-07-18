const chapters = [
    { title: "0. Randomness", link: "/nature-of-code-study/chapters/randomness.html" },
    { title: "1. Vectors", link: "/nature-of-code-study/chapters/vectors.html" },
    { title: "2. Forces", link: "/nature-of-code-study/chapters/forces.html" }
];

function createMenu() {
    const nav = document.createElement('nav');
    const h2 = document.createElement('h2');
    const menu = document.createElement('ul');

    chapters.forEach(chapter => {
        const menuItem = document.createElement('li');
        const menuLink = document.createElement('a');
        menuLink.href = chapter.link;
        menuLink.textContent = chapter.title;
        // 현재 페이지면 active 클래스 추가
        if (window.location.pathname.endsWith(chapter.link.split('/').pop())) {
            menuLink.classList.add('active');
        }
        menuItem.appendChild(menuLink);
        menu.appendChild(menuItem);
    });

    nav.appendChild(h2);
    nav.appendChild(menu);

    // body의 맨 앞에 nav 삽입
    document.body.prepend(nav);
}

document.addEventListener('DOMContentLoaded', createMenu);