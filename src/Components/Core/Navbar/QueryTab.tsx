/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  ScrollArea,
  Stack,
  Table,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { RichTextEditor } from "@mantine/tiptap";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import { useContext, useEffect, useState } from "react";
import { GraphContext, GraphContextType } from "../Context/GraphContext";
import { generateUUID } from "three/src/math/MathUtils";
import { Quad } from "oxigraph";

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function QueryTab() {
  const [sparqlQuery, setSparqlQuery] = useLocalStorage({
    key: "sparql-query",
  });

  useEffect(() => {
    console.log("Test");
    console.log(sparqlQuery);
  }, []);

  const { simpleQuery, uriToPrefixString } = useContext(
    GraphContext
  ) as GraphContextType;
  const [rawContent, setRawContent] = useState<string>("No content yet");
  const [tableHead, setTableHead] = useState<any>(<thead></thead>);
  const [tableContent, setTableContent] = useState<any>(<tbody></tbody>);

  const editor: Editor = useEditor({
    extensions: [StarterKit, CodeBlockLowlight.configure({ lowlight })],
    content: `<pre><code readOnly>${sparqlQuery}</code></pre>`,
  });

  async function executeQuery(event) {
    console.log("Query:", editor.getText());
    setSparqlQuery(escapeHtml(editor.getText()));
    console.log("escaped:", escapeHtml(editor.getText()));
    let queryResult = await simpleQuery(editor.getText());
    console.log("Result", queryResult);
    let jsonResponse = convertToJSONContent(queryResult);

    setRawContent(JSON.stringify(jsonResponse, null, 2));
  }

  function convertToJSONContent(result: any[]): any {
    let tempJSON: any;

    if (result[0] instanceof Map) {
      tempJSON = {
        head: { vars: [] },
        results: {
          bindings: [],
        },
      };
      for (const [key] of result[0]) {
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
      let headVars: any[] = [];

      let tHead = (
        <thead>
          <tr>
            {tempJSON.head.vars.map((vars) => {
              headVars.push(vars);
              return <th>{vars}</th>;
            })}
          </tr>
        </thead>
      );
      setTableHead(tHead);

      let tContent = (
        <tbody>
          {tempJSON.results.bindings.map((bindings) => {
            return (
              <tr key={generateUUID()}>
                {headVars.map(function (value) {
                  console.log(
                    "prefixed: ",
                    uriToPrefixString(bindings[value].value)
                  );
                  return (
                    <th>
                      <Tooltip
                        color="blue"
                        position="top-start"
                        withArrow
                        label={bindings[value].value}
                        style={{ maxWidth: "100%" }}
                        multiline
                      >
                        <Text>{uriToPrefixString(bindings[value].value)}</Text>
                      </Tooltip>
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      );

      setTableContent(tContent);
    } else if (result[0] instanceof Quad) {
      console.log("Quad!");
      setTableHead(
        <thead>
          <tr key={"SPARQLResultHeads"}>
            <th>subject</th>
            <th>predicate</th>
            <th>object</th>
          </tr>
        </thead>
      );

      setTableContent(
        <tbody>
          {result.map((res) => {
            let quad: Quad = res;

            return (
              <tr key={generateUUID()}>
                <th>
                  <Tooltip
                    color="blue"
                    position="top-start"
                    withArrow
                    label={quad.subject.value}
                    style={{ maxWidth: "100%" }}
                    multiline
                  >
                    <Text>{uriToPrefixString(quad.subject.value)}</Text>
                  </Tooltip>
                </th>
                <th>
                  <Tooltip
                    color="blue"
                    position="top-start"
                    withArrow
                    label={quad.predicate.value}
                    style={{ maxWidth: "100%" }}
                    multiline
                  >
                    <Text>{uriToPrefixString(quad.predicate.value)}</Text>
                  </Tooltip>
                </th>
                <th>
                  <Tooltip
                    color="blue"
                    position="top-start"
                    withArrow
                    label={quad.object.value}
                    style={{ maxWidth: "100%" }}
                    multiline
                  >
                    <Text>{uriToPrefixString(quad.object.value)}</Text>
                  </Tooltip>
                </th>
              </tr>
            );
          })}
        </tbody>
      );
    }
    console.log(tempJSON);
    return tempJSON;
  }

  return (
    <Stack
      align="stretch"
      justify="flex-start"
      style={{ height: "100%", width: "100%" }}
    >
      <Title order={2}>SPARQL Query</Title>
      <ScrollArea>
        <RichTextEditor
          editor={editor}
          style={{ width: "100%", minHeight: "300px", maxHeight: "700px" }}
        >
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.CodeBlock />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
      </ScrollArea>
      <Button onClick={executeQuery}>Execute Query</Button>
      <Title order={2}>Results</Title>
      <ScrollArea
        mx=""
        style={{ height: "100%", maxWidth: "100%" }}
        type="always"
      >
        <Tabs defaultValue="table" variant="outline">
          <Tabs.List grow>
            <Tabs.Tab value="table">Table</Tabs.Tab>
            <Tabs.Tab value="raw">Raw Content</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="raw" pt="xs">
            <Text>{rawContent}</Text>
          </Tabs.Panel>
          <Tabs.Panel value="table" pt="xs">
            <Table width={"100%"}>
              {tableHead}
              {tableContent}
            </Table>
          </Tabs.Panel>
        </Tabs>{" "}
      </ScrollArea>
    </Stack>
  );
}
