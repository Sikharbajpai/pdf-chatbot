import React, { useState } from "react";
const ChatWindow = ({ chats }) => {
  return (
    <>
      {chats?.map((res) => (
        <>
          {res.type == "bot" ? (
            <div
              style={{
                maxWidth: "60%",
              }}
              className="d-flex"
            >
              <div style={{ position: "relative" }}>
                <span className="bg-warning rounded-circle mx-1 p-2">B</span>
              </div>
              <div className="card bg-info">
                <div
                  className="card-body p-2"
                  style={{ whiteSpace: "break-spaces" }}
                >
                  {res.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex justify-content-end my-3">
              <div className="card bg-info">
                <div
                  className="card-body p-2"
                  style={{ whiteSpace: "break-spaces" }}
                >
                  {res.message}
                </div>
              </div>
              <div className="position-relative" style={{ paddingRight: 20 }}>
                <span className="bg-warning rounded-circle mx-1 px-2 position-absolute bottom-0">
                  U
                </span>
              </div>
            </div>
          )}
        </>
      ))}
    </>
  );
};

export default ChatWindow;
