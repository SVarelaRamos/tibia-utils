import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { cn } from "./lib/utils";
import SumaryStats from "./SummaryStats";
import {
  parseSessionData,
  SessionSummary,
  validateSplitLootEntry,
} from "./utils";

function App() {
  const [isValid, setIsValid] = useState<undefined | boolean>(undefined);
  const [text, setText] = useState("");
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const validateAndParseText = useCallback((input: string) => {
    console.log("Validating and parsing text:", input); // Debug log
    const isValidInput = validateSplitLootEntry(input);
    console.log("Is valid input:", isValidInput); // Debug log
    setIsValid(isValidInput);
    setError(null);

    if (isValidInput) {
      try {
        const summary = parseSessionData(input);
        console.log("Parsed summary:", summary); // Debug log
        setSessionSummary(summary);
      } catch (error) {
        console.error("Error parsing session data:", error);
        setSessionSummary(null);
        setError("Error parsing session data. Please check the input format.");
      }
    } else {
      setSessionSummary(null);
      if (input.trim() !== "") {
        setError("Invalid input format. Please check your data.");
      }
    }
  }, []);

  useEffect(() => {
    validateAndParseText(text);
  }, [text, validateAndParseText]);

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText.toString());
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Button onClick={handlePasteFromClipboard}>Paste</Button>
        <Textarea
          className={cn("mb-10")}
          rows={isValid ? 5 : 5}
          onChange={handleOnChange}
          value={text}
        />
        {!isValid && <p>{error}</p>}
      </div>
      {sessionSummary && <SumaryStats sessionSummary={sessionSummary} />}
    </>
  );
}

export default App;
