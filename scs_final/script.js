document.addEventListener('DOMContentLoaded', () => {
    // ── 1. SCROLL ANIMATIONS (Intersection Observer) ──
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
            } else {
                entry.target.classList.remove('appear');
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // ── 2. NAVBAR SCROLL & MOBILE MENU ──
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-[#fff2f1]/95', 'shadow-glass-md', 'backdrop-blur-md', 'py-[15px]');
            navbar.classList.remove('bg-transparent', 'py-5');
        } else {
            navbar.classList.add('bg-transparent', 'py-5');
            navbar.classList.remove('bg-[#fff2f1]/95', 'shadow-glass-md', 'backdrop-blur-md', 'py-[15px]');
        }
    });

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('hidden');
        navLinks.classList.toggle('flex');
        navLinks.classList.toggle('flex-col');
        navLinks.classList.toggle('absolute');
        navLinks.classList.toggle('top-[100%]');
        navLinks.classList.toggle('left-0');
        navLinks.classList.toggle('w-full');
        navLinks.classList.toggle('bg-[#fff2f1]');
        navLinks.classList.toggle('p-5');
        navLinks.classList.toggle('shadow-glass-md');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                navLinks.classList.add('hidden');
                navLinks.classList.remove('flex', 'flex-col', 'absolute', 'top-[100%]', 'left-0', 'w-full', 'bg-[#fff2f1]', 'p-5', 'shadow-glass-md');
            }
        });
    });

    // ── 3. THREE.JS HERO ANIMATION ──
    const initThreeJS = () => {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2('#FFF2F1', 0.035);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100);
        camera.position.set(0, 0, 20);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const group = new THREE.Group();
        scene.add(group);

        const geometries = [
            new THREE.IcosahedronGeometry(1.0, 0),
            new THREE.OctahedronGeometry(1.0, 0),
            new THREE.DodecahedronGeometry(1.0, 0)
        ];

        const materialWire = new THREE.LineBasicMaterial({
            color: 0x6d5b99, // Dark Purple
            transparent: true,
            opacity: 0.25
        });

        const materialSolid = new THREE.MeshBasicMaterial({
            color: 0xCBC5EA, // matches primary color approximately
            polygonOffset: true,
            polygonOffsetFactor: 1,
            polygonOffsetUnits: 1
        });

        const shapes = [];
        for (let i = 0; i < 40; i++) {
            const geoIndex = Math.floor(Math.random() * geometries.length);
            const geometry = geometries[geoIndex];

            const wireframe = new THREE.WireframeGeometry(geometry);
            const line = new THREE.LineSegments(wireframe, materialWire.clone());

            const isHighlight = Math.random() > 0.8;
            if (isHighlight) {
                line.material.color.setHex(0xA855F7); // Purple highlight
                line.material.opacity = 0.5;
            } else {
                line.material.opacity = 0.1 + Math.random() * 0.2;
            }

            const mesh = new THREE.Mesh(geometry, materialSolid);

            const shapeGroup = new THREE.Group();
            shapeGroup.add(mesh);
            shapeGroup.add(line);

            shapeGroup.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20 - 5
            );

            const scale = 0.5 + Math.random() * 1.5;
            shapeGroup.scale.set(scale, scale, scale);

            shapeGroup.userData = {
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                    z: (Math.random() - 0.5) * 0.01
                },
                floatSpeed: 0.2 + Math.random() * 0.3,
                floatOffset: Math.random() * Math.PI * 2,
                baseY: shapeGroup.position.y
            };

            group.add(shapeGroup);
            shapes.push(shapeGroup);
        }

        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth - 0.5);
            mouseY = (event.clientY / window.innerHeight - 0.5);
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            group.rotation.y = t * 0.05;

            shapes.forEach((shape) => {
                const data = shape.userData;
                shape.rotation.x += data.rotSpeed.x;
                shape.rotation.y += data.rotSpeed.y;
                shape.rotation.z += data.rotSpeed.z;
                shape.position.y = data.baseY + Math.sin(t * data.floatSpeed + data.floatOffset) * 0.5;
            });

            camera.position.x += (mouseX * 5 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        };
        animate();
    };

    initThreeJS();

    // ── 4. CONTACT FORM SUBMISSION ──
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            submitBtn.disabled = true;
            submitBtn.querySelector('.btn-text').textContent = 'Sending...';
            formStatus.textContent = '';
            formStatus.className = 'mb-4 text-sm font-medium';

            try {
                const submitUrl = window.location.protocol === 'file:' ? 'http://127.0.0.1:5000/api/submit-contact' : '/api/submit-contact';
                const response = await fetch(submitUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                const result = await response.json();

                if (result.status === 'success') {
                    formStatus.textContent = '✅ Message sent successfully! We\'ll get back to you soon.';
                    formStatus.classList.add('text-green-600');
                    contactForm.reset();
                } else {
                    formStatus.textContent = '❌ Something went wrong. Server returned: ' + (result.message || 'Unknown error');
                    formStatus.classList.add('text-red-500');
                }
            } catch (error) {
                console.error('Fetch Error:', error);
                formStatus.textContent = '❌ Unable to send message. Please checking your internet connection and ensure the server is running.';
                formStatus.classList.add('text-red-500');
            } finally {
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = 'Send Message';
            }
        });
    }

    // ── 5. CHATBOT LOGIC ──
    const chatbotMascot = document.getElementById('chatbot-mascot-container');
    const chatbotToggler = document.getElementById('chatbot-toggler');
    const chatbotCloseBtn = document.getElementById('close-btn');
    const chatbotUI = document.getElementById('chatbot-ui');
    const chatbox = document.getElementById('chatbox');
    const chatInput = document.getElementById('chat-input-field');
    const sendChatBtn = document.getElementById('send-btn');
    let isChatOpen = false;

    const toggleChat = () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            document.body.classList.add('show-chatbot');
            chatInput.focus();
        } else {
            document.body.classList.remove('show-chatbot');
        }
    };

    chatbotMascot.addEventListener('click', toggleChat);
    chatbotToggler.addEventListener('click', toggleChat);
    chatbotCloseBtn.addEventListener('click', toggleChat);

    const createChatLi = (message, className, isError = false) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        if (isError) chatLi.classList.add("error");

        let chatContent = className === "outgoing"
            ? `<p>${message}</p>`
            : `<span class="material-symbols-outlined">smart_toy</span><p class="${isError ? 'error' : ''}">${message}</p>`;

        chatLi.innerHTML = chatContent;
        return chatLi;
    }

    const generateResponse = async (incomingChatLi, userMessage) => {
        const messageElement = incomingChatLi.querySelector("p");

        try {
            const chatUrl = window.location.protocol === 'file:' ? 'http://127.0.0.1:5000/api/chat' : '/api/chat';
            const response = await fetch(chatUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Something went wrong!");

            messageElement.textContent = data.response || data.message || "I didn't understand that.";
        } catch (error) {
            messageElement.classList.add("text-red-500", "bg-red-50");
            messageElement.textContent = "Error: Cannot connect to server. Please ensure backend is running.";
        } finally {
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    }

    const handleChat = () => {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Clear input and change height
        chatInput.value = "";
        chatInput.style.height = "55px";

        // Append user message
        const outgoingChatLi = createChatLi(userMessage, "outgoing");
        chatbox.appendChild(outgoingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi, userMessage);
        }, 600);
    }

    chatInput.addEventListener('input', () => {
        chatInput.style.height = "55px";
        chatInput.style.height = `${chatInput.scrollHeight}px`;
        if (chatInput.value.trim().length > 0) {
            sendChatBtn.classList.remove('invisible');
        } else {
            sendChatBtn.classList.add('invisible');
        }
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
            sendChatBtn.classList.add('invisible');
        }
    });

    sendChatBtn.addEventListener('click', () => {
        handleChat();
        sendChatBtn.classList.add('invisible');
    });

});
