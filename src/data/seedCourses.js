export const INITIAL_COURSES = [
  {
    id: "useera-ai-01",
    title: "Generative AI & LLM Engineering Masterclass",
    subtitle: "Build state-of-the-art AI applications, RAG pipelines, and fine-tune Large Language Models.",
    category: "Artificial Intelligence",
    partner: "DeepLearning Institute & Useera",
    partnerLogo: "🧠",
    instructor: "Dr. Andrew Lin",
    instructorRole: "Adjunct Professor of AI & Lead Researcher",
    rating: 4.9,
    reviewsCount: 14230,
    enrolledCount: 128400,
    level: "Intermediate",
    duration: "4 weeks (5 hrs/week)",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    badge: "Bestseller",
    hasCertificate: true,
    price: 49,
    skills: ["Python", "PyTorch", "Transformers", "LangChain", "Vector Databases", "Prompt Engineering"],
    description: "Master the principles of Generative AI, transformer neural networks, attention mechanisms, Retrieval-Augmented Generation (RAG), and model fine-tuning with PyTorch and Hugging Face.",
    modules: [
      {
        id: "m1",
        title: "Module 1: Foundations of Generative AI & Attention Mechanisms",
        description: "Explore the core transformer architecture, self-attention calculations, and encoder-decoder mechanisms.",
        lessons: [
          {
            id: "l1_1",
            title: "Understanding Self-Attention & Transformers",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
            notes: "Transformers revolutionized NLP by discarding recurrence in favor of parallelized multi-head self-attention mechanisms. Learn how Queries, Keys, and Values compute context-aware token embeddings."
          },
          {
            id: "l1_2",
            title: "Tokenization & Vector Embeddings Deep Dive",
            type: "reading",
            notes: "Subword tokenization methods (BPE, WordPiece) break natural language down into numerical vectors. Dense embedding spaces preserve semantic relationships across high-dimensional space."
          }
        ],
        quiz: {
          id: "q1",
          title: "Module 1 Test: Transformer Architectures",
          timeLimit: 10,
          passingScore: 75,
          questions: [
            {
              id: "q1_1",
              question: "What primary mechanism allows Transformers to process all tokens in parallel instead of sequentially?",
              options: [
                "Recurrent Hidden Loop",
                "Self-Attention Mechanism",
                "Max Pooling Filters",
                "Gradient Clipping"
              ],
              correctAnswer: 1,
              explanation: "Self-Attention calculates relationships across all tokens simultaneously in parallel, eliminating the sequential bottleneck of RNNs."
            },
            {
              id: "q1_2",
              question: "In Self-Attention math, what three vectors are generated for each input token vector?",
              options: [
                "Query (Q), Key (K), Value (V)",
                "Weight, Bias, Output",
                "Encoder, Decoder, Latent",
                "Precision, Recall, F1"
              ],
              correctAnswer: 0,
              explanation: "Each token embedding is projected into Query (Q), Key (K), and Value (V) vectors to calculate dot-product attention scores."
            },
            {
              id: "q1_3",
              question: "Why are Positional Encodings added to input embeddings in Transformers?",
              options: [
                "To reduce memory consumption",
                "To inject order and position information since self-attention is permutation-invariant",
                "To prevent vanishing gradients",
                "To compress the vocabulary size"
              ],
              correctAnswer: 1,
              explanation: "Because self-attention operates on sets without inherent order, positional encodings provide sequence position context to the model."
            }
          ]
        }
      },
      {
        id: "m2",
        title: "Module 2: Building Retrieval-Augmented Generation (RAG) Systems",
        description: "Connect LLMs to custom knowledge bases using Vector Databases (Pinecone/Chroma) and embeddings.",
        lessons: [
          {
            id: "l2_1",
            title: "RAG Architecture Overview: Chunking, Indexing & Retrieval",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
            notes: "RAG mitigates hallucinations by grounding LLM generation in retrieved documents. Learn optimal text chunking strategies, cosine similarity retrieval, and prompt injection."
          },
          {
            id: "l2_2",
            title: "Selecting Vector Databases & Cosine Similarity",
            type: "reading",
            notes: "Vector databases index embeddings using Approximate Nearest Neighbor (ANN) search algorithms like HNSW (Hierarchical Navigable Small World graphs)."
          }
        ],
        quiz: {
          id: "q2",
          title: "Module 2 Test: RAG & Vector Search",
          timeLimit: 10,
          passingScore: 80,
          questions: [
            {
              id: "q2_1",
              question: "What major issue in LLMs does Retrieval-Augmented Generation (RAG) directly address?",
              options: [
                "Slow GPU inference speeds",
                "Model Hallucinations and outdated knowledge",
                "High storage cost of tokenizers",
                "CSS styling layout bugs"
              ],
              correctAnswer: 1,
              explanation: "RAG supplies relevant real-time contextual facts into the LLM prompt, dramatically reducing hallucinations."
            },
            {
              id: "q2_2",
              question: "Which metric is commonly used to calculate semantic similarity between two embedding vectors?",
              options: [
                "Cosine Similarity",
                "Manhattan Distance Only",
                "Hamming Distance",
                "Standard Deviation"
              ],
              correctAnswer: 0,
              explanation: "Cosine similarity measures the cosine of the angle between two multi-dimensional vectors, evaluating semantic alignment regardless of vector magnitude."
            }
          ]
        }
      }
    ]
  },
  {
    id: "useera-web-02",
    title: "Full-Stack Web Development & Modern Cloud Engineering",
    subtitle: "Build modern, scalable applications with React, Node.js, Next.js, and Cloud Serverless Architecture.",
    category: "Web Development",
    partner: "Useera Tech Academy",
    partnerLogo: "⚡",
    instructor: "Sarah Jenkins",
    instructorRole: "Senior Principal Staff Software Engineer",
    rating: 4.85,
    reviewsCount: 31200,
    enrolledCount: 245000,
    level: "Beginner",
    duration: "6 weeks (6 hrs/week)",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    badge: "Top Rated",
    hasCertificate: true,
    price: 39,
    skills: ["React", "JavaScript (ES6+)", "Node.js", "Express", "REST APIs", "CSS Grid & Flexbox"],
    description: "Learn modern web development from zero to deployment. Design high performance frontends and scalable backends using industry standards.",
    modules: [
      {
        id: "m1_web",
        title: "Module 1: React Fundamentals & Component Lifecycle",
        description: "Master React state management, hooks, props, dynamic rendering, and responsive design systems.",
        lessons: [
          {
            id: "l1_web_1",
            title: "React Component Architecture & JSX",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
            notes: "Components are the building blocks of modern React applications. JSX blends declarative HTML with JavaScript expressions seamlessly."
          },
          {
            id: "l1_web_2",
            title: "State Management with useState & useEffect Hooks",
            type: "reading",
            notes: "React Hooks allow functional components to manage local state and subscribe to lifecycle side-effects reliably."
          }
        ],
        quiz: {
          id: "q1_web",
          title: "Module 1 Test: React Components & Hooks",
          timeLimit: 10,
          passingScore: 75,
          questions: [
            {
              id: "q1_web_1",
              question: "What rule must always be followed when invoking React Hooks?",
              options: [
                "Hooks must only be called at the top level of React function components",
                "Hooks can be called inside nested for-loops",
                "Hooks must be imported directly from HTML scripts",
                "Hooks can only be called inside class constructor functions"
              ],
              correctAnswer: 0,
              explanation: "Calling hooks at the top level ensures React preserves the order of state calls across renders."
            },
            {
              id: "q1_web_2",
              question: "What happens when you pass an empty dependency array `[]` to `useEffect`?",
              options: [
                "The effect runs on every single state render",
                "The effect runs only once after the component mounts",
                "The effect never runs",
                "The component throws a runtime compilation error"
              ],
              correctAnswer: 1,
              explanation: "An empty dependency array tells React that the effect does not rely on any dynamic props or state, running it only on mount."
            }
          ]
        }
      }
    ]
  },
  {
    id: "useera-ds-03",
    title: "Google & Useera Data Science & Analytics Professional Certificate",
    subtitle: "Gain in-demand skills in SQL, Python data wrangling, Tableau visualization, and statistical modeling.",
    category: "Data Science",
    partner: "Stanford Online & Useera Data Lab",
    partnerLogo: "📊",
    instructor: "Prof. Michael Rodriguez",
    instructorRole: "Head of Statistics & Data Mining",
    rating: 4.92,
    reviewsCount: 45100,
    enrolledCount: 310000,
    level: "Beginner",
    duration: "5 weeks (4 hrs/week)",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    badge: "Professional Certificate",
    hasCertificate: true,
    price: 49,
    skills: ["Python", "Pandas", "SQL", "Data Visualization", "Hypothesis Testing", "Machine Learning"],
    description: "Transform raw data into business intelligence. Master analytical tools, statistical modeling, and data story-telling.",
    modules: [
      {
        id: "m1_ds",
        title: "Module 1: Exploratory Data Analysis with Python & Pandas",
        description: "Learn how to clean, reshape, filter, and aggregate multi-dimensional datasets efficiently.",
        lessons: [
          {
            id: "l1_ds_1",
            title: "Dataframes Manipulation & Filtering in Pandas",
            type: "video",
            videoUrl: "https://www.youtube.com/watch?v=vmEHCJofslg",
            notes: "Pandas DataFrames provide tabular structure for complex dataset manipulation, grouping, merging, and missing value imputation."
          }
        ],
        quiz: {
          id: "q1_ds",
          title: "Module 1 Test: Pandas & EDA Fundamentals",
          timeLimit: 10,
          passingScore: 80,
          questions: [
            {
              id: "q1_ds_1",
              question: "In Pandas, which method is used to remove missing or NaN values from a DataFrame?",
              options: [
                "df.dropna()",
                "df.removeNull()",
                "df.clean()",
                "df.deleteEmpty()"
              ],
              correctAnswer: 0,
              explanation: "df.dropna() drops rows or columns containing missing (NaN) values."
            }
          ]
        }
      }
    ]
  }
];
