// --- 1. THE "VECTOR DATABASE" (Knowledge Base) ---
// We chunk the CV into searchable documents, just like a real RAG pipeline.
const cvDatabase = [
    {
        id: "summary",
        keywords: ["who", "about", "summary", "background", "transition", "aspiring", "goal"],
        text: "Aleksandar is an experienced Java Backend Developer transitioning into an AI Engineering role. He specializes in Spring Framework and Microservices, and is actively learning Agentic AI, RAG, and Vector DBs."
    },
    {
        id: "skills_java",
        keywords: ["java", "spring", "boot", "mvc", "backend", "microservices", "api", "framework"],
        text: "Aleksandar has deep expertise in Java backend development. His primary stack includes Spring Boot, Spring MVC, REST APIs, and building scalable microservices."
    },
    {
        id: "skills_ai",
        keywords: ["ai", "artificial intelligence", "rag", "vertex", "vector", "database", "llm", "agent", "agentic", "langchain", "spring ai"],
        text: "He is actively upskilling in AI Engineering. His current focus includes Retrieval-Augmented Generation (RAG), Agentic AI workflows, and integrating LLMs using Vector Databases like Google Vertex AI Vector Search, as well as Spring AI."
    },
    {
        id: "exp_musement",
        keywords: ["musement", "current", "job", "work", "experience", "software engineer"],
        text: "Since January 2022, Aleks has been a Software Engineer at Musement. He develops and supports scalable microservices for booking systems, and maintains internal content management tools."
    },
    {
        id: "exp_scai",
        keywords: ["scai", "gruppo", "past", "job", "previous", "experience"],
        text: "From 2020 to 2022, he worked at Gruppo SCAI developing high-performance microservices using the Spring Framework for enterprise clients."
    },
    {
        id: "languages",
        keywords: ["language", "speak", "english", "italian", "serbian", "croatian"],
        text: "Aleksandar is highly multilingual. He speaks Native/Bilingual Serbian, Italian, and Croatian, and possesses Professional Working proficiency in English."
    }
];

// --- 2. CORE LOGIC ---

function processQuery() {
    const inputField = document.getElementById("user-input");
    const query = inputField.value.trim();
    if (query === "") return;

    appendMessage(query, "user-msg", "❯ ");
    inputField.value = "";
    
    // Simulate the RAG Pipeline delay to look authentic
    simulateRagPipeline(query);
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        processQuery();
    }
}

async function simulateRagPipeline(query) {
    const chatWindow = document.getElementById("chat-window");
    
    // Step 1: Simulate Embedding
    const step1 = appendMessage("Embedding query (text-embedding-gecko)...", "pipeline-step");
    await sleep(600);
    
    // Step 2: Simulate Vector Search
    step1.innerText = "Performing ANN Search in simulated Vertex Vector DB...";
    await sleep(600);

    // Perform actual keyword search
    const bestChunk = retrieveContext(query);

    // Step 3: Simulate LLM Generation
    step1.innerText = "Context retrieved. Generating response via LLM...";
    await sleep(500);
    
    step1.style.display = 'none'; // hide pipeline text
    
    let finalResponse = "";
    if (bestChunk) {
        finalResponse = `Based on the retrieved context: ${bestChunk.text}`;
    } else {
        finalResponse = "My vector search couldn't find an exact match for that in the CV space. Try asking about his 'Java experience', 'AI skills', or 'Musement'.";
    }

    typeWriterEffect(finalResponse, chatWindow);
}

// Simulated Cosine Similarity (Keyword overlapping)
function retrieveContext(query) {
    const tokens = query.toLowerCase().split(/\W+/);
    let bestMatch = null;
    let highestScore = 0;

    cvDatabase.forEach(chunk => {
        let score = 0;
        chunk.keywords.forEach(kw => {
            if (tokens.includes(kw)) score++;
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = chunk;
        }
    });

    return highestScore > 0 ? bestMatch : null;
}

// --- 3. UI UTILITIES ---

function appendMessage(text, className, prefix = "") {
    const chatWindow = document.getElementById("chat-window");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = `<p>${prefix}${text}</p>`;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return msgDiv.querySelector("p");
}

async function typeWriterEffect(text, container) {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message ai-msg";
    const p = document.createElement("p");
    p.innerHTML = "<b>[AI Agent]</b>: ";
    msgDiv.appendChild(p);
    container.appendChild(msgDiv);

    let i = 0;
    const speed = 25; // typing speed in ms

    function type() {
        if (i < text.length) {
            p.innerHTML += text.charAt(i);
            i++;
            container.scrollTop = container.scrollHeight;
            setTimeout(type, speed);
        }
    }
    type();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}