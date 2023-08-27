import React, { useEffect, useRef, useState } from "react";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import ChatWindow from "./ChatWindow";
import { BufferMemory } from "langchain/memory";

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 0,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const memory = new BufferMemory({
  memoryKey: "chat_history",
  returnMessages: true,
});

const initialValue = [
  {
    type: "bot",
    message: "Hi, My name is Shikhar. How may I help you?",
  },
];

const LandingPage = () => {
  const [fileName, setFileName] = useState("");
  const [vectorStorage, setVectorStorage] = useState("");
  const [spinnerLoader, setSpinnerLoader] = useState("");
  const [chatLoader, setChatLoader] = useState("");
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState(initialValue);
  let inputRef = useRef();
  async function handleUpdate(e) {
    if (e.target.files?.length > 0) {
      setSpinnerLoader(true);
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      const blob = await fetch(fileUrl).then((res) => res.blob());
      const loader = new PDFLoader(blob);

      const data = await loader.load();

      const splitDocs = await textSplitter.splitDocuments(data);

      const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
        memory
      );
      setChats(initialValue);
      setFileName(e.target.files[0].name);
      setVectorStorage(vectorStore);
      setSpinnerLoader(false);
    }
  }

  async function handleSendMessage() {
    setMessage("");
    setChats((prevChats) => [...prevChats, { type: "user", message: message }]);
    setChatLoader(true);
    const chain = RetrievalQAChain.fromLLM(model, vectorStorage.asRetriever());

    const response = await chain.call({
      query: `${message}`,
    });

    setChats((prevChats) => [
      ...prevChats,
      { type: "bot", message: response.text },
    ]);

    setChatLoader(false);
  }
  useEffect(() => {
    let x = document.getElementById("chat-Window");
    x.scrollTop = x.scrollHeight;
  });

  return (
    <>
      <div className="container">
        <form className="row py-5">
          <div className="col-sm-2" />
          <div className="col-sm-8">
            <div className="input-group">
              <input type="text" className="form-control" value={fileName} />
              <span
                className="input-group-text"
                onClick={() => inputRef.click()}
                disabled={spinnerLoader}
                style={{ cursor: "pointer" }}
              >
                {spinnerLoader ? (
                  <div className="spinner-border text-success" />
                ) : (
                  <i className="fa fa-paperclip" aria-hidden="true" />
                )}
                &nbsp; Attach{" "}
              </span>
              <input
                ref={(input) => (inputRef = input)}
                type="file"
                className="form-control"
                id="fileUpload"
                hidden
                onChange={handleUpdate}
              />
            </div>
          </div>
        </form>
        <div
          className="card"
          style={{
            backgroundColor: "#CDEABC",
            minHeight: "500px",
          }}
        >
          <div
            className="card-body"
            style={{
              overflowY: "scroll",
              maxHeight: 500,
            }}
            id={"chat-Window"}
          >
            <ChatWindow chats={chats} />
          </div>

          {chatLoader && <div className="dots-3 mx-4 mb-3" />}
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              disabled={!vectorStorage}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                console.log(e.key);
                e.key == "Enter" && handleSendMessage();
              }}
            />
            <button
              className="input-group-text"
              disabled={!vectorStorage}
              onClick={handleSendMessage}
              style={{ cursor: "pointer" }}
            >
              <i class="fa fa-paper-plane" aria-hidden="true" /> &nbsp; Send{" "}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
