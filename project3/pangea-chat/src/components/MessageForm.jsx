import { useState } from "react";
import { sendMessage, isTyping } from "react-chat-engine";
import { SendOutlined, PictureOutlined } from "@ant-design/icons";
import TranslateApi from "../utils/API";
import { Form } from "react-bootstrap";

const MessageForm = (props) => {
  const [value, setValue] = useState("");
  const { chatId, creds } = props;
  const [language, setLanguage] = useState("");
  const [translated, setTranslated] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const text = value.trim();

    const translated = await TranslateApi(text, language)
    setTranslated(translated);
    if (text.length > 0) sendMessage(creds, chatId, { text: translated });
    setValue("");
  };

  const handleChange = (event) => {
    setValue(event.target.value);

    isTyping(props, chatId);
  };

  const handleLangChange = (event) => {
    event.preventDefault();

    const languageChoice = document.querySelector(".language");

    setLanguage(languageChoice.value);
  };

  const handleUpload = (event) => {
    sendMessage(creds, chatId, { files: event.target.files, text: translated });
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        className="message-input"
        placeholder="Send a message..."
        value={value}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <label htmlFor="upload-button">
        <span className="image-button">
          <PictureOutlined className="picture-icon" />
        </span>
      </label>
      <input
        type="file"
        multiple={false}
        id="upload-button"
        style={{ display: "none" }}
        onChange={handleUpload}
      />
      <button type="submit" className="send-button">
        <SendOutlined className="send-icon" />
      </button>
      <Form.Control
        as="select"
        className="language"
        onChange={handleLangChange}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="de">German</option>
        <option value="ko">Korean</option>
        <option value="ar">Arabic</option>
      </Form.Control>
    </form>
  );
};

export default MessageForm;