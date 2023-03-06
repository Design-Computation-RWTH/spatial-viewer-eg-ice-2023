import {
  Button,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { RichTextEditor } from "@mantine/tiptap";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import Code from "@tiptap/extension-code";
import { useContext, useState } from "react";
import { GraphContext, GraphContextType } from "../Context/GraphContext";
import { table } from "console";
import { generateUUID } from "three/src/math/MathUtils";

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ViewerTab() {
  let codeExample = escapeHtml(`
  SELECT ?s ?p ?o

  WHERE {?s ?p ?o}
  
  Limit 10
  `);

  const { simpleQuery, uriToPrefixString } = useContext(
    GraphContext
  ) as GraphContextType;
  const [rawContent, setRawContent] = useState<string>("No content yet");
  const [tableHead, setTableHead] = useState<any>(<thead></thead>);
  const [tableContent, setTableContent] = useState<any>(<tbody></tbody>);

  const editor: Editor = useEditor({
    extensions: [StarterKit, Code, CodeBlockLowlight.configure({ lowlight })],
    content: `<pre><code readOnly>${codeExample}</code></pre>`,
  });

  async function executeQuery(event) {
    console.log("Query:", editor.getText());
    let queryResult = await simpleQuery(editor.getText());
    console.log("Result", queryResult);
    let jsonResponse = convertToJSONContent(queryResult);

    setRawContent(JSON.stringify(jsonResponse, null, 2));

    let headVars: any[] = [];

    let tHead = (
      <thead>
        <tr>
          {jsonResponse.head.vars.map((vars, index) => {
            headVars.push(vars);
            return <th>{vars}</th>;
          })}
        </tr>
      </thead>
    );
    setTableHead(tHead);

    let tContent = (
      <tbody>
        {jsonResponse.results.bindings.map((bindings, index) => {
          return (
            <tr key={generateUUID()}>
              {headVars.map(function (value) {
                console.log(
                  "prefixed: ",
                  uriToPrefixString(bindings[value].value)
                );
                return <th>{uriToPrefixString(bindings[value].value)}</th>;
              })}
            </tr>
          );
        })}
      </tbody>
    );

    setTableContent(tContent);
  }

  function convertToJSONContent(result: any[]): any {
    let tempJSON: any = {
      head: { vars: [] },
      results: {
        bindings: [],
      },
    };

    if (result[0] instanceof Map) {
      for (const [key, value] of result[0]) {
        tempJSON.head.vars.push(key);
      }

      for (const entry of result) {
        let entryRes = {};
        for (const [key, value] of entry.entries()) {
          let termType: string;
          if (value.termType === "NamedNode") termType = "uri";
          else termType = value.termType;

          entryRes[key] = {
            type: termType,
            value: value.value,
          };

          if (value.datatype) {
            let datatype: string;
            if (value.datatype === "NamedNode") datatype = "uri";
            else datatype = value.datatype;

            entryRes[key] = {
              type: termType,
              value: value.value,
              datatype: datatype,
            };
          }
        }
        tempJSON.results.bindings.push(entryRes);
      }
    }
    console.log(tempJSON);
    return tempJSON;
  }

  return (
    <Stack style={{ height: "100%", width: "100%" }} justify="flex-start">
      <Title order={2}>SPARQL Query</Title>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.CodeBlock />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor>
      <Button onClick={executeQuery}>Execute Query</Button>
      <Title order={2}>Results</Title>
      <ScrollArea.Autosize
        maxHeight={500}
        mx="xs"
        style={{ height: "100%", maxWidth: "100%" }}
        type="always"
        offsetScrollbars
      >
        <Tabs defaultValue="table" style={{ height: "100%", width: "100%" }}>
          <Tabs.List>
            <Tabs.Tab value="table">Table</Tabs.Tab>
            <Tabs.Tab value="raw">Raw Content</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel
            style={{ height: "100%", width: "100%" }}
            value="raw"
            pt="xs"
          >
            <Text>{rawContent}</Text>
          </Tabs.Panel>

          <Tabs.Panel value="table" pt="xs">
            <Table>
              {tableHead}
              {tableContent}
            </Table>
          </Tabs.Panel>
        </Tabs>
      </ScrollArea.Autosize>
    </Stack>
  );
}
