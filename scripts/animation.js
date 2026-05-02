const burger = document.getElementById('burgerMenu');
const navMenu = document.getElementById('navMenu');

if (burger && navMenu) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    document.querySelectorAll('.container a').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

const flatCards = document.querySelectorAll('.flats_box, .flats_info, .box_arg, .arguments, .inf_cont, .as');
flatCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
        card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        card.style.boxShadow = '0 20px 30px -12px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '';
    });
});

const processBoxes = document.querySelectorAll('.process_box');
processBoxes.forEach(box => {
    box.addEventListener('mouseenter', () => {
        box.style.transform = 'scale(1.02)';
        box.style.transition = 'transform 0.25s ease';
    });
    
    box.addEventListener('mouseleave', () => {
        box.style.transform = 'scale(1)';
    });
});

const buttons = document.querySelectorAll('button, .butt1, .butt2, .butt4, input[type="submit"]');
buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.02)';
        btn.style.transition = 'transform 0.2s ease';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});

const navLinks = document.querySelectorAll('.container a');
navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-2px)';
        link.style.transition = 'transform 0.2s ease';
    });
    
    link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0)';
    });
});

const animatedElements = document.querySelectorAll(
    '.flats_box, .inf_cont, .arguments, .box_arg, .process_box, .as, .text_box, .inf_cels, .flats_info'
);

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            appearOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    appearOnScroll.observe(el);
});

const counters = document.querySelectorAll('.cont h3, .brief_inf h3');
const speed = 200;

const animateNumber = (counter) => {
    const updateCount = () => {
        const target = parseInt(counter.getAttribute('data-target'));
        const count = parseInt(counter.innerText);
        const increment = target / speed;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(updateCount, 20);
        } else {
            counter.innerText = target;
        }
    };
    
    updateCount();
};

const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const targetText = counter.innerText;
            const targetNumber = parseInt(targetText.replace(/[^0-9]/g, ''));
            
            if (!isNaN(targetNumber)) {
                counter.setAttribute('data-target', targetNumber);
                counter.innerText = '0';
                animateNumber(counter);
            }
            numberObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => {
    numberObserver.observe(counter);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const formInputs = document.querySelectorAll('input, textarea, select');
formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.style.borderColor = '#155DFC';
        input.style.boxShadow = '0 0 0 3px rgba(21,93,252,0.1)';
        input.style.transition = 'all 0.2s ease';
    });
    
    input.addEventListener('blur', () => {
        input.style.borderColor = '#D1D5DC';
        input.style.boxShadow = 'none';
    });
});

const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const toast = document.createElement('div');
        toast.textContent = '✓ Заявка отправлена! Мы свяжемся с вами.';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #22c55e;
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        form.reset();
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* Пульсация для кнопок */
    .pulse {
        animation: pulse 0.5s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    /* Плавное появление для модальных окон */
    .fade-in {
        animation: fadeIn 0.4s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        btn.classList.add('pulse');
        setTimeout(() => {
            btn.classList.remove('pulse');
        }, 500);
    });
});

const greetingSection = document.querySelector('.greeting, .about, .contact, .property_bio, .our_service');
if (greetingSection) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        greetingSection.style.backgroundPositionY = scrolled * 0.5 + 'px';
    });
}

const toggleBtn = document.querySelector('.about__toggle');
if (toggleBtn) {
    const form = document.querySelector('.about__form form');
    const submitBtn = document.querySelector('.about__submit');
    const contactBtn = document.querySelector('.about__contact');
    
    let isFormHidden = false;
    
    toggleBtn.addEventListener('click', () => {
        if (isFormHidden) {
            form.style.display = 'flex';
            submitBtn.style.display = 'block';
            contactBtn.style.display = 'block';
            toggleBtn.textContent = 'Hide Form';
            isFormHidden = false;
        } else {
            form.style.display = 'none';
            submitBtn.style.display = 'none';
            contactBtn.style.display = 'none';
            toggleBtn.textContent = 'Show Form';
            isFormHidden = true;
        }
    });
}

const socialIcons = document.querySelectorAll('.icons, .inf_footer svg');
socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'translateY(-3px)';
        icon.style.transition = 'transform 0.2s ease';
    });
    
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'translateY(0)';
    });
});

console.log('Анимации загружены!');