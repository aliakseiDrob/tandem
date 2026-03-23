17.02.2026

Сделал небольшой план из чего будет состоять Event Loop Game и примерный срок выполнения.<br>
Получилось 4 пункта.<br>
Не уверен нужно ли разбивать логику ещё глубже. Вроде это самое основное, но всего лишь 4 пункта.<br>

Оценка в сторипоинтах для нашего случая не очень подходит, поэтому договорились ставить как S, M, L или XL.<br>

Схема: https://excalidraw.com/#json=RCOwg1MqvpDoHQ7aRiowS,LTZL2vaQPCG6WhIzIhtL6Q

План и временная оценка:

1. Create UI elements - `L`
2. Add drag and drop for code blocks and buckets. Including minimal UI effects: on drop, on hover, highlight drop areas - `M`
3. Create animation of moving blocks from buckets to output when button 'run loop' pressed - `L`
4. Prevent user from dropping code blocks in wrong order (e.g. if the next micro task is block 2 but the user tries dropping block) - `M`

Блокеры:

- не знаю Angular,
- drag and drop тоже надо подтянуть (в rss-puzzle делал, но там получилось не идеально).
- С анимацией работал мало, только знаю что примерно гуглить надо

Что дальше:

- начать разбираться с Angular и делать UI элементы.
- Посмотреть файл с командного созвона по Angular, читать документацию и на ютубе небольшой crash course глянуть.
