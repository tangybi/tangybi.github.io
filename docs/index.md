---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "My Awesome Project"
  text: "A VitePress Site"
  tagline: My great project tagline
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples


---

<div class="home-layout">
  <div class="home-left">
    <Music />
    <CategoryCard :categories="[
      { name: '11', count: 10 },
    ]" />
    <TagCard :tags="['Awesome','PyTorch']" />
  </div>
  <div class="home-right">
    <PostList :posts="[
      {
        title: 'mytorch[0]:',
        date: '2026-05-09',
        category: 'mytorch',
        tags: ['mytorch'],
        link: '/posts/mytorch-0',
      },
    ]" />
  </div>
</div>

<style>
.home-layout {
  display: flex;
  gap: 10px;
  /* max-width: 900px; */
  /* margin: 0 auto; */
  padding: 0 10px;
  align-items: flex-start;
}
.home-left {
  flex: 0 0 220px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.home-right {
  flex: 1;
  min-width: 0;
}
@media (max-width: 768px) {
  .home-layout {
    flex-direction: column;
  }
  .home-left {
    display: none;
  }
  .home-right {
    width: 100%;
    min-width: none;
  }
}
</style>
