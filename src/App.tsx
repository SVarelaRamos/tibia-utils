import { useState } from "react";
import "./App.css";
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
  const [valid, setValid] = useState<undefined | boolean>(undefined);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(
    null
  );
  const handleOnChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const newValue = e.currentTarget.value;
    const isValid = validateSplitLootEntry(newValue);
    setValid(isValid);
    if (isValid) {
      setSessionSummary(parseSessionData(newValue));
    } else {
      setSessionSummary(null);
    }
  };
  const borderColor =
    valid === undefined ? "inherit" : valid === true ? "green" : "red";
  const numPartyMembers =
    sessionSummary && sessionSummary?.damageDistribution.length;
  const transactionsByPlayer = sessionSummary?.transferInstructions.reduce(
    (r, a) => {
      r[a.from] = r[a.from] || [];
      r[a.from].push(a);
      return r;
    },
    Object.create(null)
  );
  return (
    <>
      <textarea
        rows={valid ? 5 : 20}
        style={{ border: "2px solid", borderColor }}
        onChange={handleOnChange}
      >
        {example}
      </textarea>
      {sessionSummary && (
        <section>
          <h3>Party hunt of {numPartyMembers} members</h3>
          <dl>
            <dt>Total Balance:</dt>
            <dd>{sessionSummary.totalBalance}</dd>
            <dt>Individual Balance:</dt>
            <dd>{sessionSummary.individualBalance}</dd>
            <dt>Loot per hour:</dt>
            <dd>{sessionSummary.lootPerHour}</dd>
          </dl>
          {Object.keys(transactionsByPlayer).map((key) => {
            return (
              <>
                <h4>{key}</h4>
                {transactionsByPlayer[key].map((transaction) => {
                  return (
                    <p>
                      {`pay ${transaction.amount} to `}
                      <em>{transaction.to}</em>
                    </p>
                  );
                })}
              </>
            );
          })}
        </section>
      )}
      {sessionSummary && (
        <code>
          <pre>{JSON.stringify(sessionSummary, null, 2)}</pre>
        </code>
      )}
    </>
  );
}

export default App;
