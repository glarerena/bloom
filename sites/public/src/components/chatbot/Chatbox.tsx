import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import styles from "./Chatbox.module.scss"
import { Send } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatBox() {
  console.log("✅ Chatbox component is rendering...")
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async () => {
    if (!question.trim()) return

    setLoading(true)
    setError("")

    const userMessage: Message = { role: "user", content: question }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    try {
      const res = await fetch("http://localhost:3005/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: messages,
        }),
      })

      if (!res.ok) throw new Error("Something went wrong")

      const data = await res.json()
      const assistantMessage: Message = { role: "assistant", content: data.response }
      setMessages([...updatedMessages, assistantMessage])
    } catch (err) {
      setError("Failed to fetch response.")
      console.error("Chat error:", err)
    } finally {
      setLoading(false)
      setQuestion("")
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void handleSubmit()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const toggleMinimize = () => {
    if (!open) {
      setMessages([
        {
          role: "assistant",
          content:
            "👋 Hello! I'm HERO — your Housing Essential Resource Organizer, to help navigate housing support across the Bay Area.\n\n⚠️ *This chatbot is an experimental tool. Please verify all information with official housing resources before making decisions.*\n\nHow can I help you today?",
        },
      ])
    }
    setOpen(!open)
  }

  return (
    <div className={styles.wrapper}>
      {open ? (
        <div className={styles.container}>
          {/* HEADER */}
          <div className={styles.header}>
            <button
              type="button"
              className={styles.headerTitle}
              onClick={toggleMinimize}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleMinimize()
              }}
            >
              HERO: Housing Essential Resource Organizer
            </button>
            <button
              type="button"
              className={styles.headerIcon}
              onClick={toggleMinimize}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleMinimize()
              }}
            >
              <img src="/purple_house.png" alt="Minimize chat" />
            </button>
          </div>

          <div className={styles.content}>
            {messages.map((msg, i) => {
              const isAssistant = msg.role === "assistant"
              const parts = isAssistant ? msg.content.split("\n\n") : [msg.content]

              return (
                <div
                  key={i}
                  className={`${styles.message} ${
                    isAssistant ? styles.assistantMessage : styles.userMessage
                  }`}
                >
                  <strong>{msg.role === "user" ? "You" : "Hero"}:</strong>{" "}
                  <ReactMarkdown
                    components={{
                      a: (props) => (
                        <a {...props} target="_blank" rel="noopener noreferrer">
                          {props.children || "Link"}
                        </a>
                      ),
                      p: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {parts[0]}
                  </ReactMarkdown>
                  {isAssistant &&
                    parts.slice(1).map((line, j) => (
                      <div key={j} style={{ marginTop: "0.5em" }}>
                        <ReactMarkdown
                          components={{
                            a: (props) => (
                              <a {...props} target="_blank" rel="noopener noreferrer">
                                {props.children}
                              </a>
                            ),
                          }}
                        >
                          {line}
                        </ReactMarkdown>
                      </div>
                    ))}
                </div>
              )
            })}

            {error && <div className={styles.error}>{error}</div>}
            <div ref={chatEndRef} />
          </div>

          <form className={styles.inputArea} onSubmit={handleFormSubmit}>
            <input
              className={styles.input}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I assist?"
              disabled={loading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={loading}
              aria-label="Send message"
            >
              {loading ? <span className={styles.spinner} /> : <Send size={20} />}
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          className={styles.fab}
          onClick={toggleMinimize}
          aria-label="Open chat"
        >
          <img src="/purple_house.png" alt="Open chat" className={styles.fabImage} />
        </button>
      )}
    </div>
  )
}
