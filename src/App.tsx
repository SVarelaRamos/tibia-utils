import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import Component from "./game-stats-minimal-legend";
import { cn } from "./lib/utils";
import {
  parseSessionData,
  SessionSummary,
  validateSplitLootEntry,
} from "./utils";

const example = `Session data: From 2024-05-31, 18:09:33 to 2024-05-31, 18:42:23
Session: 00:32h
Loot Type: Leader
Loot: 5,411,718
Supplies: 751,174
Balance: 4,660,544
Chodzacy zduchami tanno
  Loot: 1,034,322
  Supplies: 205,934
  Balance: 828,388
  Damage: 203,026
  Healing: 237,961
Lost Cizu
  Loot: 779,176
  Supplies: 230,766
  Balance: 548,410
  Damage: 34,323
  Healing: 358,318
Mrufff
  Loot: 1,312,701
  Supplies: 19,289
  Balance: 1,293,412
  Damage: 5,786
  Healing: 12,777
Radosny Radek
  Loot: 1,103,250
  Supplies: 145,684
  Balance: 957,566
  Damage: 394,884
  Healing: 153,799
Warkant (Leader)
  Loot: 1,182,269
  Supplies: 149,501
  Balance: 1,032,768
  Damage: 277,838
  Healing: 429,242
`;
function App() {
  const [isValid, setIsValid] = useState<undefined | boolean>(undefined);
  const [text, setText] = useState(example);
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
      {sessionSummary && <Component sessionSummary={sessionSummary} />}
    </>
  );
}

export default App;
