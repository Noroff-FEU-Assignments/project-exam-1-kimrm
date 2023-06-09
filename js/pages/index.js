import visibleDetector from "../functions/observer.js";

const carouselImages = [];

export default function index() {
  const url =
    "https://wp-foodblog.kimrune.dev/wp-json/wp/v2/posts?_embed=wp:featuredmedia&per_page=100";
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      renderStickyPost(data);
      renderCarousel(data);
    });
}

function renderStickyPost(data) {
  const content = document.querySelector(".diagonal-hero__body");
  visibleDetector(content, "loaded");

  const post = data.filter((post) => post.sticky === true)[0];
  const title = document.querySelector(".diagonal-hero__title");
  title.innerHTML = post.title.rendered;
  const body = document.querySelector(".diagonal-hero__text");
  body.innerHTML = post.excerpt.rendered;

  const image =
    post._embedded["wp:featuredmedia"][0].media_details.sizes.large.source_url;
  const image1 = document.querySelector(".main-image");
  image1.src = image;
  const image2 = document.querySelector(".second-image");
  image2.src = image;
  image1.addEventListener("load", () => {
    image1.classList.add("main-image-visible");
  });
  image2.addEventListener("load", () => {
    image2.classList.add("second-image-visible");
  });

  const cta_button = document.querySelector(".hero-cta-button");
  cta_button.href = `/blog/blog-post.html?id=${post.id}`;
}

function renderCarousel(posts) {
  preloadImages(posts);

  const posts_grid = document.querySelector(".carousel-posts-grid");
  const button_left = document.querySelector("#button_left");
  const button_right = document.querySelector("#button_right");

  let position = 0;
  const count = 3;
  const columns = createGrid(posts, position, count);
  posts_grid.append(...columns);
  insertPosts(posts, position, count);
  setTimeout(() => {
    clearAnimations();
  }, 200);

  button_right.addEventListener("click", () => {
    position += count;
    setSlideOutAnimation();
    setTimeout(() => {
      insertPosts(posts, position, count);
    }, 500);
  });

  button_left.addEventListener("click", () => {
    position -= count;
    setSlideOutAnimation();
    setTimeout(() => {
      insertPosts(posts, position, count);
    }, 500);
  });
}

function preloadImages(posts) {
  posts.forEach((post) => {
    const img = new Image();
    img.src = `${post._embedded["wp:featuredmedia"][0].media_details.sizes.large.source_url}`;
    img.alt = `${post._embedded["wp:featuredmedia"][0].alt_text}`;
    carouselImages.push(img);
  });
}

function clearAnimations() {
  const columns = document.querySelectorAll(".posts-column");
  columns.forEach((column) => {
    column.classList.remove("slidable");
    column.classList.remove("out");
    column.classList.remove("in");
  });
}

function insertPosts(data, position, count = 3) {
  const displayPosts = data.slice(position, position + count);
  const preloadedImages = carouselImages.slice(position, position + count);
  const columns = document.querySelectorAll(".posts-column");
  let i = 0;

  displayPosts.forEach((post) => {
    const column = columns[i];
    if (column) {
      column.href = `/blog/blog-post.html?id=${displayPosts[i].id}`;
      column.classList.remove("in");
      const img_container = column.querySelector(
        ".posts-column__image-container"
      );
      img_container.innerHTML = "";
      const image = preloadedImages[i];
      img_container.append(image);

      const title = column.querySelector("h3");
      title.classList.add("posts-column__title");
      title.innerHTML = `${displayPosts[i].title.rendered}`;
      column.classList.add("in");
      setTimeout(() => {
        column.classList.remove("out");
        column.classList.remove("in");
      }, 500);
      i++;
    }
  });

  if (position >= data.length - count) {
    if (!button_right.classList.contains("hide")) {
      button_right.classList.add("hide");
    }
  } else {
    button_right.classList.remove("hide");
  }
  if (position === 0) {
    if (!button_left.classList.contains("hide")) {
      button_left.classList.add("hide");
    }
  } else {
    button_left.classList.remove("hide");
  }
}

function setSlideOutAnimation() {
  const columns = document.querySelectorAll(".posts-column");
  columns.forEach((column) => {
    setTimeout(() => {
      column.classList.remove("slidable");
      column.classList.remove("in");
      column.classList.add("out");
    }, 200);
  });
}

function createGrid(data, position, count = 3) {
  const displayPosts = data.slice(position, position + count);

  const columns = displayPosts.map((post) => {
    const post_column_a = document.createElement("a");

    post_column_a.classList.add("posts-column", "slidable");

    const img_container = document.createElement("div");
    img_container.classList.add("posts-column__image-container");

    const title = document.createElement("h3");
    title.classList.add("posts-column__title");

    post_column_a.append(img_container, title);

    return post_column_a;
  });

  return columns;
}
