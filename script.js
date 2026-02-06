// Переменные для управления состоянием
let yesButtonScale = 1;
let noButtonOffsetX = 0;
let isEnvelopeOpen = false;
let clickCount = 0;
let isMovingNoButton = false;
let animationFrameId = null;

// Элементы страницы 1
const page1 = document.getElementById('page1');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');

// Элементы страницы 2
const page2 = document.getElementById('page2');
const envelope = document.getElementById('envelope');
const envelopeFlap = document.getElementById('envelopeFlap');
const letter = document.getElementById('letter');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');

// Функция проверки столкновения кнопок
function checkButtonCollision() {
    // Получаем позиции и размеры кнопок (getBoundingClientRect учитывает текущие transform)
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    
    // Границы зеленой кнопки (уже с учетом scale через getBoundingClientRect)
    const yesLeft = yesRect.left;
    const yesRight = yesRect.right;
    const yesTop = yesRect.top;
    const yesBottom = yesRect.bottom;
    
    // Границы красной кнопки (getBoundingClientRect уже учитывает текущий translateX)
    const noLeft = noRect.left;
    const noRight = noRect.right;
    const noTop = noRect.top;
    const noBottom = noRect.bottom;
    
    // Проверяем пересечение (с небольшим запасом для более точного определения касания)
    const padding = 5; // Небольшой запас для определения касания
    const isColliding = !(
        noRight + padding < yesLeft || 
        noLeft - padding > yesRight || 
        noBottom + padding < yesTop || 
        noTop - padding > yesBottom
    );
    
    return isColliding;
}

// Функция плавного смещения красной кнопки
function moveNoButtonSmoothly() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    function animate() {
        // Проверяем столкновение
        if (checkButtonCollision()) {
            // Плавно сдвигаем вправо (маленький шаг за кадр)
            noButtonOffsetX += 1.5;
            
            // Применяем смещение (единственное место, где меняется transform)
            noBtn.style.transform = `translateX(${noButtonOffsetX}px)`;
            
            // Продолжаем анимацию
            animationFrameId = requestAnimationFrame(animate);
            isMovingNoButton = true;
        } else {
            // Столкновения нет - останавливаем смещение
            isMovingNoButton = false;
            animationFrameId = null;
        }
    }
    
    // Запускаем анимацию
    animationFrameId = requestAnimationFrame(animate);
}

// Обработчик кнопки "No" - увеличивает кнопку "Yes" с ускоряющимся ростом
noBtn.addEventListener('click', function() {
    // Увеличиваем счетчик кликов
    clickCount++;
    
    // Экспоненциальный рост: каждый клик увеличивает масштаб на больший процент
    // Формула: базовое увеличение * (1 + ускорение * количество кликов)
    const baseIncrease = 0.1;
    const acceleration = 0.15;
    const increase = baseIncrease * (1 + acceleration * clickCount);
    
    // Применяем ускоряющееся увеличение
    yesButtonScale += increase;
    yesBtn.style.transform = `scale(${yesButtonScale})`;
    
    // Небольшая задержка для применения transform перед проверкой столкновения
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Если есть столкновение - запускаем или продолжаем плавное смещение
            if (checkButtonCollision()) {
                if (!isMovingNoButton) {
                    moveNoButtonSmoothly();
                }
            }
        });
    });
});

// Обработчик кнопки "Yes" - переход на страницу 2
yesBtn.addEventListener('click', function() {
    // Плавный переход с анимацией
    page1.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    page1.style.opacity = '0';
    page1.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        page1.classList.remove('active');
        page2.classList.add('active');
        
        // Анимация появления страницы 2
        page2.style.opacity = '0';
        page2.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            page2.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            page2.style.opacity = '1';
            page2.style.transform = 'scale(1)';
        }, 50);
    }, 400);
});

// Функция создания вылетающих сердечек
function createFlyingHearts() {
    const envelopeRect = envelope.getBoundingClientRect();
    const centerX = envelopeRect.left + envelopeRect.width / 2;
    const centerY = envelopeRect.top + envelopeRect.height / 2;
    
    const heartSymbols = ['❤️', '💕', '💖', '💗', '💓', '💝'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-fly';
            heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            heart.style.left = centerX + (Math.random() - 0.5) * 100 + 'px';
            heart.style.top = centerY + (Math.random() - 0.5) * 100 + 'px';
            heart.style.animationDelay = Math.random() * 0.3 + 's';
            document.body.appendChild(heart);
            
            // Удаляем элемент после анимации
            setTimeout(() => {
                heart.remove();
            }, 2000);
        }, i * 100);
    }
}

// Обработчик кнопки "OPEN"
openBtn.addEventListener('click', function() {
    if (!isEnvelopeOpen) {
        isEnvelopeOpen = true;
        
        // Открываем клапан конверта
        envelopeFlap.classList.add('open');
        
        // Создаем вылетающие сердечки
        setTimeout(() => {
            createFlyingHearts();
        }, 300);
        
        // Выдвигаем письмо
        setTimeout(() => {
            letter.classList.add('open');
        }, 400);
    }
});

// Обработчик кнопки "CLOSE"
closeBtn.addEventListener('click', function() {
    if (isEnvelopeOpen) {
        isEnvelopeOpen = false;
        
        // Убираем письмо обратно
        letter.classList.remove('open');
        
        // Закрываем клапан конверта
        setTimeout(() => {
            envelopeFlap.classList.remove('open');
        }, 400);
    }
});

// Инициализация - убеждаемся, что страница 1 видна при загрузке
window.addEventListener('load', function() {
    page1.style.opacity = '1';
    page1.style.transform = 'scale(1)';
});

