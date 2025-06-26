import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  fetchAgentApps,
  fetchAgentChat,
  fetchDirectApiCall,
} from "../services/agentApi";

const useAgentChat = (open) => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userContext] = useState({ name: "John Doe", id_number: "123456789" });
  const [slotFilling, setSlotFilling] = useState(null);
  const [allCollectedParams, setAllCollectedParams] = useState({});
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(uuidv4());

  useEffect(() => {
    if (open) {
      fetchAgentApps()
        .then((data) => setApps(data))
        .catch(() => setApps([]));
    }
  }, [open]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleAppChange = useCallback((e) => {
    setSelectedApp(e.target.value);
    setMessages([]);
    setSlotFilling(null);
    setAllCollectedParams({});
    sessionIdRef.current = uuidv4();
  }, []);

  const handleOptionalYesNo = useCallback(
    async (answer) => {
      setMessages((msgs) => [...msgs, { sender: "user", text: answer }]);
      if (answer === "evet") {
        setSlotFilling((prev) => ({
          ...prev,
          state: "ask_optional_value",
          prompt: `Lütfen ${prev.currentOptional} için bir değer girin:`,
        }));
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            text: `Lütfen ${slotFilling.currentOptional} için bir değer girin:`,
          },
        ]);
      } else {
        const payload = {
          app_name: selectedApp,
          user_message: slotFilling.originalUserMessage,
          user_context: userContext,
          parameters: slotFilling.collected_parameters,
          slot_filling: null,
          session_id: sessionIdRef.current,
        };
        try {
          setLoading(true);
          const data = await fetchAgentChat(payload);
          if (data.status === "success") {
            setMessages((msgs) => [
              ...msgs,
              {
                sender: "agent",
                text: `İşlem tamamlandı! Sonuç: ${JSON.stringify(data.result)}`,
                result: data.result,
              },
            ]);
          } else if (data.status === "need_optional_parameters") {
            const apiData = await fetchDirectApiCall(
              data.endpoint,
              slotFilling.collected_parameters
            );
            setMessages((msgs) => [
              ...msgs,
              {
                sender: "agent",
                text: `İşlem tamamlandı! Sonuç: ${JSON.stringify(apiData)}`,
                result: apiData,
              },
            ]);
          } else {
            setMessages((msgs) => [
              ...msgs,
              { sender: "agent", text: data.message || "Bir hata oluştu." },
            ]);
          }
        } catch (error) {
          setMessages((msgs) => [
            ...msgs,
            { sender: "agent", text: `Bağlantı hatası: ${error.message}` },
          ]);
        } finally {
          setLoading(false);
          setSlotFilling(null);
        }
      }
    },
    [selectedApp, slotFilling, userContext]
  );

  const sendMessage = useCallback(
    async (userMessage, backendSlotFillingState = null, paramsToSend = {}) => {
      if (userMessage.trim() && !backendSlotFillingState) {
        setMessages((msgs) => [...msgs, { sender: "user", text: userMessage }]);
      }
      setLoading(true);
      const body = {
        app_name: selectedApp,
        user_message: slotFilling?.originalUserMessage || userMessage,
        user_context: userContext,
        parameters: paramsToSend,
        slot_filling: backendSlotFillingState,
        session_id: sessionIdRef.current,
      };
      try {
        const data = await fetchAgentChat(body);
        setAllCollectedParams(data.collected_parameters || allCollectedParams);
        if (data.history && Array.isArray(data.history)) {
          setMessages(
            data.history.map((h) => ({
              sender: h.sender,
              text: h.text,
              ...(h.result ? { result: h.result } : {}),
            }))
          );
        } else if (
          data.status === "need_parameters" &&
          data.missing_parameters.length > 0
        ) {
          const originalMessage =
            slotFilling?.originalUserMessage || userMessage;
          setSlotFilling({
            originalUserMessage: originalMessage,
            backendSlotFilling: {
              endpoint: data.endpoint,
              missing_parameters: data.missing_parameters,
            },
            currentParameter: data.missing_parameters[0],
            remainingParams: data.missing_parameters.slice(1),
            state: "required_param",
            collected_parameters: paramsToSend,
          });
          setMessages((msgs) => [
            ...msgs,
            { sender: "agent", text: data.prompt },
          ]);
        } else if (data.status === "need_optional_parameters") {
          const originalMessage =
            slotFilling?.originalUserMessage || userMessage;
          setSlotFilling({
            originalUserMessage: originalMessage,
            optionalParameters: data.optional_parameters,
            currentOptionalIndex: 0,
            currentOptional: data.optional_parameters[0],
            state: "ask_optional_yesno",
            prompt: data.prompt,
            collected_parameters: data.collected_parameters,
          });
          setAllCollectedParams(data.collected_parameters);
          setMessages((msgs) => [
            ...msgs,
            { sender: "agent", text: data.prompt },
          ]);
        } else if (data.status === "success") {
          setMessages((msgs) => [
            ...msgs,
            {
              sender: "agent",
              text: Array.isArray(data.result)
                ? "İşlem tamamlandı! Sonuç: " + JSON.stringify(data.result)
                : `İşlem tamamlandı! Sonuç: ${JSON.stringify(data.result)}`,
              result: data.result,
            },
          ]);
          setSlotFilling(null);
          setAllCollectedParams({});
        } else {
          setMessages((msgs) => [
            ...msgs,
            { sender: "agent", text: data.message || "Bir hata oluştu." },
          ]);
          setSlotFilling(null);
          setAllCollectedParams({});
        }
      } catch (error) {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            text: "Bağlantı hatası: Backend sunucusuna ulaşılamıyor.",
          },
        ]);
        setSlotFilling(null);
        setAllCollectedParams({});
      }
      setLoading(false);
    },
    [selectedApp, slotFilling, userContext, allCollectedParams]
  );

  const handleOptionalValue = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim()) return;
      setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
      const updatedParams = {
        ...slotFilling.collected_parameters,
        [slotFilling.currentOptional]: input,
      };
      await sendMessage(slotFilling.originalUserMessage, null, updatedParams);
      setSlotFilling(null);
      setInput("");
    },
    [input, slotFilling, sendMessage]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!input.trim() || !selectedApp) return;
      if (slotFilling) {
        if (slotFilling.state === "ask_optional_value") {
          await handleOptionalValue(e);
        } else if (slotFilling.state === "required_param") {
          const updatedParams = {
            ...allCollectedParams,
            [slotFilling.currentParameter]: input,
          };
          setAllCollectedParams(updatedParams);
          setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
          if (slotFilling.remainingParams.length === 0) {
            await sendMessage(
              slotFilling.originalUserMessage,
              slotFilling.backendSlotFilling,
              updatedParams
            );
          } else {
            setSlotFilling({
              ...slotFilling,
              currentParameter: slotFilling.remainingParams[0],
              remainingParams: slotFilling.remainingParams.slice(1),
              collected_parameters: updatedParams,
            });
            setMessages((msgs) => [
              ...msgs,
              {
                sender: "agent",
                text: `Please provide: ${slotFilling.remainingParams[0]}`,
              },
            ]);
          }
        }
      } else {
        setAllCollectedParams({});
        await sendMessage(input, null, {});
      }
      setInput("");
    },
    [
      input,
      selectedApp,
      slotFilling,
      allCollectedParams,
      sendMessage,
      handleOptionalValue,
    ]
  );

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setSlotFilling(null);
    setAllCollectedParams({});
  }, []);

  // Memoize the returned object to avoid unnecessary rerenders
  return useMemo(
    () => ({
      apps,
      selectedApp,
      setSelectedApp,
      handleAppChange,
      messages,
      setMessages,
      input,
      setInput,
      userContext,
      slotFilling,
      setSlotFilling,
      allCollectedParams,
      setAllCollectedParams,
      loading,
      setLoading,
      messagesEndRef,
      handleOptionalYesNo,
      handleOptionalValue,
      handleSubmit,
      handleClearChat,
    }),
    [
      apps,
      selectedApp,
      handleAppChange,
      messages,
      input,
      userContext,
      slotFilling,
      allCollectedParams,
      loading,
      handleOptionalYesNo,
      handleOptionalValue,
      handleSubmit,
      handleClearChat,
    ]
  );
};

export default useAgentChat;
