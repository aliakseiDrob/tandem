15.02.2026

Вызвался на CI/CD потому что надо браться за всё новое даже если вообще не знаешь как делать.
Сначала берёшь задачу, а потом разбираешься как делать.
Чтобы с приходом на любой следующий проект список того что умеешь всегда расширялся.

Думал будет долго и непонятно.
Оказалось что это один файл сделать. За 3-4 часа справился. Видимо не получится засчитать это как "компонент" :)

Pipeline срабатывает на push и pull request в ветку main. Запускает линтер, prettier и если там всё хорошо то запускает build проекта потому что зачем билдить если на предыдущих этапах была ошибка. Поэтому порядок имеет значение.
Тесты не запускает потому что их нет.

Ещё в CI/CD бывает что нужно Docker немного настроить, но это не в нашем случае. Хотя с ним тоже никогда не работал.
Если случай будет в более сложных проектах надо сразу браться на это дело. И не важно какой сложности проект будет.
Теперь в резюме можно смело записывать что могу сделать CI/CD.

Дальше делаем event loop game. Надо разбить на подзадачи чтобы понять сколько времени это займёт и что конкретно делать.

PR: https://github.com/PoMaKoM-RSTeam/Rs-Tandem/pull/2

<details>
<summary>Такой файл получился:</summary>

```name: GitHub Actions
run-name: Production deployment triggered by ${{ github.actor }}

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build_and_test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [24.x]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Format with Prettier
        run: npm run format

      - name: Run Linter
        run: npm run lint

      - name: Build Project
        run: npm run build

      - name: Upload Build Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist/rs-tandem/browser

  deploy:
    needs: build_and_test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
</details>
```
