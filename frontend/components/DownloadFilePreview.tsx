import CodeMirror, { basicSetup, EditorView } from "@uiw/react-codemirror";

export default function DownloadFilePreview({
    transcriptText,
}: {
    transcriptText: string;
}) {
    return (
        <div>
            <CodeMirror
                value={transcriptText}
                extensions={[
                    EditorView.lineWrapping,
                    basicSetup({
                        foldGutter: false,
                    }),
                    EditorView.theme({
                        "&": {
                            borderRadius: "0.5rem",
                            overflow: "hidden",
                        },
                        ".cm-editor": {
                            borderRadius: "0.5rem",
                        },
                        ".cm-scroller": {
                            borderRadius: "0.5rem",
                        },
                        ".cm-gutters": {
                            paddingLeft: "1rem",
                        },
                        ".cm-content": {
                            padding: "5%",
                            margin: "0",
                        },
                    }),
                ]}
                editable={false}
                maxWidth="100%"
                maxHeight="500px"
            />
        </div>
    );
}
